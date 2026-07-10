import { parseComparableSaleFilter } from "../domain/comparableSaleFilter";
import { NotFoundError, UnsupportedPropertyError, UserInputError } from "../domain/errors";
import { parsePrintComparableLimit } from "../domain/printOptions";
import { GITHUB_ISSUES_REPOSITORY } from "../domain/publicConfig";
import { parseSimilarityMax } from "../domain/similarityBands";
import { appShell } from "./appShell";
import { CloudflareCacheStore, sharedMemoryCache } from "./cache";
import { buildCasePayload } from "./casePayload";
import { FixtureRepository } from "./fixtureRepository";
import { ConcurrencyLimiter, QueueTimeoutError } from "./limiter";
import { QUEUED_MESSAGE } from "./messages";
import { buildPrintReport } from "./printReport";
import { type CaseRepository, SocrataRepository } from "./repository";
import { SocrataClient, friendlyDataError } from "./socrataClient";

interface OptionalSecrets {
  TURNSTILE_SECRET_KEY?: string;
  GITHUB_ISSUES_TOKEN?: string;
  RESEND_API_KEY?: string;
}

export type RuntimeEnv = Partial<Env> & OptionalSecrets;

const ASSESSMENT_CONCURRENCY = 4;
const ASSESSMENT_QUEUE_TIMEOUT_MS = 60_000;
const REPORT_PAYLOAD_LIMIT = 10_000;
const CONTACT_RECIPIENT = "tommaso.desantis@mail.com";
const EXPECTED_GITHUB_ISSUE_ACTOR = "tdsdesa-bot";
const RESEND_EMAILS_URL = "https://api.resend.com/emails";
const QUEUE_TIMEOUT_MESSAGE =
  "Appeal Compass is busy helping other homeowners right now. Your assessment did not start within a minute. Please try again in a moment.";
const sharedAssessmentLimiter = new ConcurrencyLimiter(ASSESSMENT_CONCURRENCY);

const REPORT_CATEGORIES = {
  wrong_deadline: { label: "Wrong deadline", githubLabel: "wrong-deadline" },
  wrong_jurisdiction: { label: "Wrong jurisdiction info", githubLabel: "wrong-jurisdiction" },
  wrong_comparables: { label: "Wrong comparables", githubLabel: "wrong-comparables" },
  wrong_assessment_data: { label: "Wrong assessment data", githubLabel: "wrong-assessment-data" },
  feature_request: { label: "Feature request", githubLabel: "feature-request" },
} as const;

interface RepositorySelection {
  repo: CaseRepository;
  demo: boolean;
}

interface WorkerOptions {
  assessmentLimiter?: ConcurrencyLimiter;
  queueTimeoutMs?: number;
  caseBuilder?: typeof buildCasePayload;
  repositoryFactory?: (url: URL, env: RuntimeEnv) => RepositorySelection;
}

interface WorkerHandler {
  fetch(request: Request, env: RuntimeEnv): Promise<Response>;
}

function json(data: unknown, status = 200, headers: HeadersInit = {}): Response {
  return Response.json(data, {
    status,
    headers: {
      "cache-control": "no-store",
      ...headers,
    },
  });
}

function replaceControlCharacters(value: string): string {
  let output = "";
  for (const char of value) {
    const code = char.charCodeAt(0);
    output += code < 32 || code === 127 ? " " : char;
  }
  return output;
}

function sanitizeText(value: unknown, maxLength: number): string {
  return replaceControlCharacters(String(value ?? "").replace(/<[^>]*>/g, ""))
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

function clientKey(request: Request): string {
  return request.headers.get("cf-connecting-ip") ?? "unknown";
}

async function isRateLimited(limiter: RateLimit | undefined, request: Request): Promise<boolean> {
  if (!limiter) {
    return false;
  }
  const result = await limiter.limit({ key: clientKey(request) });
  return !result.success;
}

function rateLimitedResponse(message: string): Response {
  return json({ ok: false, error: { kind: "rate_limited", message } }, 429, {
    "retry-after": "60",
  });
}

async function reportJson(request: Request): Promise<Record<string, unknown>> {
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (Number.isFinite(contentLength) && contentLength > REPORT_PAYLOAD_LIMIT) {
    throw new UserInputError("Report is too large.");
  }
  const text = await request.text();
  if (text.length > REPORT_PAYLOAD_LIMIT) {
    throw new UserInputError("Report is too large.");
  }
  const parsed = JSON.parse(text) as unknown;
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new UserInputError("Report payload is invalid.");
  }
  return parsed as Record<string, unknown>;
}

async function contactJson(request: Request): Promise<Record<string, unknown>> {
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (Number.isFinite(contentLength) && contentLength > REPORT_PAYLOAD_LIMIT) {
    throw new UserInputError("Contact message is too large.");
  }
  const text = await request.text();
  if (text.length > REPORT_PAYLOAD_LIMIT) {
    throw new UserInputError("Contact message is too large.");
  }
  const parsed = JSON.parse(text) as unknown;
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new UserInputError("Contact payload is invalid.");
  }
  return parsed as Record<string, unknown>;
}

async function verifyTurnstile(
  token: string,
  request: Request,
  secret: string,
  expectedAction: string,
): Promise<boolean> {
  const form = new FormData();
  form.set("secret", secret);
  form.set("response", token);
  const remoteIp = request.headers.get("cf-connecting-ip");
  if (remoteIp) {
    form.set("remoteip", remoteIp);
  }
  try {
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: form,
    });
    const result = (await response.json().catch(() => ({}))) as {
      success?: boolean;
      action?: string;
    };
    return response.ok && result.success === true && result.action === expectedAction;
  } catch {
    return false;
  }
}

type GithubIssueResult = { ok: true; issueUrl: string } | { ok: false; reason: "actor" | "github" };

async function createGithubIssue(input: {
  token: string;
  category: (typeof REPORT_CATEGORIES)[keyof typeof REPORT_CATEGORIES];
  description: string;
  context: string;
}): Promise<GithubIssueResult> {
  const commonHeaders = {
    accept: "application/vnd.github+json",
    authorization: `Bearer ${input.token}`,
    "user-agent": "appeal-compass",
  };
  let actorResponse: Response;
  try {
    actorResponse = await fetch("https://api.github.com/user", {
      headers: commonHeaders,
    });
  } catch {
    return { ok: false, reason: "github" };
  }
  const actor = (await actorResponse.json().catch(() => ({}))) as { login?: string };
  if (
    !actorResponse.ok ||
    actor.login?.toLowerCase() !== EXPECTED_GITHUB_ISSUE_ACTOR.toLowerCase()
  ) {
    return { ok: false, reason: actorResponse.ok ? "actor" : "github" };
  }

  const body = [
    "Submitted through the Appeal Compass report form.",
    "",
    `Category: ${input.category.label}`,
    "",
    "Description:",
    input.description,
    "",
    "Context:",
    input.context || "Not provided",
  ].join("\n");
  let response: Response;
  try {
    response = await fetch(`https://api.github.com/repos/${GITHUB_ISSUES_REPOSITORY}/issues`, {
      method: "POST",
      headers: {
        ...commonHeaders,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        title: `[${input.category.label}] Appeal Compass report`,
        body,
        labels: ["appeal-compass-report", input.category.githubLabel],
      }),
    });
  } catch {
    return { ok: false, reason: "github" };
  }
  if (!response.ok) {
    return { ok: false, reason: "github" };
  }
  const result = (await response.json().catch(() => ({}))) as { html_url?: string };
  return result.html_url
    ? { ok: true, issueUrl: result.html_url }
    : { ok: false, reason: "github" };
}

function validOptionalEmail(email: string): boolean {
  return email === "" || /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email);
}

async function sendContactEmail(input: {
  token: string;
  name: string;
  email: string;
  message: string;
}): Promise<boolean> {
  const topicLabel = "commercial-property inquiry";
  const body: Record<string, unknown> = {
    from: "Appeal Compass <onboarding@resend.dev>",
    to: [CONTACT_RECIPIENT],
    subject: `Appeal Compass ${topicLabel}`,
    text: [
      `Submitted through the Appeal Compass ${topicLabel} form.`,
      "",
      `Name: ${input.name || "Not provided"}`,
      `Email: ${input.email || "Not provided"}`,
      "",
      "Message:",
      input.message,
    ].join("\n"),
  };
  if (input.email) {
    body.reply_to = input.email;
  }
  try {
    const response = await fetch(RESEND_EMAILS_URL, {
      method: "POST",
      headers: {
        authorization: `Bearer ${input.token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(body),
    });
    return response.ok;
  } catch {
    return false;
  }
}

function cacheStore() {
  return typeof caches === "undefined" ? sharedMemoryCache : new CloudflareCacheStore();
}

function repositoryFor(url: URL, env: RuntimeEnv): RepositorySelection {
  if (url.searchParams.get("demo") === "1" || url.searchParams.get("demo") === "true") {
    return { repo: new FixtureRepository(), demo: true };
  }
  return {
    repo: new SocrataRepository(
      new SocrataClient({
        ...(env.SOCRATA_APP_TOKEN ? { appToken: env.SOCRATA_APP_TOKEN } : {}),
        cache: cacheStore(),
      }),
    ),
    demo: false,
  };
}

function errorResponse(error: unknown): Response {
  if (error instanceof QueueTimeoutError) {
    return json(
      {
        ok: false,
        error: {
          kind: "queue_timeout",
          message: QUEUE_TIMEOUT_MESSAGE,
        },
      },
      503,
    );
  }
  if (error instanceof UnsupportedPropertyError) {
    return json(
      {
        ok: false,
        error: {
          kind: "unsupported_property",
          message: error.message,
          pinFormatted: error.pinFormatted,
          propertyClass: error.propertyClass,
          category: error.category,
        },
      },
      422,
    );
  }
  if (error instanceof UserInputError) {
    return json({ ok: false, error: { kind: "input", message: error.message } }, 400);
  }
  if (error instanceof NotFoundError) {
    return json({ ok: false, error: { kind: "not_found", message: error.message } }, 404);
  }
  const friendly = friendlyDataError(error);
  const status = friendly.kind === "transient_http" || friendly.kind === "network" ? 503 : 502;
  return json({ ok: false, error: friendly }, status);
}

function queueStatus(limiter: ConcurrencyLimiter) {
  const active = limiter.activeCount;
  const queued = limiter.pendingCount;
  return {
    ok: true,
    limit: limiter.limit,
    active,
    queued,
    busy: active >= limiter.limit || queued > 0,
    message: active >= limiter.limit || queued > 0 ? QUEUED_MESSAGE : null,
  };
}

async function handleReport(request: Request, env: RuntimeEnv): Promise<Response> {
  if (!env.TURNSTILE_SECRET_KEY || !env.GITHUB_ISSUES_TOKEN) {
    return json(
      {
        ok: false,
        error: {
          kind: "configuration",
          message: "Problem reporting is not configured yet.",
        },
      },
      503,
    );
  }
  if (await isRateLimited(env.SUBMISSION_RATE_LIMITER, request)) {
    return rateLimitedResponse("Too many submissions from this connection. Try again shortly.");
  }

  let payload: Record<string, unknown>;
  try {
    payload = await reportJson(request);
  } catch (error) {
    return errorResponse(error);
  }

  const categoryKey = sanitizeText(payload.category, 80);
  const category = REPORT_CATEGORIES[categoryKey as keyof typeof REPORT_CATEGORIES];
  const description = sanitizeText(payload.description, 4000);
  const context = sanitizeText(payload.context, 2000);
  const turnstileToken = sanitizeText(payload.turnstileToken, 2048);
  if (!category) {
    return json({ ok: false, error: { kind: "input", message: "Choose a report category." } }, 400);
  }
  if (!description) {
    return json(
      {
        ok: false,
        error: { kind: "input", message: "Describe the problem or feature request." },
      },
      400,
    );
  }
  if (!turnstileToken) {
    return json(
      { ok: false, error: { kind: "input", message: "Complete the verification challenge." } },
      400,
    );
  }

  const turnstileOk = await verifyTurnstile(
    turnstileToken,
    request,
    env.TURNSTILE_SECRET_KEY,
    "feedback",
  );
  if (!turnstileOk) {
    return json(
      { ok: false, error: { kind: "turnstile", message: "Verification failed. Try again." } },
      400,
    );
  }

  const issue = await createGithubIssue({
    token: env.GITHUB_ISSUES_TOKEN,
    category,
    description,
    context,
  });
  if (!issue.ok) {
    return json(
      {
        ok: false,
        error: {
          kind: issue.reason === "actor" ? "configuration" : "github",
          message:
            issue.reason === "actor"
              ? "Issue reporting must be authenticated as tdsdesa-bot."
              : "The report could not be submitted right now. Try again later.",
        },
      },
      issue.reason === "actor" ? 503 : 502,
    );
  }
  return json({ ok: true, issueUrl: issue.issueUrl });
}

async function handleContact(request: Request, env: RuntimeEnv): Promise<Response> {
  if (!env.TURNSTILE_SECRET_KEY || !env.RESEND_API_KEY) {
    return json(
      {
        ok: false,
        error: {
          kind: "configuration",
          message: "Contact form is not configured yet.",
        },
      },
      503,
    );
  }
  if (await isRateLimited(env.SUBMISSION_RATE_LIMITER, request)) {
    return rateLimitedResponse("Too many submissions from this connection. Try again shortly.");
  }

  let payload: Record<string, unknown>;
  try {
    payload = await contactJson(request);
  } catch (error) {
    return errorResponse(error);
  }

  const name = sanitizeText(payload.name, 120);
  const email = sanitizeText(payload.email, 254);
  const message = sanitizeText(payload.message, 4000);
  const turnstileToken = sanitizeText(payload.turnstileToken, 2048);
  if (!message) {
    return json({ ok: false, error: { kind: "input", message: "Write a message." } }, 400);
  }
  if (!validOptionalEmail(email)) {
    return json(
      {
        ok: false,
        error: { kind: "input", message: "Enter a valid email address or leave it blank." },
      },
      400,
    );
  }
  if (!turnstileToken) {
    return json(
      { ok: false, error: { kind: "input", message: "Complete the verification challenge." } },
      400,
    );
  }

  const turnstileOk = await verifyTurnstile(
    turnstileToken,
    request,
    env.TURNSTILE_SECRET_KEY,
    "commercial_interest",
  );
  if (!turnstileOk) {
    return json(
      { ok: false, error: { kind: "turnstile", message: "Verification failed. Try again." } },
      400,
    );
  }

  const sent = await sendContactEmail({
    token: env.RESEND_API_KEY,
    name,
    email,
    message,
  });
  if (!sent) {
    return json(
      {
        ok: false,
        error: {
          kind: "resend",
          message: "The message could not be sent right now. Try again later.",
        },
      },
      502,
    );
  }
  return json({ ok: true, message: "Message sent." });
}

export function createWorker(options: WorkerOptions = {}): WorkerHandler {
  const assessmentLimiter = options.assessmentLimiter ?? sharedAssessmentLimiter;
  const queueTimeoutMs = options.queueTimeoutMs ?? ASSESSMENT_QUEUE_TIMEOUT_MS;
  const caseBuilder = options.caseBuilder ?? buildCasePayload;
  const repositoryFactory = options.repositoryFactory ?? repositoryFor;

  async function buildQueuedCasePayload(
    repo: CaseRepository,
    params: URLSearchParams,
    demo: boolean,
  ) {
    return assessmentLimiter.run(() => caseBuilder(repo, params, demo), {
      maxQueueWaitMs: queueTimeoutMs,
    });
  }

  return {
    async fetch(request: Request, env: RuntimeEnv): Promise<Response> {
      const url = new URL(request.url);

      if (url.pathname === "/api/health") {
        return json({
          ok: true,
          service: "Appeal Compass",
        });
      }

      if (url.pathname === "/api/queue") {
        return json(queueStatus(assessmentLimiter));
      }

      if (url.pathname === "/api/report") {
        if (request.method !== "POST") {
          return json(
            { ok: false, error: { kind: "method", message: "Use POST for reports." } },
            405,
          );
        }
        return handleReport(request, env);
      }

      if (url.pathname === "/api/contact") {
        if (request.method !== "POST") {
          return json(
            { ok: false, error: { kind: "method", message: "Use POST for contact messages." } },
            405,
          );
        }
        return handleContact(request, env);
      }

      if (url.pathname === "/api/case") {
        try {
          if (await isRateLimited(env.CASE_RATE_LIMITER, request)) {
            return rateLimitedResponse(
              "Too many property searches from this connection. Try again shortly.",
            );
          }
          if (!url.searchParams.get("pin")) {
            throw new UserInputError("Enter a Cook County PIN.");
          }
          const { repo, demo } = repositoryFactory(url, env);
          return json(await buildQueuedCasePayload(repo, url.searchParams, demo));
        } catch (error) {
          return errorResponse(error);
        }
      }

      if (url.pathname === "/print") {
        try {
          if (await isRateLimited(env.CASE_RATE_LIMITER, request)) {
            return rateLimitedResponse(
              "Too many evidence-packet requests from this connection. Try again shortly.",
            );
          }
          if (!url.searchParams.get("pin")) {
            throw new UserInputError("Enter a Cook County PIN.");
          }
          const { repo, demo } = repositoryFactory(url, env);
          const payload = await buildQueuedCasePayload(repo, url.searchParams, demo);
          return new Response(
            buildPrintReport(payload, {
              maxSimilarity: parseSimilarityMax(url.searchParams.get("maxSimilarity")),
              saleFilter: parseComparableSaleFilter(url.searchParams.get("saleFilter")),
              maxComps: parsePrintComparableLimit(url.searchParams.get("maxComps")),
            }),
            {
              headers: { "content-type": "text/html;charset=utf-8" },
            },
          );
        } catch (error) {
          return errorResponse(error);
        }
      }

      if (url.pathname.startsWith("/api/")) {
        return json(
          { ok: false, error: { kind: "not_found", message: "API endpoint not found." } },
          404,
        );
      }

      if (
        url.pathname === "/" ||
        url.pathname === "/index.html" ||
        url.pathname === "/methodology"
      ) {
        return new Response(appShell(), {
          headers: { "content-type": "text/html;charset=utf-8" },
        });
      }

      if (env.ASSETS) {
        return env.ASSETS.fetch(request);
      }

      return new Response("Appeal Compass", {
        headers: { "content-type": "text/plain;charset=utf-8" },
      });
    },
  } satisfies WorkerHandler;
}

const worker = createWorker();

export default worker satisfies ExportedHandler<RuntimeEnv>;

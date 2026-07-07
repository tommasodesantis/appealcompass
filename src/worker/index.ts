import { NotFoundError, UserInputError } from "../domain/errors";
import { CloudflareCacheStore, sharedMemoryCache } from "./cache";
import { buildCasePayload } from "./casePayload";
import { FixtureRepository } from "./fixtureRepository";
import { ConcurrencyLimiter, QueueTimeoutError } from "./limiter";
import { buildPrintReport } from "./printReport";
import { type CaseRepository, SocrataRepository } from "./repository";
import { SocrataClient, friendlyDataError } from "./socrataClient";

export interface Env {
  ASSETS?: Fetcher;
  SOCRATA_APP_TOKEN?: string;
}

const ASSESSMENT_CONCURRENCY = 4;
const ASSESSMENT_QUEUE_TIMEOUT_MS = 60_000;
export const QUEUED_MESSAGE =
  "Appeal Compass is busy helping other homeowners right now. You're in line — keep this page open and your assessment will start automatically.";
const QUEUE_TIMEOUT_MESSAGE =
  "Appeal Compass is busy helping other homeowners right now. Your assessment did not start within a minute. Please try again in a moment.";
const sharedAssessmentLimiter = new ConcurrencyLimiter(ASSESSMENT_CONCURRENCY);

interface RepositorySelection {
  repo: CaseRepository;
  demo: boolean;
}

interface WorkerOptions {
  assessmentLimiter?: ConcurrencyLimiter;
  queueTimeoutMs?: number;
  caseBuilder?: typeof buildCasePayload;
  repositoryFactory?: (url: URL, env: Env) => RepositorySelection;
}

interface WorkerHandler {
  fetch(request: Request, env: Env): Promise<Response>;
}

function json(data: unknown, status = 200): Response {
  return Response.json(data, {
    status,
    headers: {
      "cache-control": "no-store",
    },
  });
}

function cacheStore() {
  return typeof caches === "undefined" ? sharedMemoryCache : new CloudflareCacheStore();
}

function repositoryFor(url: URL, env: Env): RepositorySelection {
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
    async fetch(request: Request, env: Env): Promise<Response> {
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

      if (url.pathname === "/api/case") {
        try {
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
          if (!url.searchParams.get("pin")) {
            throw new UserInputError("Enter a Cook County PIN.");
          }
          const { repo, demo } = repositoryFactory(url, env);
          const payload = await buildQueuedCasePayload(repo, url.searchParams, demo);
          return new Response(buildPrintReport(payload), {
            headers: { "content-type": "text/html;charset=utf-8" },
          });
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

export default worker satisfies ExportedHandler<Env>;

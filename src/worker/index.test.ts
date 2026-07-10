import { readFileSync } from "node:fs";
import { UnsupportedPropertyError } from "../domain/errors";
import worker from "./index";
import { createWorker } from "./index";
import { ConcurrencyLimiter } from "./limiter";
import { QUEUED_MESSAGE } from "./messages";

const REQUIRED_STEP_ONE = "ownershipType=individual";
const REQUIRED_CASE_QUERY = `venue=assessor&${REQUIRED_STEP_ONE}`;

test("health endpoint returns a JSON status", async () => {
  const response = await worker.fetch(new Request("http://example.test/api/health"), {});
  expect(response.status).toBe(200);
  await expect(response.json()).resolves.toMatchObject({
    ok: true,
    service: "Appeal Compass",
  });
});

test("app shell includes configured Turnstile", async () => {
  const response = await worker.fetch(new Request("http://example.test/"), {});
  expect(response.status).toBe(200);
  const html = await response.text();
  expect(html).toContain("Appeal Compass");
  expect(html).toContain("challenges.cloudflare.com/turnstile/v0/api.js");
});

test("static asset shell loads Turnstile", () => {
  const html = readFileSync(new URL("../../public/index.html", import.meta.url), "utf8");
  expect(html).toContain("challenges.cloudflare.com/turnstile/v0/api.js");
});

test("fixture-mode case endpoint returns a computed case payload", async () => {
  const response = await worker.fetch(
    new Request(
      `http://example.test/api/case?demo=1&pin=03-00-000-000-0001&venue=bor&today=2025-07-10&${REQUIRED_STEP_ONE}`,
    ),
    {},
  );
  expect(response.status).toBe(200);
  const payload = (await response.json()) as CasePayloadWithSavings;
  expect(payload).toMatchObject({
    ok: true,
    demo: true,
    routing: {
      venue: "bor",
    },
    evidence: {
      tier: "STRONG",
    },
  });
  expect(payload.evidence.savingsAssumptions.taxRate).toBe(0.077774);
  expect(payload.evidence.savingsAssumptions.taxRateSource).toContain(
    "approximate parcel-specific rate 7.7774%",
  );
  expect(payload.evidence.savingsAssumptions.taxRateSource).toContain("tax code 10001");
  expect(JSON.stringify(payload)).toContain("NOT LEGAL ADVICE");
});

test("fixture-mode case endpoint labels the default tax-rate fallback", async () => {
  const response = await worker.fetch(
    new Request(
      `http://example.test/api/case?demo=1&pin=03-00-000-000-0040&venue=bor&today=2025-07-10&${REQUIRED_STEP_ONE}`,
    ),
    {},
  );
  expect(response.status).toBe(200);
  const payload = (await response.json()) as CasePayloadWithSavings;
  expect(payload.evidence.savingsAssumptions.taxRate).toBe(0.1);
  expect(payload.evidence.savingsAssumptions.taxRateSource).toContain(
    "county default assumption 10.00%",
  );
});

test.each([
  ["03-00-000-000-0001", "assessor", "2026-05-01", "assessor", "open"],
  ["03-00-000-000-0001", "bor", "2026-07-10", "bor", "upcoming"],
  ["03-00-000-000-0020", "assessor", "2026-05-01", "assessor", "open"],
  ["03-00-000-000-0030", "bor", "2026-07-10", "bor", "upcoming"],
  ["03-00-000-000-0040", "bor", "2026-07-10", "bor", "upcoming"],
])(
  "fixture endpoint handles %s at %s without crashing",
  async (pin, venue, today, expectedVenue, expectedStatus) => {
    const response = await worker.fetch(
      new Request(
        `http://example.test/api/case?demo=1&pin=${pin}&venue=${venue}&today=${today}&${REQUIRED_STEP_ONE}`,
      ),
      {},
    );
    expect(response.status).toBe(200);
    const payload = (await response.json()) as CasePayloadLike;
    expect(payload.routing.venue).toBe(expectedVenue);
    expect(payload.routing.actionStatus).toBe(expectedStatus);
    expect(JSON.stringify(payload)).not.toContain("Traceback");
  },
);

test("fixture endpoint surfaces PTAB awaiting-notice and expired states", async () => {
  const awaitingNotice = await worker.fetch(
    new Request(
      "http://example.test/api/case?demo=1&pin=03-00-000-000-0001&venue=ptab&today=2026-06-01&ownershipType=individual&borNoticeReceived=no",
    ),
    {},
  );
  expect(awaitingNotice.status).toBe(200);
  await expect(awaitingNotice.json()).resolves.toMatchObject({
    routing: {
      venue: "ptab",
      actionStatus: "upcoming",
      deadlineState: "awaiting_notice",
    },
  });

  const expired = await worker.fetch(
    new Request(
      "http://example.test/api/case?demo=1&pin=03-00-000-000-0001&venue=ptab&today=2026-07-06&ownershipType=individual&borNoticeReceived=yes&borNoticeDate=2026-05-20",
    ),
    {},
  );
  expect(expired.status).toBe(200);
  await expect(expired.json()).resolves.toMatchObject({
    routing: { venue: "ptab", actionStatus: "expired", deadline: "2026-06-22" },
  });
});

test("case endpoint returns user-facing errors", async () => {
  const response = await worker.fetch(
    new Request("http://example.test/api/case?demo=1&pin=bad"),
    {},
  );
  expect(response.status).toBe(400);
  await expect(response.json()).resolves.toMatchObject({
    ok: false,
    error: {
      kind: "input",
    },
  });
});

test.each([
  ["purchasePrice=400000", "Enter both the subject-property purchase price and purchase date."],
  [
    "purchasePrice=400000&purchaseDate=2024-01-01&appraisalValue=390000&appraisalDate=2024-02-01",
    "Enter either a purchase or an appraisal, not both.",
  ],
  ["appraisalValue=390000&appraisalDate=2024-02-30", "Enter a valid date for appraisal date."],
])(
  "case endpoint rejects incomplete or conflicting value evidence",
  async (valueQuery, message) => {
    const response = await worker.fetch(
      new Request(
        `http://example.test/api/case?demo=1&pin=03-00-000-000-0001&${REQUIRED_CASE_QUERY}&${valueQuery}`,
      ),
      {},
    );
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      ok: false,
      error: { kind: "input", message },
    });
  },
);

test("case endpoint returns a structured unsupported-property response", async () => {
  const testWorker = createWorker({
    caseBuilder: async () => {
      throw new UnsupportedPropertyError(
        "Residential dwellings only.",
        "17-19-411-044-0000",
        "318",
        "multi-family property",
      );
    },
  });
  const response = await testWorker.fetch(
    new Request(
      `http://example.test/api/case?demo=1&pin=17-19-411-044-0000&${REQUIRED_CASE_QUERY}`,
    ),
    {},
  );
  expect(response.status).toBe(422);
  await expect(response.json()).resolves.toMatchObject({
    ok: false,
    error: {
      kind: "unsupported_property",
      pinFormatted: "17-19-411-044-0000",
      propertyClass: "318",
      category: "multi-family property",
    },
  });
});

test("case endpoint requires an explicit venue", async () => {
  const response = await worker.fetch(
    new Request(`http://example.test/api/case?demo=1&pin=03-00-000-000-0001&${REQUIRED_STEP_ONE}`),
    {},
  );
  expect(response.status).toBe(400);
  await expect(response.json()).resolves.toMatchObject({
    ok: false,
    error: {
      kind: "input",
      message: "Choose where you want to appeal.",
    },
  });
});

test("case endpoint refuses entity-owned properties before assessment", async () => {
  const response = await worker.fetch(
    new Request(
      "http://example.test/api/case?demo=1&pin=03-00-000-000-0001&venue=assessor&ownershipType=llc",
    ),
    {},
  );
  expect(response.status).toBe(400);
  await expect(response.json()).resolves.toMatchObject({
    ok: false,
    error: {
      kind: "input",
      message:
        "Appeal Compass is designed only for individual residential homeowners appealing their own home; if interested in a similar tool for commercial properties please reach out here.",
    },
  });
});

test("case endpoint rejects unsupported jurisdictions", async () => {
  const response = await worker.fetch(
    new Request(
      `http://example.test/api/case?demo=1&pin=03-00-000-000-0001&jurisdiction=other&${REQUIRED_CASE_QUERY}`,
    ),
    {},
  );
  expect(response.status).toBe(400);
  await expect(response.json()).resolves.toMatchObject({
    ok: false,
    error: { kind: "input" },
  });
});

test("public demo endpoint is removed", async () => {
  const response = await worker.fetch(new Request("http://example.test/api/demo"), {});
  expect(response.status).toBe(404);
});

function reportRequest(ip: string, body: Record<string, unknown>): Request {
  return new Request("http://example.test/api/report", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "cf-connecting-ip": ip,
    },
    body: JSON.stringify(body),
  });
}

function contactRequest(ip: string, body: Record<string, unknown>): Request {
  return new Request("http://example.test/api/contact", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "cf-connecting-ip": ip,
    },
    body: JSON.stringify(body),
  });
}

function rateLimiter(success: boolean): RateLimit {
  return {
    limit: vi.fn().mockResolvedValue({ success }),
  } as unknown as RateLimit;
}

test("report endpoint verifies Turnstile and creates sanitized GitHub issue", async () => {
  const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    if (url.includes("turnstile")) {
      return Response.json({ success: true, action: "feedback" });
    }
    if (url === "https://api.github.com/user") {
      return Response.json({ login: "tdsdesa-bot" });
    }
    if (url.includes("/issues")) {
      const body = String(init?.body ?? "");
      expect(body).not.toContain("<b>");
      expect(body).not.toContain("turnstile-token");
      expect(body).toContain("Wrong deadline");
      return Response.json(
        { html_url: "https://github.com/tommasodesantis/appealcompass/issues/1" },
        { status: 201 },
      );
    }
    throw new Error(`Unexpected fetch ${url}`);
  });
  vi.stubGlobal("fetch", fetchMock);
  try {
    const response = await worker.fetch(
      reportRequest("10.0.0.1", {
        category: "wrong_deadline",
        description: "<b>Deadline is wrong</b>",
        context: "PIN 03-00-000-000-0001",
        turnstileToken: "turnstile-token",
      }),
      { TURNSTILE_SECRET_KEY: "turnstile-secret", GITHUB_ISSUES_TOKEN: "github-secret" },
    );
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      ok: true,
      issueUrl: "https://github.com/tommasodesantis/appealcompass/issues/1",
    });
    expect(fetchMock).toHaveBeenCalledTimes(3);
  } finally {
    vi.unstubAllGlobals();
  }
});

test("report endpoint rejects failed Turnstile verification", async () => {
  const fetchMock = vi.fn(async () => Response.json({ success: false }));
  vi.stubGlobal("fetch", fetchMock);
  try {
    const response = await worker.fetch(
      reportRequest("10.0.0.2", {
        category: "wrong_comparables",
        description: "Comps look wrong",
        turnstileToken: "bad-token",
      }),
      { TURNSTILE_SECRET_KEY: "turnstile-secret", GITHUB_ISSUES_TOKEN: "github-secret" },
    );
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      ok: false,
      error: { kind: "turnstile" },
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  } finally {
    vi.unstubAllGlobals();
  }
});

test("report endpoint fails closed when Turnstile validation is unavailable", async () => {
  const fetchMock = vi.fn().mockRejectedValue(new Error("network unavailable"));
  vi.stubGlobal("fetch", fetchMock);
  try {
    const response = await worker.fetch(
      reportRequest("10.0.0.21", {
        category: "wrong_comparables",
        description: "Comps look wrong",
        turnstileToken: "unverifiable-token",
      }),
      { TURNSTILE_SECRET_KEY: "turnstile-secret", GITHUB_ISSUES_TOKEN: "github-secret" },
    );
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      ok: false,
      error: { kind: "turnstile" },
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  } finally {
    vi.unstubAllGlobals();
  }
});

test("report endpoint rejects a Turnstile token issued for a different action", async () => {
  const fetchMock = vi.fn(async () =>
    Response.json({ success: true, action: "commercial_interest" }),
  );
  vi.stubGlobal("fetch", fetchMock);
  try {
    const response = await worker.fetch(
      reportRequest("10.0.0.22", {
        category: "wrong_comparables",
        description: "Comps look wrong",
        turnstileToken: "wrong-action-token",
      }),
      { TURNSTILE_SECRET_KEY: "turnstile-secret", GITHUB_ISSUES_TOKEN: "github-secret" },
    );
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      ok: false,
      error: { kind: "turnstile" },
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  } finally {
    vi.unstubAllGlobals();
  }
});

test("report endpoint returns friendly error when GitHub issue creation fails", async () => {
  const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
    const url = String(input);
    if (url.includes("turnstile")) {
      return Response.json({ success: true, action: "feedback" });
    }
    return Response.json({ message: "server error" }, { status: 500 });
  });
  vi.stubGlobal("fetch", fetchMock);
  try {
    const response = await worker.fetch(
      reportRequest("10.0.0.3", {
        category: "feature_request",
        description: "Please add a feature",
        turnstileToken: "ok-token",
      }),
      { TURNSTILE_SECRET_KEY: "turnstile-secret", GITHUB_ISSUES_TOKEN: "github-secret" },
    );
    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toMatchObject({
      ok: false,
      error: { kind: "github" },
    });
  } finally {
    vi.unstubAllGlobals();
  }
});

test("report endpoint refuses to create an issue when the token actor is not tdsdesa-bot", async () => {
  const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
    const url = String(input);
    if (url.includes("turnstile")) {
      return Response.json({ success: true, action: "feedback" });
    }
    if (url === "https://api.github.com/user") {
      return Response.json({ login: "tommasodesantis" });
    }
    throw new Error(`Unexpected fetch ${url}`);
  });
  vi.stubGlobal("fetch", fetchMock);
  try {
    const response = await worker.fetch(
      reportRequest("10.0.0.23", {
        category: "feature_request",
        description: "Please add a feature",
        turnstileToken: "ok-token",
      }),
      { TURNSTILE_SECRET_KEY: "turnstile-secret", GITHUB_ISSUES_TOKEN: "github-secret" },
    );
    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toMatchObject({
      ok: false,
      error: { kind: "configuration", message: expect.stringContaining("tdsdesa-bot") },
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  } finally {
    vi.unstubAllGlobals();
  }
});

test("contact endpoint verifies Turnstile and sends sanitized Resend email", async () => {
  const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    if (url.includes("turnstile")) {
      return Response.json({ success: true, action: "commercial_interest" });
    }
    if (url.includes("api.resend.com")) {
      expect(init?.headers).toMatchObject({ authorization: "Bearer resend-secret" });
      const body = String(init?.body ?? "");
      expect(body).toContain("Commercial Owner");
      expect(body).toContain("owner@example.com");
      expect(body).toContain("Need a commercial appeal tool");
      expect(body).not.toContain("<b>");
      expect(body).not.toContain("contact-token");
      return Response.json({ id: "email_123" }, { status: 200 });
    }
    throw new Error(`Unexpected fetch ${url}`);
  });
  vi.stubGlobal("fetch", fetchMock);
  try {
    const response = await worker.fetch(
      contactRequest("10.0.1.1", {
        name: "<b>Commercial Owner</b>",
        email: "owner@example.com",
        message: "<b>Need a commercial appeal tool</b>",
        turnstileToken: "contact-token",
      }),
      { TURNSTILE_SECRET_KEY: "turnstile-secret", RESEND_API_KEY: "resend-secret" },
    );
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      ok: true,
      message: "Message sent.",
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  } finally {
    vi.unstubAllGlobals();
  }
});

test("contact endpoint remains limited to commercial-property inquiries", async () => {
  const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    if (url.includes("turnstile")) {
      return Response.json({ success: true, action: "commercial_interest" });
    }
    if (url.includes("api.resend.com")) {
      const body = String(init?.body ?? "");
      expect(body).toContain("Appeal Compass commercial-property inquiry");
      expect(body).toContain("Please contact me about a commercial property");
      expect(body).not.toContain("feature suggestion");
      return Response.json({ id: "email_456" }, { status: 200 });
    }
    throw new Error(`Unexpected fetch ${url}`);
  });
  vi.stubGlobal("fetch", fetchMock);
  try {
    const response = await worker.fetch(
      contactRequest("10.0.1.5", {
        topic: "feature_suggestion",
        message: "Please contact me about a commercial property",
        turnstileToken: "contact-token",
      }),
      { TURNSTILE_SECRET_KEY: "turnstile-secret", RESEND_API_KEY: "resend-secret" },
    );
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      ok: true,
      message: "Message sent.",
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  } finally {
    vi.unstubAllGlobals();
  }
});

test("contact endpoint rejects failed Turnstile verification", async () => {
  const fetchMock = vi.fn(async () => Response.json({ success: false }));
  vi.stubGlobal("fetch", fetchMock);
  try {
    const response = await worker.fetch(
      contactRequest("10.0.1.2", {
        message: "Please contact me",
        turnstileToken: "bad-token",
      }),
      { TURNSTILE_SECRET_KEY: "turnstile-secret", RESEND_API_KEY: "resend-secret" },
    );
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      ok: false,
      error: { kind: "turnstile" },
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  } finally {
    vi.unstubAllGlobals();
  }
});

test("contact endpoint returns friendly error when Resend fails", async () => {
  const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
    const url = String(input);
    if (url.includes("turnstile")) {
      return Response.json({ success: true, action: "commercial_interest" });
    }
    return Response.json({ message: "server error" }, { status: 500 });
  });
  vi.stubGlobal("fetch", fetchMock);
  try {
    const response = await worker.fetch(
      contactRequest("10.0.1.3", {
        message: "Please contact me",
        turnstileToken: "ok-token",
      }),
      { TURNSTILE_SECRET_KEY: "turnstile-secret", RESEND_API_KEY: "resend-secret" },
    );
    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toMatchObject({
      ok: false,
      error: { kind: "resend" },
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  } finally {
    vi.unstubAllGlobals();
  }
});

test("case and print endpoints return 429 before building a case when the shared limit is exhausted", async () => {
  const caseBuilder = vi.fn(async () => ({ ok: true }) as never);
  const testWorker = createWorker({ caseBuilder });
  const env = { CASE_RATE_LIMITER: rateLimiter(false) };

  const caseResponse = await testWorker.fetch(caseRequest(99), env);
  expect(caseResponse.status).toBe(429);
  expect(caseResponse.headers.get("retry-after")).toBe("60");
  await expect(caseResponse.json()).resolves.toMatchObject({
    error: { kind: "rate_limited" },
  });

  const printResponse = await testWorker.fetch(
    new Request(`http://example.test/print?demo=1&pin=03-00-000-000-0001&${REQUIRED_CASE_QUERY}`),
    env,
  );
  expect(printResponse.status).toBe(429);
  expect(printResponse.headers.get("retry-after")).toBe("60");
  expect(caseBuilder).not.toHaveBeenCalled();
});

test("report endpoint returns 429 before external calls when submission limit is exhausted", async () => {
  const fetchMock = vi.fn();
  vi.stubGlobal("fetch", fetchMock);
  try {
    const response = await worker.fetch(
      reportRequest("10.0.0.24", {
        category: "feature_request",
        description: "Please add a feature",
        turnstileToken: "ok-token",
      }),
      {
        TURNSTILE_SECRET_KEY: "turnstile-secret",
        GITHUB_ISSUES_TOKEN: "github-secret",
        SUBMISSION_RATE_LIMITER: rateLimiter(false),
      },
    );
    expect(response.status).toBe(429);
    expect(response.headers.get("retry-after")).toBe("60");
    expect(fetchMock).not.toHaveBeenCalled();
  } finally {
    vi.unstubAllGlobals();
  }
});

test("contact endpoint returns friendly error when secrets are missing", async () => {
  const fetchMock = vi.fn();
  vi.stubGlobal("fetch", fetchMock);
  try {
    const response = await worker.fetch(
      contactRequest("10.0.1.4", {
        message: "Please contact me",
        turnstileToken: "ok-token",
      }),
      { TURNSTILE_SECRET_KEY: "turnstile-secret" },
    );
    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toMatchObject({
      ok: false,
      error: { kind: "configuration", message: "Contact form is not configured yet." },
    });
    expect(fetchMock).not.toHaveBeenCalled();
  } finally {
    vi.unstubAllGlobals();
  }
});

function caseRequest(index = 0): Request {
  return new Request(
    `http://example.test/api/case?demo=1&pin=03-00-000-000-0001&today=2025-07-10&request=${index}&${REQUIRED_CASE_QUERY}`,
  );
}

test("assessment limiter queues a fifth simultaneous case request and completes it", async () => {
  const limiter = new ConcurrencyLimiter(4);
  let active = 0;
  let maxActive = 0;
  const testWorker = createWorker({
    assessmentLimiter: limiter,
    queueTimeoutMs: 1000,
    caseBuilder: async () => {
      active += 1;
      maxActive = Math.max(maxActive, active);
      await new Promise((resolve) => setTimeout(resolve, 20));
      active -= 1;
      return { ok: true } as never;
    },
  });

  const requests = Array.from({ length: 5 }, (_, index) =>
    testWorker.fetch(caseRequest(index), {}),
  );
  await new Promise((resolve) => setTimeout(resolve, 0));
  expect(limiter.activeCount).toBe(4);
  expect(limiter.pendingCount).toBe(1);

  const queueResponse = await testWorker.fetch(new Request("http://example.test/api/queue"), {});
  await expect(queueResponse.json()).resolves.toMatchObject({
    ok: true,
    active: 4,
    queued: 1,
    busy: true,
    message: QUEUED_MESSAGE,
  });

  const responses = await Promise.all(requests);
  expect(maxActive).toBeLessThanOrEqual(4);
  expect(responses.map((response) => response.status)).toEqual([200, 200, 200, 200, 200]);
});

test("assessment queue timeout returns friendly 503", async () => {
  const limiter = new ConcurrencyLimiter(1);
  let releaseFirst = () => {};
  const testWorker = createWorker({
    assessmentLimiter: limiter,
    queueTimeoutMs: 5,
    caseBuilder: async () => {
      await new Promise<void>((resolve) => {
        releaseFirst = resolve;
      });
      return { ok: true } as never;
    },
  });

  const first = testWorker.fetch(caseRequest(1), {});
  await new Promise((resolve) => setTimeout(resolve, 0));
  const second = await testWorker.fetch(caseRequest(2), {});
  expect(second.status).toBe(503);
  await expect(second.json()).resolves.toMatchObject({
    ok: false,
    error: {
      kind: "queue_timeout",
      message: expect.stringContaining("busy helping other homeowners"),
    },
  });

  releaseFirst();
  await expect(first).resolves.toMatchObject({ status: 200 });
});

interface CasePayloadLike {
  routing: {
    venue: string;
    actionStatus: string;
  };
}

interface CasePayloadWithSavings {
  evidence: {
    savingsAssumptions: {
      taxRate: number;
      taxRateSource: string;
    };
  };
}

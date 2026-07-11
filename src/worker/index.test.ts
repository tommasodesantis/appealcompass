import { readFileSync } from "node:fs";
import type { AnalysisPayload, SubjectPayload } from "./casePayload";
import { createWorker } from "./index";
import worker from "./index";
import { ConcurrencyLimiter } from "./limiter";

const subjectUrl =
  "http://example.test/api/subject?demo=1&pin=03-00-000-000-0001&venue=assessor&ownershipType=individual&today=2026-05-01";
const stepOne = {
  jurisdiction: "cook_county_il",
  venue: "assessor",
  ownershipType: "individual",
  borNoticeReceived: null,
  borNoticeDate: null,
  today: "2026-05-01",
};
function analysisRequest(body: Record<string, unknown> = {}): Request {
  return new Request("http://example.test/api/analysis?demo=1", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      pin: "03-00-000-000-0001",
      stepOne,
      corrections: [],
      valueEvidence: null,
      revision: 1,
      ...body,
    }),
  });
}

test("health and application shell remain functional", async () => {
  const health = await worker.fetch(new Request("http://example.test/api/health"), {});
  await expect(health.json()).resolves.toMatchObject({ ok: true, service: "Appeal Compass" });
  const shell = await worker.fetch(new Request("http://example.test/"), {});
  expect(await shell.text()).toContain("challenges.cloudflare.com/turnstile/v0/api.js");
  expect(readFileSync(new URL("../../public/index.html", import.meta.url), "utf8")).toContain(
    "turnstile",
  );
});

test("subject endpoint returns only the subject-review phase and preserves Step 1 routing", async () => {
  const response = await worker.fetch(new Request(subjectUrl), {});
  expect(response.status).toBe(200);
  const payload = (await response.json()) as SubjectPayload;
  expect(payload.phase).toBe("subject");
  expect(payload.subject.publicParcel.pinFormatted).toBe("03-00-000-000-0001");
  expect(payload.routing.venue).toBe("assessor");
  expect(JSON.stringify(payload)).not.toContain("comparableSummary");
});

test("analysis endpoint applies corrections and returns independent evidence candidates", async () => {
  const response = await worker.fetch(
    analysisRequest({
      corrections: [
        { field: "buildingSqft", value: 1900, proofType: "official_property_record_card" },
      ],
      revision: 2,
    }),
    {},
  );
  expect(response.status).toBe(200);
  const payload = (await response.json()) as AnalysisPayload;
  expect(payload.phase).toBe("analysis");
  expect(payload.analysis.revision).toBe(2);
  expect(payload.analysis.subject.publicParcel.buildingSqft).toBe(1800);
  expect(payload.analysis.subject.effectiveParcel.buildingSqft).toBe(1900);
  expect(payload.analysis.evidenceCandidates.length).toBeGreaterThan(4);
  expect("tier" in (payload.analysis as unknown as Record<string, unknown>)).toBe(false);
});

test("correction to property class rebuilds the fixture comparable pool", async () => {
  const original = (await (await worker.fetch(analysisRequest(), {})).json()) as AnalysisPayload;
  const changed = (await (
    await worker.fetch(
      analysisRequest({
        corrections: [
          { field: "propertyClass", value: "204", proofType: "official_property_record_card" },
        ],
      }),
      {},
    )
  ).json()) as AnalysisPayload;
  expect(original.analysis.comparableSummary.universe.length).toBeGreaterThan(0);
  expect(changed.analysis.comparableSummary.universe).toHaveLength(0);
});

test("analysis rejects missing blocking data until documented input is supplied", async () => {
  const response = await worker.fetch(analysisRequest({ pin: "03-00-000-000-0030" }), {});
  expect(response.status).toBe(400);
  await expect(response.json()).resolves.toMatchObject({
    error: { kind: "input", message: expect.stringContaining("buildingSqft") },
  });
});

test("Step 1 validation and entity-owner refusal remain unchanged", async () => {
  const missingVenue = await worker.fetch(
    new Request(
      "http://example.test/api/subject?demo=1&pin=03-00-000-000-0001&ownershipType=individual",
    ),
    {},
  );
  expect(missingVenue.status).toBe(400);
  const entity = await worker.fetch(
    new Request(
      "http://example.test/api/subject?demo=1&pin=03-00-000-000-0001&venue=assessor&ownershipType=llc",
    ),
    {},
  );
  expect(entity.status).toBe(400);
  await expect(entity.json()).resolves.toMatchObject({
    error: { message: expect.stringContaining("individual residential homeowners") },
  });
});

test("PTAB notice questions retain awaiting and conservative-date behavior", async () => {
  const awaiting = await worker.fetch(
    new Request(
      "http://example.test/api/subject?demo=1&pin=03-00-000-000-0001&venue=ptab&ownershipType=individual&borNoticeReceived=no&today=2026-06-01",
    ),
    {},
  );
  await expect(awaiting.json()).resolves.toMatchObject({
    routing: { deadlineState: "awaiting_notice" },
  });
  const dated = await worker.fetch(
    new Request(
      "http://example.test/api/subject?demo=1&pin=03-00-000-000-0001&venue=ptab&ownershipType=individual&borNoticeReceived=yes&borNoticeDate=2026-05-20&today=2026-06-01",
    ),
    {},
  );
  await expect(dated.json()).resolves.toMatchObject({
    routing: { deadline: "2026-06-22" },
  });
});

test("legacy case and GET print routes remain functional", async () => {
  const legacy = await worker.fetch(
    new Request(
      "http://example.test/api/case?demo=1&pin=03-00-000-000-0001&venue=assessor&ownershipType=individual&today=2026-05-01",
    ),
    {},
  );
  expect(legacy.status).toBe(200);
  expect(((await legacy.json()) as AnalysisPayload).phase).toBe("analysis");
  const print = await worker.fetch(
    new Request(
      "http://example.test/print?demo=1&pin=03-00-000-000-0001&venue=assessor&ownershipType=individual&today=2026-05-01",
    ),
    {},
  );
  expect(print.status).toBe(200);
  expect(await print.text()).toContain("Owner-selected evidence");
});

function limiter(success: boolean): RateLimit {
  return { limit: vi.fn().mockResolvedValue({ success }) } as unknown as RateLimit;
}
test("subject, analysis, and packet share case rate limiting", async () => {
  const env = { CASE_RATE_LIMITER: limiter(false) };
  expect((await worker.fetch(new Request(subjectUrl), env)).status).toBe(429);
  expect((await worker.fetch(analysisRequest(), env)).status).toBe(429);
  const packet = new Request("http://example.test/api/packet?demo=1", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      pin: "03-00-000-000-0001",
      stepOne,
      corrections: [],
      valueEvidence: null,
      revision: 1,
      selection: { evidenceTypes: [], comparablePins: [] },
    }),
  });
  expect((await worker.fetch(packet, env)).status).toBe(429);
});

test("assessment limiter queues a fifth subject request and preserves the FIFO cap", async () => {
  const concurrency = new ConcurrencyLimiter(4);
  let active = 0;
  let maxActive = 0;
  const testWorker = createWorker({
    assessmentLimiter: concurrency,
    queueTimeoutMs: 1000,
    subjectBuilder: async () => {
      active += 1;
      maxActive = Math.max(maxActive, active);
      await new Promise((resolve) => setTimeout(resolve, 20));
      active -= 1;
      return { ok: true } as never;
    },
  });
  const requests = Array.from({ length: 5 }, (_, index) =>
    testWorker.fetch(new Request(`${subjectUrl}&request=${index}`), {}),
  );
  await new Promise((resolve) => setTimeout(resolve, 0));
  expect(concurrency.activeCount).toBe(4);
  expect(concurrency.pendingCount).toBe(1);
  expect((await Promise.all(requests)).every((response) => response.status === 200)).toBe(true);
  expect(maxActive).toBe(4);
});

test("queue timeout returns a friendly 503", async () => {
  const concurrency = new ConcurrencyLimiter(1);
  let release = () => {};
  const testWorker = createWorker({
    assessmentLimiter: concurrency,
    queueTimeoutMs: 5,
    subjectBuilder: async () => {
      await new Promise<void>((resolve) => {
        release = resolve;
      });
      return { ok: true } as never;
    },
  });
  const first = testWorker.fetch(new Request(`${subjectUrl}&request=1`), {});
  await new Promise((resolve) => setTimeout(resolve, 0));
  const second = await testWorker.fetch(new Request(`${subjectUrl}&request=2`), {});
  expect(second.status).toBe(503);
  await expect(second.json()).resolves.toMatchObject({ error: { kind: "queue_timeout" } });
  release();
  await first;
});

test("feedback keeps Turnstile and GitHub actor validation", async () => {
  const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
    const url = String(input);
    if (url.includes("turnstile")) return Response.json({ success: true, action: "feedback" });
    if (url.endsWith("/user")) return Response.json({ login: "tdsdesa-bot" });
    return Response.json({ html_url: "https://github.com/example/1" }, { status: 201 });
  });
  vi.stubGlobal("fetch", fetchMock);
  try {
    const response = await worker.fetch(
      new Request("http://example.test/api/report", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          category: "feature_request",
          description: "Feature",
          turnstileToken: "token",
        }),
      }),
      { TURNSTILE_SECRET_KEY: "secret", GITHUB_ISSUES_TOKEN: "github" },
    );
    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(3);
  } finally {
    vi.unstubAllGlobals();
  }
});

test("commercial contact keeps Turnstile and Resend handling", async () => {
  const fetchMock = vi.fn(async (input: RequestInfo | URL) =>
    String(input).includes("turnstile")
      ? Response.json({ success: true, action: "commercial_interest" })
      : Response.json({ id: "mail" }),
  );
  vi.stubGlobal("fetch", fetchMock);
  try {
    const response = await worker.fetch(
      new Request("http://example.test/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message: "Commercial inquiry", turnstileToken: "token" }),
      }),
      { TURNSTILE_SECRET_KEY: "secret", RESEND_API_KEY: "resend" },
    );
    expect(response.status).toBe(200);
  } finally {
    vi.unstubAllGlobals();
  }
});

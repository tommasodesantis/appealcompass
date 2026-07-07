import worker from "./index";

test("health endpoint returns a JSON status", async () => {
  const response = await worker.fetch(new Request("http://example.test/api/health"), {});
  expect(response.status).toBe(200);
  await expect(response.json()).resolves.toMatchObject({
    ok: true,
    service: "cookpropertytax",
  });
});

test("fixture-mode case endpoint returns a computed case payload", async () => {
  const response = await worker.fetch(
    new Request("http://example.test/api/case?demo=1&pin=03-00-000-000-0001&today=2025-07-10"),
    {},
  );
  expect(response.status).toBe(200);
  const payload = await response.json();
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
  expect(JSON.stringify(payload)).toContain("NOT LEGAL ADVICE");
});

test("fixture-mode address endpoint returns disambiguation candidates", async () => {
  const response = await worker.fetch(
    new Request("http://example.test/api/address?demo=1&q=MOZART"),
    {},
  );
  expect(response.status).toBe(200);
  const payload = (await response.json()) as {
    candidates: Array<{ pinFormatted: string }>;
  };
  expect(payload.candidates.length).toBeGreaterThanOrEqual(2);
  expect(payload.candidates[0]?.pinFormatted).toMatch(/^\d{2}-/);
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

import worker from "./index";

test("health endpoint returns a JSON status", async () => {
  const response = await worker.fetch(new Request("http://example.test/api/health"), {});
  expect(response.status).toBe(200);
  await expect(response.json()).resolves.toMatchObject({
    ok: true,
    service: "cookpropertytax",
  });
});

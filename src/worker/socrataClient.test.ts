import { DataAccessError, DataErrorKind } from "../domain/errors";
import { type CacheStore, MemoryCacheStore } from "./cache";
import { SocrataClient } from "./socrataClient";
import { friendlyDataError } from "./socrataClient";

function jsonResponse(payload: unknown, init: ResponseInit = {}): Response {
  return Response.json(payload, init);
}

test("SocrataClient paginates and reuses cache", async () => {
  const calls: string[] = [];
  const client = new SocrataClient({
    cache: new MemoryCacheStore(),
    pageSize: 2,
    fetcher: async (input) => {
      const url = new URL(String(input));
      calls.push(url.search);
      return jsonResponse(
        url.searchParams.get("$offset") === "0" ? [{ row: 1 }, { row: 2 }] : [{ row: 3 }],
      );
    },
  });

  const first = await client.fetchAll("parcel_universe", { $where: "pin='x'" });
  expect(first.rows.map((row) => row.row)).toEqual([1, 2, 3]);
  expect(first.warnings).toEqual([
    {
      audience: "internal",
      dataset: "parcel_universe",
      message:
        "Socrata pagination fetched 3 rows for parcel_universe; all available pages were requested.",
    },
  ]);
  expect(calls).toHaveLength(2);

  const second = await client.fetchAll("parcel_universe", { $where: "pin='x'" });
  expect(second.rows.map((row) => row.row)).toEqual([1, 2, 3]);
  expect(calls).toHaveLength(2);
});

test("SocrataClient retries transient HTTP and honors Retry-After", async () => {
  const sleeps: number[] = [];
  let calls = 0;
  const client = new SocrataClient({
    cache: new MemoryCacheStore(),
    maxRetries: 2,
    sleep: async (ms) => {
      sleeps.push(ms);
    },
    fetcher: async () => {
      calls += 1;
      if (calls === 1) {
        return jsonResponse({ error: "busy" }, { status: 429, headers: { "retry-after": "1" } });
      }
      return jsonResponse([{ row: "ok" }]);
    },
  });

  const result = await client.fetchAll("parcel_universe", { $where: "pin='x'" });
  expect(result.rows).toEqual([{ row: "ok" }]);
  expect(calls).toBe(2);
  expect(sleeps).toEqual([1000]);
});

test("SocrataClient classifies invalid JSON shape", async () => {
  const client = new SocrataClient({
    cache: new MemoryCacheStore(),
    maxRetries: 1,
    fetcher: async () => jsonResponse({ not: "a list" }),
  });
  await expect(client.fetchAll("parcel_universe", { $where: "pin='x'" })).rejects.toMatchObject({
    kind: DataErrorKind.InvalidJson,
  });
});

test("SocrataClient classifies unknown dataset", async () => {
  const client = new SocrataClient({ cache: new MemoryCacheStore() });
  await expect(client.fetchAll("missing", {})).rejects.toMatchObject({
    kind: DataErrorKind.UnknownDataset,
  });
});

test("SocrataClient classifies invalid cache", async () => {
  const badCache: CacheStore = {
    async get() {
      return { bad: true };
    },
    async set() {},
  };
  const client = new SocrataClient({ cache: badCache });
  await expect(client.fetchAll("parcel_universe", {})).rejects.toMatchObject({
    kind: DataErrorKind.InvalidCache,
  });
});

test("SocrataClient coalesces identical in-flight requests", async () => {
  let calls = 0;
  const client = new SocrataClient({
    cache: new MemoryCacheStore(),
    fetcher: async () => {
      calls += 1;
      await new Promise((resolve) => setTimeout(resolve, 10));
      return jsonResponse([{ row: calls }]);
    },
  });

  const [first, second] = await Promise.all([
    client.fetchAll("parcel_universe", { $where: "pin='x'" }),
    client.fetchAll("parcel_universe", { $where: "pin='x'" }),
  ]);
  expect(calls).toBe(1);
  expect(first.rows).toEqual(second.rows);
});

test("SocrataClient bounds outbound concurrency", async () => {
  let active = 0;
  let maxActive = 0;
  const client = new SocrataClient({
    cache: new MemoryCacheStore(),
    concurrency: 2,
    fetcher: async () => {
      active += 1;
      maxActive = Math.max(maxActive, active);
      await new Promise((resolve) => setTimeout(resolve, 10));
      active -= 1;
      return jsonResponse([{ row: "ok" }]);
    },
  });

  await Promise.all([
    client.fetchAll("parcel_universe", { $where: "a" }),
    client.fetchAll("assessed_values", { $where: "b" }),
    client.fetchAll("res_characteristics", { $where: "c" }),
    client.fetchAll("parcel_sales", { $where: "d" }),
  ]);

  expect(maxActive).toBeLessThanOrEqual(2);
  expect(client.limiter.maxObserved).toBeLessThanOrEqual(2);
});

test("SocrataClient exposes transient failure kind after retries", async () => {
  const client = new SocrataClient({
    cache: new MemoryCacheStore(),
    maxRetries: 1,
    fetcher: async () => jsonResponse({ error: "busy" }, { status: 503 }),
  });
  await expect(client.fetchAll("parcel_universe", { $where: "pin='x'" })).rejects.toBeInstanceOf(
    DataAccessError,
  );
  await expect(client.fetchAll("parcel_universe", { $where: "pin='y'" })).rejects.toMatchObject({
    kind: DataErrorKind.TransientHttp,
  });
});

test.each([
  [DataErrorKind.TransientHttp, "busy"],
  [DataErrorKind.Network, "busy"],
  [DataErrorKind.UnknownDataset, "configuration"],
  [DataErrorKind.InvalidJson, "could not use"],
  [DataErrorKind.HttpError, "could not use"],
  [DataErrorKind.InvalidCache, "could not use"],
])("friendlyDataError maps %s to actionable copy", (kind, expected) => {
  const message = friendlyDataError(new DataAccessError("raw upstream detail", kind)).message;
  expect(message).toContain(expected);
  expect(message).not.toContain("raw upstream detail");
});

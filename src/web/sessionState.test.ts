import {
  ASSESSMENT_SNAPSHOT_KEY,
  loadAssessmentSnapshot,
  parseAssessmentSnapshot,
  saveAssessmentSnapshot,
  serializeAssessmentSnapshot,
} from "./sessionState";

class MemoryStorage implements Pick<Storage, "getItem" | "setItem"> {
  private readonly values = new Map<string, string>();

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }
}

test("assessment snapshot serializes query params and payload", () => {
  const query = new URLSearchParams("pin=03-00-000-000-0001&venue=assessor");
  const value = serializeAssessmentSnapshot(query, { ok: true }, "2026-07-08T12:00:00.000Z");
  const parsed = parseAssessmentSnapshot<{ ok: boolean }>(value);

  expect(parsed?.query.get("pin")).toBe("03-00-000-000-0001");
  expect(parsed?.query.get("venue")).toBe("assessor");
  expect(parsed?.payload).toEqual({ ok: true });
  expect(parsed?.savedAt).toBe("2026-07-08T12:00:00.000Z");
  expect(value).toContain('"schemaVersion":2');
});

test("assessment snapshot parser rejects malformed storage values", () => {
  expect(parseAssessmentSnapshot(null)).toBeNull();
  expect(parseAssessmentSnapshot("not json")).toBeNull();
  expect(parseAssessmentSnapshot(JSON.stringify({ queryString: "pin=1" }))).toBeNull();
  expect(
    parseAssessmentSnapshot(
      JSON.stringify({
        schemaVersion: 1,
        queryString: "pin=1",
        payload: { ok: true },
        savedAt: "2026-07-08T12:00:00.000Z",
      }),
    ),
  ).toBeNull();
});

test("assessment snapshot save and load tolerate storage APIs", () => {
  const storage = new MemoryStorage();
  const query = new URLSearchParams("pin=03-00-000-000-0001&venue=bor");

  expect(saveAssessmentSnapshot(storage, query, { ok: true })).toBe(true);
  const loaded = loadAssessmentSnapshot<{ ok: boolean }>(storage);

  expect(storage.getItem(ASSESSMENT_SNAPSHOT_KEY)).toContain("venue=bor");
  expect(loaded?.query.get("venue")).toBe("bor");
  expect(loaded?.payload.ok).toBe(true);
});

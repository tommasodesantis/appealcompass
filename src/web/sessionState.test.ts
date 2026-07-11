import {
  APP_SESSION_KEY,
  APP_SESSION_SCHEMA_VERSION,
  loadSessionState,
  parseSessionState,
  saveSessionState,
  serializeSessionState,
} from "./sessionState";

class MemoryStorage implements Pick<Storage, "getItem" | "setItem"> {
  values = new Map<string, string>();
  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }
  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }
}

const state = {
  stepOneQuery: "pin=03-00-000-000-0001&venue=assessor",
  screen: "analysis" as const,
  subjectPayload: { phase: "subject" },
  corrections: [],
  valueEvidence: null,
  analysisPayload: { revision: 2 },
  analysisRevision: 2,
  table: {
    bands: ["excellent" as const, "good" as const],
    saleFilter: "recent" as const,
    propertyClass: "203",
    neighborhood: "0101",
    maxDistanceKm: 2,
    yearBuiltTolerance: 15,
    sortKey: "similarity",
    sortDirection: "asc" as const,
    page: 2,
    pageSize: 10 as const,
  },
  selectedComparablePins: ["03000000000002"],
  savingsMethods: ["uniformity" as const],
  packetEvidenceTypes: ["land" as const],
};

test("versioned session state preserves every flow and selection surface", () => {
  const value = serializeSessionState(state, "2026-07-11T10:00:00.000Z");
  const parsed = parseSessionState(value);
  expect(parsed?.schemaVersion).toBe(APP_SESSION_SCHEMA_VERSION);
  expect(parsed?.stepOneQuery).toContain("venue=assessor");
  expect(parsed?.analysisRevision).toBe(2);
  expect(parsed?.table.page).toBe(2);
  expect(parsed?.selectedComparablePins).toEqual(["03000000000002"]);
  expect(parsed?.savingsMethods).toEqual(["uniformity"]);
  expect(parsed?.packetEvidenceTypes).toEqual(["land"]);
});

test("session parser rejects malformed and stale schemas", () => {
  expect(parseSessionState(null)).toBeNull();
  expect(parseSessionState("not json")).toBeNull();
  expect(
    parseSessionState(JSON.stringify({ ...state, schemaVersion: 2, savedAt: "x" })),
  ).toBeNull();
});

test("session save and load tolerate storage APIs", () => {
  const storage = new MemoryStorage();
  expect(saveSessionState(storage, state)).toBe(true);
  expect(storage.getItem(APP_SESSION_KEY)).toContain('"analysisRevision":2');
  expect(loadSessionState(storage)?.table.saleFilter).toBe("recent");
});

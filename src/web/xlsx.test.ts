import type { AnalysisPayload } from "../worker/casePayload";
import worker from "../worker/index";
import { buildComparableWorkbook } from "./xlsx";

const decoder = new TextDecoder();
function uint16(bytes: Uint8Array, offset: number): number {
  return (bytes[offset] ?? 0) | ((bytes[offset + 1] ?? 0) << 8);
}
function uint32(bytes: Uint8Array, offset: number): number {
  return (
    (bytes[offset] ?? 0) |
    ((bytes[offset + 1] ?? 0) << 8) |
    ((bytes[offset + 2] ?? 0) << 16) |
    ((bytes[offset + 3] ?? 0) << 24)
  );
}
function unzipStored(bytes: Uint8Array): Map<string, string> {
  const entries = new Map<string, string>();
  let offset = 0;
  while (offset + 30 <= bytes.length && uint32(bytes, offset) === 0x04034b50) {
    const size = uint32(bytes, offset + 18);
    const nameLength = uint16(bytes, offset + 26);
    const extraLength = uint16(bytes, offset + 28);
    const nameStart = offset + 30;
    const dataStart = nameStart + nameLength + extraLength;
    entries.set(
      decoder.decode(bytes.slice(nameStart, nameStart + nameLength)),
      decoder.decode(bytes.slice(dataStart, dataStart + size)),
    );
    offset = dataStart + size;
  }
  return entries;
}

async function payload(): Promise<AnalysisPayload> {
  const response = await worker.fetch(
    new Request(
      "http://example.test/api/case?demo=1&pin=03-00-000-000-0001&venue=assessor&ownershipType=individual&today=2026-05-01",
    ),
    {},
  );
  expect(response.status).toBe(200);
  return (await response.json()) as AnalysisPayload;
}

test("workbook is valid and contains required subject, selected, all, and evidence sheets", async () => {
  const analysis = await payload();
  const bytes = buildComparableWorkbook(analysis, {
    selectedComparablePins: ["03000000000002", "03000000000003"],
    packetEvidenceTypes: ["uniformity", "land"],
    savingsMethods: ["uniformity", "land"],
  });
  const entries = unzipStored(bytes);
  const workbook = entries.get("xl/workbook.xml") ?? "";
  expect(workbook).toContain("Subject &amp; Corrections");
  expect(workbook).toContain("Selected Comparables");
  expect(workbook).toContain("All Comparables");
  expect(workbook).toContain("Evidence Summary");
  expect(workbook).toContain("Savings - Uniformity");
  expect(workbook).toContain("Savings - Land");
  expect(workbook).not.toContain("Savings - Appraisal");
  expect(entries.size).toBeGreaterThan(8);
});

test("selected and all comparable sheets retain their different row sets", async () => {
  const analysis = await payload();
  const entries = unzipStored(
    buildComparableWorkbook(analysis, {
      selectedComparablePins: ["03000000000002"],
      packetEvidenceTypes: ["uniformity"],
      savingsMethods: [],
    }),
  );
  const selected = entries.get("xl/worksheets/sheet2.xml") ?? "";
  const all = entries.get("xl/worksheets/sheet3.xml") ?? "";
  expect(selected).toContain("03-00-000-000-0002");
  expect(selected).not.toContain("03-00-000-000-0010");
  expect(all).toContain("03-00-000-000-0002");
  expect(all).toContain("03-00-000-000-0010");
  expect(all).toContain("Land AV/sqft");
});

test("workbook contains corrected values and proof types without obsolete content", async () => {
  const response = await worker.fetch(
    new Request("http://example.test/api/analysis?demo=1", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        pin: "03-00-000-000-0001",
        stepOne: {
          jurisdiction: "cook_county_il",
          venue: "assessor",
          ownershipType: "individual",
          borNoticeReceived: null,
          borNoticeDate: null,
          today: "2026-05-01",
        },
        corrections: [
          { field: "buildingSqft", value: 1900, proofType: "official_property_record_card" },
        ],
        valueEvidence: null,
        revision: 2,
      }),
    }),
    {},
  );
  const analysis = (await response.json()) as AnalysisPayload;
  const entries = unzipStored(
    buildComparableWorkbook(analysis, {
      selectedComparablePins: [],
      packetEvidenceTypes: ["property_corrections"],
      savingsMethods: [],
    }),
  );
  const allText = [...entries.values()].join(" ").toLowerCase();
  expect(allText).toContain("official property record card");
  expect(allText).toContain("1900");
  expect(allText).toContain("each evidence type is reported independently");
});

import worker from "../worker/index";
import { buildComparableWorkbook } from "./xlsx";

const REQUIRED_STEP_ONE = "ownershipType=individual&assessorAppealFiled=no&borAppealFiled=no";
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
    const method = uint16(bytes, offset + 8);
    const compressedSize = uint32(bytes, offset + 18);
    const nameLength = uint16(bytes, offset + 26);
    const extraLength = uint16(bytes, offset + 28);
    expect(method).toBe(0);
    const nameStart = offset + 30;
    const nameEnd = nameStart + nameLength;
    const dataStart = nameEnd + extraLength;
    const dataEnd = dataStart + compressedSize;
    const name = decoder.decode(bytes.slice(nameStart, nameEnd));
    entries.set(name, decoder.decode(bytes.slice(dataStart, dataEnd)));
    offset = dataEnd;
  }
  return entries;
}

test("buildComparableWorkbook creates a real XLSX with expected exhibit sections", async () => {
  const response = await worker.fetch(
    new Request(
      `http://example.test/api/case?demo=1&pin=03-00-000-000-0001&venue=assessor&today=2026-05-01&${REQUIRED_STEP_ONE}`,
    ),
    {},
  );
  expect(response.status).toBe(200);
  const payload = await response.json();
  const workbook = buildComparableWorkbook(payload as never);
  const entries = unzipStored(workbook);

  expect(entries.has("[Content_Types].xml")).toBe(true);
  expect(entries.has("xl/workbook.xml")).toBe(true);
  expect(entries.has("xl/worksheets/sheet2.xml")).toBe(true);
  expect(entries.get("[Content_Types].xml") ?? "").toContain("/xl/worksheets/sheet2.xml");
  expect(entries.get("xl/workbook.xml") ?? "").toContain("Similar Homes");
  expect(entries.get("xl/_rels/workbook.xml.rels") ?? "").toContain("worksheets/sheet2.xml");
  const sheet = entries.get("xl/worksheets/sheet1.xml") ?? "";
  const similarHomes = entries.get("xl/worksheets/sheet2.xml") ?? "";
  expect(sheet).toContain("Subject Property Summary");
  expect(sheet).toContain("Comparable Exhibit");
  expect(sheet).toContain("Distance km");
  expect(sheet).toContain("Neighborhood");
  expect(sheet).toContain("Property class");
  expect(sheet).toContain("Building sqft");
  expect(sheet).toContain("Year built");
  expect(sheet).toContain("Sale date");
  expect(sheet).toContain("Sale price");
  expect(sheet).toContain("Assessment type");
  expect(sheet).toContain("Assessment $/sqft");
  expect(sheet).toContain("Similarity score");
  expect(sheet).toContain("Analysis Stats");
  expect(sheet).toContain("Median assessment $/sqft");
  expect(sheet).toContain("Savings Calculation");
  expect(sheet).toContain("State equalizer");
  expect(sheet).toContain("Tax rate source");
  expect(sheet).toContain("approximate parcel-specific rate 7.7774%");
  expect(sheet).toContain("2024-08-10");
  expect(sheet).toContain("03-00-000-000-0002");
  expect(similarHomes).toContain("Similar Homes");
  expect(similarHomes).toContain("full selected comparable pool");
  expect(similarHomes).toContain("Assessment $/sqft");
  expect(similarHomes).toContain("Similarity score");
  expect(similarHomes).toContain("03-00-000-000-0010");
});

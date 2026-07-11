import type {
  ComparableExhibit,
  EvidenceType,
  SavingsCalculation,
  SavingsMethod,
  SubjectField,
} from "../domain/models";
import { PROOF_TYPE_LABELS, SUBJECT_FIELD_LABELS } from "../domain/subjectCorrections";
import type { AnalysisPayload } from "../worker/casePayload";

type CellValue = string | number | null;
interface StyledCell {
  value: CellValue;
  style?: number;
}
type CellInput = CellValue | StyledCell;
type RowInput = CellInput[];
interface SheetDefinition {
  name: string;
  rows: RowInput[];
}
interface ZipEntry {
  path: string;
  data: Uint8Array;
  crc: number;
}

export interface WorkbookSelection {
  selectedComparablePins: string[];
  packetEvidenceTypes: EvidenceType[];
  savingsMethods: SavingsMethod[];
}

const encoder = new TextEncoder();

function xml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function normalizeCell(input: CellInput): StyledCell {
  return input && typeof input === "object" && "value" in input ? input : { value: input };
}

function colName(index: number): string {
  let value = index + 1;
  let name = "";
  while (value > 0) {
    name = String.fromCharCode(65 + ((value - 1) % 26)) + name;
    value = Math.floor((value - 1) / 26);
  }
  return name;
}

function cellXml(input: CellInput, rowIndex: number, colIndex: number): string {
  const cell = normalizeCell(input);
  const ref = `${colName(colIndex)}${rowIndex}`;
  const style = cell.style === undefined ? "" : ` s="${cell.style}"`;
  if (typeof cell.value === "number" && Number.isFinite(cell.value)) {
    return `<c r="${ref}"${style}><v>${cell.value}</v></c>`;
  }
  const value = cell.value === null || cell.value === "" ? "Not available" : cell.value;
  return `<c r="${ref}" t="inlineStr"${style}><is><t>${xml(value)}</t></is></c>`;
}

function sheetXml(rows: RowInput[]): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetViews><sheetView workbookViewId="0"/></sheetViews><sheetFormatPr defaultRowHeight="15"/><cols><col min="1" max="20" width="24" customWidth="1"/></cols><sheetData>${rows
    .map(
      (row, rowIndex) =>
        `<row r="${rowIndex + 1}">${row.map((cell, colIndex) => cellXml(cell, rowIndex + 1, colIndex)).join("")}</row>`,
    )
    .join("")}</sheetData></worksheet>`;
}

function workbookXml(sheets: SheetDefinition[]): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>${sheets
    .map(
      (sheet, index) =>
        `<sheet name="${xml(sheet.name)}" sheetId="${index + 1}" r:id="rId${index + 1}"/>`,
    )
    .join("")}</sheets></workbook>`;
}

function workbookRelsXml(sheets: SheetDefinition[]): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${sheets
    .map(
      (_sheet, index) =>
        `<Relationship Id="rId${index + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${index + 1}.xml"/>`,
    )
    .join(
      "",
    )}<Relationship Id="rId${sheets.length + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`;
}

function contentTypesXml(sheets: SheetDefinition[]): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>${sheets
    .map(
      (_sheet, index) =>
        `<Override PartName="/xl/worksheets/sheet${index + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`,
    )
    .join(
      "",
    )}<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>`;
}

function rootRelsXml(): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`;
}

function stylesXml(): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="2"><font><sz val="11"/><name val="Aptos"/></font><font><b/><sz val="11"/><name val="Aptos"/></font></fonts><fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FFEFE3C1"/><bgColor indexed="64"/></patternFill></fill></fills><borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="3"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/><xf numFmtId="0" fontId="1" fillId="1" borderId="0" xfId="0" applyFont="1" applyFill="1"/></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>`;
}

function section(title: string): RowInput {
  return [{ value: title, style: 1 }];
}

function header(values: string[]): RowInput {
  return values.map((value) => ({ value, style: 2 }));
}

function subjectRows(payload: AnalysisPayload): RowInput[] {
  const subject = payload.analysis.subject;
  const fields = Object.keys(subject.provenance) as SubjectField[];
  const corrections = new Map(subject.corrections.map((item) => [item.field, item]));
  const rows: RowInput[] = [
    section("Subject & Corrections"),
    ["PIN", subject.effectiveParcel.pinFormatted],
    ["Selected venue", payload.venue.name],
    header([
      "Field",
      "Public value",
      "Effective value",
      "Provenance",
      "Proof type",
      "Derived explanation",
    ]),
  ];
  for (const field of fields) {
    const correction = corrections.get(field);
    rows.push([
      SUBJECT_FIELD_LABELS[field],
      String(subject.publicParcel[field] ?? "Not available"),
      String(subject.effectiveParcel[field] ?? "Not available"),
      subject.provenance[field],
      correction?.proofType ? PROOF_TYPE_LABELS[correction.proofType] : null,
      correction?.derivation ?? correction?.otherProofDescription ?? null,
    ]);
  }
  if (payload.analysis.subjectValueEvidence) {
    const evidence = payload.analysis.subjectValueEvidence;
    rows.push(
      [],
      section("Subject value evidence"),
      ["Type", evidence.type],
      ["Value", evidence.value],
      [evidence.type === "appraisal" ? "Appraisal effective date" : "Purchase date", evidence.date],
      ["Proof type", PROOF_TYPE_LABELS[evidence.proofType]],
      ["Other proof description", evidence.otherProofDescription ?? null],
    );
  }
  if (payload.analysis.propertyCards.length > 1) {
    rows.push(
      [],
      section("Multiple-card breakdown"),
      ["Building area was added across cards; parcel land was counted once."],
      header(["Card number", "Property class", "Building sqft", "Year built"]),
      ...payload.analysis.propertyCards.map((card) => [
        card.cardNumber,
        card.propertyClass,
        card.buildingSqft,
        card.yearBuilt,
      ]),
    );
  }
  return rows;
}

function comparableHeader(): RowInput {
  return header([
    "PIN",
    "Distance km",
    "Neighborhood",
    "Property class",
    "Building sqft",
    "Year built",
    "Sale date",
    "Sale price",
    "Improvement AV/sqft",
    "Compared with subject (%)",
    "Similarity score",
    "Similarity band",
    "Land AV/sqft",
  ]);
}

function comparableRows(rows: ComparableExhibit[], subjectPsf: number | null): RowInput[] {
  return rows.map((row) => [
    row.comparable.pinFormatted,
    row.distanceKm,
    row.comparable.neighborhood,
    row.comparable.propertyClass,
    row.comparable.buildingSqft,
    row.comparable.yearBuilt,
    row.comparable.saleDate,
    row.comparable.salePrice,
    row.improvementAvPerSqft,
    subjectPsf === null ? null : ((row.improvementAvPerSqft - subjectPsf) / subjectPsf) * 100,
    row.similarity,
    row.band,
    row.landAvPerSqft,
  ]);
}

function evidenceRows(payload: AnalysisPayload, selection: WorkbookSelection): RowInput[] {
  const selected = new Set(selection.packetEvidenceTypes);
  return [
    section("Evidence Summary"),
    [
      "Only evidence selected for the evidence packet is listed. Each evidence type is reported independently.",
    ],
    header([
      "Evidence",
      "Status",
      "Reason",
      "Appeal Compass screening threshold",
      "Official venue rule",
      "Data used",
      "Limitations",
    ]),
    ...payload.analysis.evidenceCandidates
      .filter((candidate) => selected.has(candidate.type))
      .map((candidate) => [
        candidate.name,
        candidate.status,
        candidate.shortReason,
        candidate.screeningRule,
        candidate.officialRuleSummary,
        candidate.dataUsed.join("; "),
        candidate.limitations.join("; "),
      ]),
  ];
}

function calculationRows(
  calculation: SavingsCalculation,
  universe: ComparableExhibit[],
): RowInput[] {
  const used = new Set(calculation.comparablePins);
  const usedRows = universe.filter((row) => used.has(row.comparable.pin));
  return [
    section(`Savings - ${calculation.evidenceName}`),
    ["Status", calculation.status],
    ["Limitation", calculation.limitation],
    ["Formula", calculation.formula],
    ["Comparable group", calculation.groupLabel],
    ["Comparable count", calculation.comparableCount],
    ["Current Total AV", calculation.currentTotalAv],
    ["Target Total AV", calculation.targetTotalAv],
    ["AV reduction", calculation.avReduction],
    ["Current implied market value", calculation.currentImpliedMarketValue],
    ["Evidence or preliminary supported market value", calculation.evidenceMarketValue],
    ["Target AV market-value equivalent", calculation.targetMarketValueEquivalent],
    ["Estimated current tax", calculation.estimatedCurrentTax],
    ["Estimated target tax", calculation.estimatedTargetTax],
    ["Annual savings low", calculation.annualSavingsLow],
    ["Annual savings point", calculation.annualSavingsPoint],
    ["Annual savings high", calculation.annualSavingsHigh],
    ["State equalizer", calculation.stateEqualizer],
    ["Tax rate", calculation.taxRate],
    ["Tax rate source", calculation.taxRateSource],
    ["Assessment level", calculation.assessmentLevel],
    ["Warnings", calculation.warnings.join("; ")],
    ["Disclaimer", calculation.disclaimer],
    [],
    section("Comparable rows used"),
    comparableHeader(),
    ...comparableRows(usedRows, null),
  ];
}

function methodSheetName(method: SavingsMethod): string {
  const names: Record<SavingsMethod, string> = {
    uniformity: "Savings - Uniformity",
    recorded_sale: "Savings - Recorded Sale",
    reported_purchase: "Savings - Purchase",
    appraisal: "Savings - Appraisal",
    comparable_sales: "Savings - Comparable Sales",
    land: "Savings - Land",
  };
  return names[method];
}

function buildSheets(payload: AnalysisPayload, selection: WorkbookSelection): SheetDefinition[] {
  const universe = payload.analysis.comparableSummary.universe;
  const byPin = new Map(universe.map((row) => [row.comparable.pin, row]));
  const selectedRows = selection.selectedComparablePins
    .map((pin) => byPin.get(pin))
    .filter((row): row is ComparableExhibit => row !== undefined);
  const subjectPsf = payload.analysis.comparableSummary.subjectImprovementAvPerSqft;
  const sheets: SheetDefinition[] = [
    { name: "Subject & Corrections", rows: subjectRows(payload) },
    {
      name: "Selected Comparables",
      rows: [
        section("Selected Comparables"),
        comparableHeader(),
        ...comparableRows(selectedRows, subjectPsf),
      ],
    },
    {
      name: "All Comparables",
      rows: [
        section("All Comparables through similarity 0.50"),
        comparableHeader(),
        ...comparableRows(universe, subjectPsf),
      ],
    },
    { name: "Evidence Summary", rows: evidenceRows(payload, selection) },
  ];
  const methods = new Set(selection.savingsMethods);
  for (const calculation of payload.analysis.savingsCalculations) {
    if (!methods.has(calculation.method)) continue;
    sheets.push({
      name: methodSheetName(calculation.method),
      rows: calculationRows(calculation, universe),
    });
  }
  return sheets;
}

function crcTable(): Uint32Array {
  const table = new Uint32Array(256);
  for (let index = 0; index < 256; index += 1) {
    let value = index;
    for (let bit = 0; bit < 8; bit += 1)
      value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
    table[index] = value >>> 0;
  }
  return table;
}
const CRC_TABLE = crcTable();
function crc32(data: Uint8Array): number {
  let crc = 0xffffffff;
  for (const byte of data) crc = (crc >>> 8) ^ (CRC_TABLE[(crc ^ byte) & 0xff] ?? 0);
  return (crc ^ 0xffffffff) >>> 0;
}
function writeUint16(output: number[], value: number): void {
  output.push(value & 0xff, (value >>> 8) & 0xff);
}
function writeUint32(output: number[], value: number): void {
  output.push(value & 0xff, (value >>> 8) & 0xff, (value >>> 16) & 0xff, (value >>> 24) & 0xff);
}
function append(output: number[], data: Uint8Array): void {
  output.push(...data);
}

function zip(entries: Array<{ path: string; text: string }>): Uint8Array {
  const output: number[] = [];
  const central: number[] = [];
  const files: ZipEntry[] = entries.map((entry) => {
    const data = encoder.encode(entry.text);
    return { path: entry.path, data, crc: crc32(data) };
  });
  for (const file of files) {
    const offset = output.length;
    const name = encoder.encode(file.path);
    writeUint32(output, 0x04034b50);
    writeUint16(output, 20);
    writeUint16(output, 0);
    writeUint16(output, 0);
    writeUint16(output, 0);
    writeUint16(output, 0);
    writeUint32(output, file.crc);
    writeUint32(output, file.data.length);
    writeUint32(output, file.data.length);
    writeUint16(output, name.length);
    writeUint16(output, 0);
    append(output, name);
    append(output, file.data);
    writeUint32(central, 0x02014b50);
    writeUint16(central, 20);
    writeUint16(central, 20);
    writeUint16(central, 0);
    writeUint16(central, 0);
    writeUint16(central, 0);
    writeUint16(central, 0);
    writeUint32(central, file.crc);
    writeUint32(central, file.data.length);
    writeUint32(central, file.data.length);
    writeUint16(central, name.length);
    writeUint16(central, 0);
    writeUint16(central, 0);
    writeUint16(central, 0);
    writeUint16(central, 0);
    writeUint32(central, 0);
    writeUint32(central, offset);
    append(central, name);
  }
  const centralOffset = output.length;
  output.push(...central);
  writeUint32(output, 0x06054b50);
  writeUint16(output, 0);
  writeUint16(output, 0);
  writeUint16(output, files.length);
  writeUint16(output, files.length);
  writeUint32(output, central.length);
  writeUint32(output, centralOffset);
  writeUint16(output, 0);
  return new Uint8Array(output);
}

export function comparableWorkbookFilename(payload: AnalysisPayload): string {
  return `appeal-compass-${payload.analysis.subject.effectiveParcel.pin}.xlsx`;
}

export function buildComparableWorkbook(
  payload: AnalysisPayload,
  selection: WorkbookSelection,
): Uint8Array {
  const sheets = buildSheets(payload, selection);
  return zip([
    { path: "[Content_Types].xml", text: contentTypesXml(sheets) },
    { path: "_rels/.rels", text: rootRelsXml() },
    { path: "xl/workbook.xml", text: workbookXml(sheets) },
    { path: "xl/_rels/workbook.xml.rels", text: workbookRelsXml(sheets) },
    { path: "xl/styles.xml", text: stylesXml() },
    ...sheets.map((sheet, index) => ({
      path: `xl/worksheets/sheet${index + 1}.xml`,
      text: sheetXml(sheet.rows),
    })),
  ]);
}

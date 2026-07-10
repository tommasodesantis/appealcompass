import { numberValue } from "../domain/caseSerde";
import { ASSESSMENT_YEAR } from "../domain/config";
import { NotFoundError, UnsupportedPropertyError } from "../domain/errors";
import type {
  AssessmentHistoryRow,
  AssessmentStage,
  AssessmentStages,
  CaseFile,
  Comparable,
  Parcel,
  Sale,
} from "../domain/models";
import { defaultUserEvidence } from "../domain/models";
import { formatPin, normalizePin } from "../domain/pin";
import { propertyClassDecision } from "../domain/propertyClasses";
import type { JsonRecord, SocrataClient, SocrataResponse, SocrataWarning } from "./socrataClient";

export interface CaseRepository {
  loadCaseByPin(pin: string): Promise<CaseFile>;
}

const SUBJECT_MAX_ROWS = 100;
const COMPARABLE_POOL_CAP = 500;
const COMPARABLE_SALES_MAX_ROWS = 2500;
const COMPARABLE_CARD_MAX_ROWS = 2000;

const PARCEL_SELECT = [
  "pin",
  "class",
  "township_name",
  "township_code",
  "nbhd_code",
  "tax_code",
  "lat",
  "lon",
  "year",
  "zip_code",
].join(",");

const RES_SELECT = [
  "pin",
  "card",
  "row_id",
  "pin_is_multicard",
  "pin_num_cards",
  "class",
  "township_code",
  "year",
  "char_bldg_sf",
  "char_land_sf",
  "char_yrblt",
  "char_type_resd",
  "char_ext_wall",
  "char_cnst_qlty",
  "char_air",
  "char_beds",
  "char_fbath",
  "char_hbath",
  "char_frpl",
  "char_gar1_area",
  "char_gar1_size",
  "char_porch",
  "char_bsmt",
  "char_bsmt_fin",
].join(",");

const AV_SELECT = [
  "pin",
  "year",
  "mailed_tot",
  "certified_tot",
  "board_tot",
  "mailed_land",
  "certified_land",
  "board_land",
  "mailed_bldg",
  "certified_bldg",
  "board_bldg",
].join(",");

const SALES_SELECT = ["pin", "sale_date", "sale_price"].join(",");

function stringValue(value: unknown): string {
  return value === null || value === undefined ? "" : String(value);
}

function nullableString(value: unknown): string | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }
  return String(value);
}

function intValue(value: unknown): number | null {
  const parsed = numberValue(value);
  return parsed === null ? null : Math.trunc(parsed);
}

function pick(row: JsonRecord, ...names: string[]): unknown {
  for (const name of names) {
    const value = row[name];
    if (value !== null && value !== undefined && value !== "") {
      return value;
    }
  }
  return null;
}

function rowYear(row: JsonRecord): number | null {
  return intValue(row.year ?? row.tax_year);
}

function latestRow(rows: JsonRecord[]): JsonRecord {
  return [...rows].sort((a, b) => (rowYear(a) ?? 0) - (rowYear(b) ?? 0)).at(-1) ?? {};
}

function hasAssessmentValue(row: JsonRecord): boolean {
  const total = numberValue(pick(row, "board_tot", "certified_tot", "mailed_tot"));
  const improvement = numberValue(pick(row, "board_bldg", "certified_bldg", "mailed_bldg"));
  return (total !== null && total > 0) || (improvement !== null && improvement > 0);
}

interface AssessmentValues {
  total: number | null;
  improvement: number | null;
  land: number | null;
  year: number | null;
  stages: AssessmentStages;
  componentsReconciled: boolean;
}

function assessmentComponent(
  row: JsonRecord,
  names: { board: string; certified: string; mailed: string },
): { value: number | null; stage: AssessmentStage } {
  for (const stage of ["board", "certified", "mailed"] as const) {
    const value = numberValue(row[names[stage]]);
    if (value !== null) {
      return { value, stage };
    }
  }
  return { value: null, stage: null };
}

function latestAssessmentValues(rows: JsonRecord[]): AssessmentValues {
  const valueRows = rows.filter(hasAssessmentValue);
  if (valueRows.length === 0) {
    return {
      total: null,
      improvement: null,
      land: null,
      year: null,
      stages: { total: null, improvement: null, land: null },
      componentsReconciled: false,
    };
  }
  const row = latestRow(valueRows);
  const total = assessmentComponent(row, {
    board: "board_tot",
    certified: "certified_tot",
    mailed: "mailed_tot",
  });
  const improvement = assessmentComponent(row, {
    board: "board_bldg",
    certified: "certified_bldg",
    mailed: "mailed_bldg",
  });
  const land = assessmentComponent(row, {
    board: "board_land",
    certified: "certified_land",
    mailed: "mailed_land",
  });
  const componentsReconciled =
    total.value !== null &&
    improvement.value !== null &&
    land.value !== null &&
    Math.abs(total.value - improvement.value - land.value) < 1;
  return {
    total: total.value,
    improvement: improvement.value,
    land: land.value,
    year: rowYear(row),
    stages: {
      total: total.stage,
      improvement: improvement.stage,
      land: land.stage,
    },
    componentsReconciled,
  };
}

function styleKey(row: JsonRecord): string | null {
  const pieces = [
    pick(row, "char_type_resd"),
    pick(row, "char_ext_wall"),
    pick(row, "char_cnst_qlty"),
  ]
    .filter((value) => value !== null && value !== undefined && value !== "")
    .map((value) => String(value).trim());
  return pieces.length > 0 ? pieces.join("|") : null;
}

function amenityCount(row: JsonRecord): number {
  const names = [
    "char_air",
    "char_beds",
    "char_fbath",
    "char_hbath",
    "char_frpl",
    "char_gar1_area",
    "char_gar1_size",
    "char_porch",
    "char_bsmt",
    "char_bsmt_fin",
  ];
  return names.filter((name) => {
    const value = row[name];
    return value !== null && value !== undefined && value !== "" && value !== "0" && value !== 0;
  }).length;
}

function truthy(value: unknown): boolean {
  return value === true || value === 1 || value === "1" || String(value).toLowerCase() === "true";
}

function positiveValues(rows: JsonRecord[], ...names: string[]): number[] {
  return rows
    .map((row) => numberValue(pick(row, ...names)))
    .filter((value): value is number => value !== null && value > 0);
}

function weightedMedianYear(rows: JsonRecord[]): number | null {
  const values = rows
    .map((row) => ({
      year: intValue(pick(row, "char_yrblt", "yrblt")),
      weight: numberValue(pick(row, "char_bldg_sf", "bldg_sf")) ?? 0,
    }))
    .filter(
      (item): item is { year: number; weight: number } =>
        item.year !== null && item.year > 0 && item.weight > 0,
    )
    .sort((a, b) => a.year - b.year);
  const totalWeight = values.reduce((sum, item) => sum + item.weight, 0);
  if (totalWeight <= 0) {
    return null;
  }
  let cumulative = 0;
  for (const item of values) {
    cumulative += item.weight;
    if (cumulative >= totalWeight / 2) {
      return item.year;
    }
  }
  return values.at(-1)?.year ?? null;
}

interface AggregatedCharacteristics {
  buildingSqft: number | null;
  landSqft: number | null;
  yearBuilt: number | null;
  style: string | null;
  amenityCount: number;
  beds: number | null;
  fullBaths: number | null;
  isMulticard: boolean;
  cardCount: number;
  cardClasses: string[];
  characteristicsReconciled: boolean;
}

function aggregateCharacteristics(
  rows: JsonRecord[],
  fallbackClass: string | null,
): AggregatedCharacteristics {
  if (rows.length === 0) {
    return {
      buildingSqft: null,
      landSqft: null,
      yearBuilt: null,
      style: null,
      amenityCount: 0,
      beds: null,
      fullBaths: null,
      isMulticard: false,
      cardCount: 0,
      cardClasses: fallbackClass ? [fallbackClass] : [],
      characteristicsReconciled: false,
    };
  }

  const latestYear = Math.max(...rows.map((row) => rowYear(row) ?? 0));
  const yearRows = latestYear > 0 ? rows.filter((row) => rowYear(row) === latestYear) : rows;
  const cards = new Map<string, JsonRecord>();
  yearRows.forEach((row, index) => {
    const card = nullableString(pick(row, "card"));
    const rowId = nullableString(pick(row, "row_id"));
    cards.set(card ? `card:${card}` : rowId ? `row:${rowId}` : `index:${index}`, row);
  });
  const uniqueRows = [...cards.values()];
  const expectedCards = Math.max(
    0,
    ...uniqueRows.map((row) => intValue(pick(row, "pin_num_cards")) ?? 0),
  );
  const isMulticard =
    expectedCards > 1 ||
    uniqueRows.length > 1 ||
    uniqueRows.some((row) => truthy(row.pin_is_multicard));
  const cardClasses = unique(
    uniqueRows
      .map((row) => nullableString(pick(row, "class")) ?? fallbackClass)
      .filter((value): value is string => Boolean(value)),
  ).sort();
  const buildingValues = positiveValues(uniqueRows, "char_bldg_sf", "bldg_sf");
  const landValues = positiveValues(uniqueRows, "char_land_sf", "land_sf");
  const bedValues = positiveValues(uniqueRows, "char_beds");
  const bathValues = positiveValues(uniqueRows, "char_fbath");
  const styleValues = unique(
    uniqueRows.map((row) => styleKey(row)).filter((value): value is string => value !== null),
  );
  const allClassesSupported = cardClasses.every(
    (propertyClass) => propertyClassDecision(propertyClass).supported,
  );
  const expectedCountMatches = expectedCards === 0 || expectedCards === uniqueRows.length;
  const allCardsHaveBuildingArea = buildingValues.length === uniqueRows.length;

  return {
    buildingSqft:
      buildingValues.length > 0 ? buildingValues.reduce((sum, value) => sum + value, 0) : null,
    landSqft: landValues.length > 0 ? Math.max(...landValues) : null,
    yearBuilt: weightedMedianYear(uniqueRows),
    style: styleValues.length === 1 ? (styleValues[0] ?? null) : null,
    amenityCount: uniqueRows.reduce((sum, row) => sum + amenityCount(row), 0),
    beds: bedValues.length > 0 ? bedValues.reduce((sum, value) => sum + value, 0) : null,
    fullBaths: bathValues.length > 0 ? bathValues.reduce((sum, value) => sum + value, 0) : null,
    isMulticard,
    cardCount: uniqueRows.length,
    cardClasses,
    characteristicsReconciled:
      uniqueRows.length > 0 &&
      buildingValues.length > 0 &&
      allClassesSupported &&
      expectedCountMatches &&
      (!isMulticard || allCardsHaveBuildingArea),
  };
}

function groupByPin(rows: JsonRecord[]): Map<string, JsonRecord[]> {
  const grouped = new Map<string, JsonRecord[]>();
  for (const row of rows) {
    const rawPin = row.pin;
    if (!rawPin) {
      continue;
    }
    try {
      const pin = normalizePin(String(rawPin));
      grouped.set(pin, [...(grouped.get(pin) ?? []), row]);
    } catch {}
  }
  return grouped;
}

function unique(items: string[]): string[] {
  return [...new Set(items)];
}

function parseSaleDate(value: unknown): string | null {
  if (!value) {
    return null;
  }
  const text = String(value);
  if (/^\d{4}-\d{2}-\d{2}/.test(text)) {
    return text.slice(0, 10);
  }
  const match = /^(\d{1,2})\/(\d{1,2})\/(\d{4})/.exec(text);
  if (!match) {
    return null;
  }
  const [, month, day, year] = match;
  return `${year}-${month?.padStart(2, "0")}-${day?.padStart(2, "0")}`;
}

function saleFromRow(row: JsonRecord): Sale | null {
  const saleDate = parseSaleDate(pick(row, "sale_date"));
  const salePrice = numberValue(pick(row, "sale_price"));
  if (!saleDate || salePrice === null || salePrice <= 1000) {
    return null;
  }
  return { saleDate, salePrice, source: "recorded sale" };
}

function latestSale(sales: Sale[]): Sale | null {
  return [...sales].sort((a, b) => b.saleDate.localeCompare(a.saleDate))[0] ?? null;
}

function logInternalWarning(pin: string, warning: SocrataWarning): void {
  console.log(
    JSON.stringify({
      event: "appeal_compass.socrata_internal_warning",
      pin: formatPin(pin),
      dataset: warning.dataset,
      message: warning.message,
    }),
  );
}

function collectSocrataWarnings(response: SocrataResponse, warnings: string[], pin: string): void {
  for (const warning of response.warnings) {
    if (warning.audience === "internal") {
      logInternalWarning(pin, warning);
      continue;
    }
    warnings.push(warning.message);
  }
}

function responseRows(response: SocrataResponse, warnings: string[], pin: string): JsonRecord[] {
  collectSocrataWarnings(response, warnings, pin);
  return response.rows;
}

export class SocrataRepository implements CaseRepository {
  constructor(private readonly client: SocrataClient) {}

  async loadCaseByPin(pin: string): Promise<CaseFile> {
    const normalized = normalizePin(pin);
    const warnings: string[] = [];

    let parcelRows = responseRows(
      await this.client.fetchAll(
        "parcel_universe",
        {
          $select: PARCEL_SELECT,
          $where: `pin='${normalized}' AND year='${ASSESSMENT_YEAR}'`,
        },
        { maxRows: SUBJECT_MAX_ROWS },
      ),
      warnings,
      normalized,
    );
    if (parcelRows.length === 0) {
      parcelRows = responseRows(
        await this.client.fetchAll(
          "parcel_universe",
          { $select: PARCEL_SELECT, $where: `pin='${normalized}'` },
          { maxRows: SUBJECT_MAX_ROWS },
        ),
        warnings,
        normalized,
      );
      if (parcelRows.length > 0) {
        warnings.push(
          `We couldn't find ${ASSESSMENT_YEAR} parcel details for this property, so we're using the most recent available details (${
            rowYear(latestRow(parcelRows)) ?? "unknown"
          }). Double-check current property details at the official source.`,
        );
      }
    }
    if (parcelRows.length === 0) {
      throw new NotFoundError(`PIN ${formatPin(normalized)} was not found in the parcel universe.`);
    }
    const universe = latestRow(parcelRows);
    const classDecision = propertyClassDecision(nullableString(pick(universe, "class")));
    if (!classDecision.supported) {
      const classText = classDecision.propertyClass
        ? `property class ${classDecision.propertyClass}`
        : "an unavailable property class";
      throw new UnsupportedPropertyError(
        `Appeal Compass currently supports residential dwellings and residential condominiums only. PIN ${formatPin(normalized)} is classified as ${classDecision.category} (${classText}), so no evidence analysis was run. If interested in a similar tool for commercial properties reach out here.`,
        formatPin(normalized),
        classDecision.propertyClass,
        classDecision.category,
      );
    }

    let charRows = responseRows(
      await this.client.fetchAll(
        "res_characteristics",
        {
          $select: RES_SELECT,
          $where: `pin='${normalized}' AND year='${ASSESSMENT_YEAR}'`,
        },
        { maxRows: SUBJECT_MAX_ROWS },
      ),
      warnings,
      normalized,
    );
    if (charRows.length === 0) {
      charRows = responseRows(
        await this.client.fetchAll(
          "res_characteristics",
          { $select: RES_SELECT, $where: `pin='${normalized}'` },
          { maxRows: SUBJECT_MAX_ROWS },
        ),
        warnings,
        normalized,
      );
      if (charRows.length > 0) {
        warnings.push(
          `We couldn't find ${ASSESSMENT_YEAR} residential characteristics for this property, so we're using the most recent available characteristics (${
            rowYear(latestRow(charRows)) ?? "unknown"
          }). Double-check current property characteristics at the official source.`,
        );
      }
    }
    const characteristics = aggregateCharacteristics(charRows, classDecision.propertyClass);
    if (charRows.length === 0) {
      warnings.push(
        "Residential characteristics were unavailable; square-foot and comparable analysis may be limited.",
      );
    }
    if (characteristics.isMulticard && characteristics.characteristicsReconciled) {
      warnings.push(
        `This parcel has ${characteristics.cardCount} residential property cards. Building sqft and improvement details were combined across all cards before comparison.`,
      );
    }
    if (!characteristics.characteristicsReconciled && charRows.length > 0) {
      warnings.push(
        "Residential property-card details could not be fully reconciled. Comparable conclusions and savings are suppressed until every card and residential class can be verified.",
      );
    }

    let avRows = responseRows(
      await this.client.fetchAll(
        "assessed_values",
        { $select: AV_SELECT, $where: `pin='${normalized}' AND year='${ASSESSMENT_YEAR}'` },
        { maxRows: SUBJECT_MAX_ROWS },
      ),
      warnings,
      normalized,
    );
    if (avRows.length === 0) {
      avRows = responseRows(
        await this.client.fetchAll(
          "assessed_values",
          { $select: AV_SELECT, $where: `pin='${normalized}'` },
          { maxRows: SUBJECT_MAX_ROWS },
        ),
        warnings,
        normalized,
      );
      if (avRows.length > 0) {
        warnings.push(
          `We couldn't find ${ASSESSMENT_YEAR} assessment values for this property, so we're using the most recent available values (${
            rowYear(latestRow(avRows)) ?? "unknown"
          }). Double-check current values at the official source.`,
        );
      }
    }
    let assessment = latestAssessmentValues(avRows);
    if (avRows.length > 0 && assessment.total === null && assessment.improvement === null) {
      avRows = responseRows(
        await this.client.fetchAll(
          "assessed_values",
          { $select: AV_SELECT, $where: `pin='${normalized}'` },
          { maxRows: SUBJECT_MAX_ROWS },
        ),
        warnings,
        normalized,
      );
      assessment = latestAssessmentValues(avRows);
      if (assessment.total !== null || assessment.improvement !== null) {
        warnings.push(
          `We found a ${ASSESSMENT_YEAR} assessment row, but it did not include usable assessed values, so we're using the most recent value-bearing year (${
            assessment.year ?? "unknown"
          }). Double-check current values at the official source.`,
        );
      }
    }

    const selectedAssessmentYear = assessment.year;
    if (
      selectedAssessmentYear !== null &&
      !avRows.some((row) => (rowYear(row) ?? selectedAssessmentYear) < selectedAssessmentYear)
    ) {
      const priorResponse = await this.client.fetchAll(
        "assessed_values",
        {
          $select: AV_SELECT,
          $where: `pin='${normalized}' AND year<'${selectedAssessmentYear}'`,
        },
        { maxRows: SUBJECT_MAX_ROWS },
      );
      avRows = [
        ...avRows,
        ...responseRows(priorResponse, warnings, normalized).filter(
          (row) => rowYear(row) !== selectedAssessmentYear,
        ),
      ];
    }

    const assessmentHistory = assessmentHistoryFromRows(avRows);
    const priorFinalAv =
      [...assessmentHistory]
        .reverse()
        .find(
          (row) =>
            assessment.year !== null &&
            row.year < assessment.year &&
            row.finalAv !== null &&
            row.finalAv > 0,
        )?.finalAv ?? null;
    if (assessment.total !== null && !assessment.componentsReconciled) {
      warnings.push(
        "Total AV could not be reconciled to Improvement AV plus Land AV in the selected assessment row. Automated reduction and savings estimates are suppressed.",
      );
    }
    const usedStages = unique(
      [assessment.stages.total, assessment.stages.improvement, assessment.stages.land].filter(
        (stage): stage is Exclude<AssessmentStage, null> => stage !== null,
      ),
    );
    if (usedStages.length > 1) {
      warnings.push(
        "The selected Total, Improvement, and Land AV components come from different assessment stages. The amounts reconcile arithmetically, but verify the official assessment record before filing.",
      );
    }

    const parcel: Parcel = {
      pin: normalized,
      pinFormatted: formatPin(normalized),
      propertyClass: stringValue(pick(universe, "class")),
      townshipName: stringValue(pick(universe, "township_name")),
      address: "",
      city: "",
      zipCode: stringValue(pick(universe, "zip_code", "prop_address_zipcode_1")),
      neighborhood: nullableString(pick(universe, "nbhd_code", "nbhd", "town_nbhd")),
      townshipCode: nullableString(pick(universe, "township_code")),
      taxCode: nullableString(pick(universe, "tax_code")),
      buildingSqft: characteristics.buildingSqft,
      landSqft: characteristics.landSqft,
      yearBuilt: characteristics.yearBuilt,
      style: characteristics.style,
      amenityCount: characteristics.amenityCount,
      beds: characteristics.beds,
      fullBaths: characteristics.fullBaths,
      lat: numberValue(pick(universe, "lat", "latitude")),
      lon: numberValue(pick(universe, "lon", "longitude")),
      assessmentYear: assessment.year,
      currentAv: assessment.total,
      currentImprovementAv: assessment.improvement,
      currentLandAv: assessment.land,
      priorFinalAv,
      assessmentStages: assessment.stages,
      assessmentComponentsReconciled: assessment.componentsReconciled,
      isMulticard: characteristics.isMulticard,
      cardCount: characteristics.cardCount,
      cardClasses: characteristics.cardClasses,
      characteristicsReconciled: characteristics.characteristicsReconciled,
    };
    if (assessment.total === null) {
      warnings.push(
        "Current assessed value was unavailable; savings and market-value estimates are limited.",
      );
    }

    const [comparables, comparableWarnings] = await this.loadComparables(parcel);
    warnings.push(...comparableWarnings);
    const [subjectSales, salesWarnings] = await this.loadSales(normalized);
    warnings.push(...salesWarnings);

    return {
      parcel,
      assessmentHistory,
      comparables,
      subjectSales,
      userEvidence: defaultUserEvidence(),
      dataWarnings: unique(warnings),
    };
  }

  private async loadSales(pin: string): Promise<[Sale[], string[]]> {
    const response = await this.client.fetchAll(
      "parcel_sales",
      { $select: SALES_SELECT, $where: `pin='${pin}'` },
      { maxRows: SUBJECT_MAX_ROWS },
    );
    const warnings: string[] = [];
    collectSocrataWarnings(response, warnings, pin);
    const sales = response.rows
      .map((row) => saleFromRow(row))
      .filter((sale): sale is Sale => sale !== null)
      .sort((a, b) => b.saleDate.localeCompare(a.saleDate));
    return [sales, warnings];
  }

  private async loadComparableSales(pins: string[], pinForWarnings: string) {
    const uniquePins = unique(pins).slice(0, COMPARABLE_POOL_CAP);
    const salesByPin = new Map<string, Sale>();
    if (uniquePins.length === 0) {
      return [salesByPin, []] as const;
    }
    const response = await this.client.fetchAll(
      "parcel_sales",
      {
        $select: SALES_SELECT,
        $where: `pin in(${uniquePins.map((pin) => `'${pin}'`).join(",")})`,
        $order: "pin,sale_date DESC",
      },
      { maxRows: COMPARABLE_SALES_MAX_ROWS },
    );
    const warnings: string[] = [];
    collectSocrataWarnings(response, warnings, pinForWarnings);
    const grouped = new Map<string, Sale[]>();
    for (const row of response.rows) {
      if (!row.pin) {
        continue;
      }
      const sale = saleFromRow(row);
      if (!sale) {
        continue;
      }
      try {
        const pin = normalizePin(String(row.pin));
        grouped.set(pin, [...(grouped.get(pin) ?? []), sale]);
      } catch {}
    }
    for (const [pin, sales] of grouped.entries()) {
      const sale = latestSale(sales);
      if (sale) {
        salesByPin.set(pin, sale);
      }
    }
    return [salesByPin, warnings] as const;
  }

  private async loadComparables(parcel: Parcel): Promise<[Comparable[], string[]]> {
    const warnings: string[] = [];
    if (!parcel.townshipCode || !parcel.propertyClass) {
      return [
        [],
        ["Comparable search was skipped because township code or property class was unavailable."],
      ];
    }
    const where = `township_code='${parcel.townshipCode}' AND class='${parcel.propertyClass}'`;
    const yearWhere = `${where} AND year='${ASSESSMENT_YEAR}'`;

    let comparableCharacteristicsYear: number | null = ASSESSMENT_YEAR;
    let chars = responseRows(
      await this.client.fetchAll(
        "res_characteristics",
        { $select: RES_SELECT, $where: yearWhere, $order: "pin,card" },
        { maxRows: COMPARABLE_POOL_CAP },
      ),
      warnings,
      parcel.pin,
    );
    if (chars.length === 0) {
      comparableCharacteristicsYear = null;
      chars = responseRows(
        await this.client.fetchAll(
          "res_characteristics",
          { $select: RES_SELECT, $where: where, $order: "year DESC,pin,card" },
          { maxRows: COMPARABLE_POOL_CAP },
        ),
        warnings,
        parcel.pin,
      );
      if (chars.length > 0) {
        warnings.push(
          `We couldn't find ${ASSESSMENT_YEAR} comparable characteristics for this township/class, so we're using the most recent available comparable characteristics. Double-check current comparable property details at the official source.`,
        );
      }
    }

    const multicardPins = unique(
      chars
        .filter((row) => truthy(row.pin_is_multicard) || (intValue(row.pin_num_cards) ?? 0) > 1)
        .map((row) => stringValue(row.pin))
        .filter(Boolean)
        .map(normalizePin),
    );
    for (let offset = 0; offset < multicardPins.length; offset += 100) {
      const pinChunk = multicardPins.slice(offset, offset + 100);
      const pinWhere = `pin in(${pinChunk.map((pin) => `'${pin}'`).join(",")})`;
      const yearClause =
        comparableCharacteristicsYear === null
          ? ""
          : ` AND year='${comparableCharacteristicsYear}'`;
      const siblingRows = responseRows(
        await this.client.fetchAll(
          "res_characteristics",
          {
            $select: RES_SELECT,
            $where: `${pinWhere}${yearClause}`,
            $order: comparableCharacteristicsYear === null ? "year DESC,pin,card" : "pin,card",
          },
          { maxRows: COMPARABLE_CARD_MAX_ROWS },
        ),
        warnings,
        parcel.pin,
      );
      chars = [...chars, ...siblingRows];
    }

    let avs = responseRows(
      await this.client.fetchAll(
        "assessed_values",
        { $select: AV_SELECT, $where: yearWhere, $order: "pin" },
        { maxRows: COMPARABLE_POOL_CAP },
      ),
      warnings,
      parcel.pin,
    );
    if (avs.length > 0 && !avs.some(hasAssessmentValue)) {
      const priorYear = ASSESSMENT_YEAR - 1;
      const priorResponse = await this.client.fetchAll(
        "assessed_values",
        {
          $select: AV_SELECT,
          $where: `${where} AND year='${priorYear}'`,
          $order: "pin",
        },
        { maxRows: COMPARABLE_POOL_CAP },
      );
      collectSocrataWarnings(priorResponse, warnings, parcel.pin);
      if (priorResponse.rows.length > 0) {
        avs = priorResponse.rows;
        warnings.push(
          `We found ${ASSESSMENT_YEAR} comparable assessment rows, but they did not include usable assessed values, so we're using ${priorYear} value-bearing rows. Double-check current comparable values at the official source.`,
        );
      }
    }
    if (avs.length === 0) {
      avs = responseRows(
        await this.client.fetchAll(
          "assessed_values",
          { $select: AV_SELECT, $where: where, $order: "year DESC,pin" },
          { maxRows: COMPARABLE_POOL_CAP },
        ),
        warnings,
        parcel.pin,
      );
      if (avs.length > 0) {
        warnings.push(
          `We couldn't find ${ASSESSMENT_YEAR} comparable assessment values for this township/class, so we're using the most recent available comparable values. Double-check current comparable values at the official source.`,
        );
      }
    }

    let universeRows = responseRows(
      await this.client.fetchAll(
        "parcel_universe",
        { $select: PARCEL_SELECT, $where: yearWhere, $order: "pin" },
        { maxRows: COMPARABLE_POOL_CAP },
      ),
      warnings,
      parcel.pin,
    );
    if (universeRows.length === 0) {
      universeRows = responseRows(
        await this.client.fetchAll(
          "parcel_universe",
          { $select: PARCEL_SELECT, $where: where, $order: "year DESC,pin" },
          { maxRows: COMPARABLE_POOL_CAP },
        ),
        warnings,
        parcel.pin,
      );
      if (universeRows.length > 0) {
        warnings.push(
          `We couldn't find ${ASSESSMENT_YEAR} comparable parcel details for this township/class, so we're using the most recent available comparable parcel details. Double-check current comparable property details at the official source.`,
        );
      }
    }

    const avRowsByPin = groupByPin(avs);
    const universeByPin = groupByPin(universeRows);
    const charRowsByPin = groupByPin(chars);
    const comparablePins = [...charRowsByPin.keys()].filter((pin) => pin !== parcel.pin);
    const [salesByPin, salesWarnings] = await this.loadComparableSales(comparablePins, parcel.pin);
    warnings.push(...salesWarnings);
    const comps: Comparable[] = [];
    for (const [compPin, rows] of charRowsByPin.entries()) {
      if (compPin === parcel.pin) {
        continue;
      }
      const assessment = latestAssessmentValues(avRowsByPin.get(compPin) ?? []);
      const universe = universeByPin.has(compPin)
        ? latestRow(universeByPin.get(compPin) ?? [])
        : {};
      const propertyClass = nullableString(pick(universe, "class")) ?? parcel.propertyClass;
      const characteristics = aggregateCharacteristics(rows, propertyClass);
      const sale = salesByPin.get(compPin);
      comps.push({
        pin: compPin,
        pinFormatted: formatPin(compPin),
        address: "",
        propertyClass,
        buildingSqft: characteristics.buildingSqft,
        yearBuilt: characteristics.yearBuilt,
        saleDate: sale?.saleDate ?? null,
        salePrice: sale?.salePrice ?? null,
        assessmentYear: assessment.year,
        av: assessment.total,
        improvementAv: assessment.improvement,
        landAv: assessment.land,
        landSqft: characteristics.landSqft,
        style: characteristics.style,
        amenityCount: characteristics.amenityCount,
        neighborhood: nullableString(
          pick(universe, "nbhd_code", "nbhd", "town_nbhd") ?? pick(rows[0] ?? {}, "nbhd"),
        ),
        lat: numberValue(pick(universe, "lat", "latitude")),
        lon: numberValue(pick(universe, "lon", "longitude")),
        assessmentStages: assessment.stages,
        assessmentComponentsReconciled: assessment.componentsReconciled,
        isMulticard: characteristics.isMulticard,
        cardCount: characteristics.cardCount,
        cardClasses: characteristics.cardClasses,
        characteristicsReconciled: characteristics.characteristicsReconciled,
      });
    }
    if (comps.length === 0) {
      warnings.push(
        "No comparable characteristic rows were returned for the subject township/class.",
      );
    }
    return [comps, warnings];
  }
}

function assessmentHistoryFromRows(rows: JsonRecord[]): AssessmentHistoryRow[] {
  return rows
    .map((row) => ({
      year: rowYear(row) ?? 0,
      mailedAv: numberValue(pick(row, "mailed_tot")),
      certifiedAv: numberValue(pick(row, "certified_tot")),
      boardAv: numberValue(pick(row, "board_tot")),
      finalAv: numberValue(pick(row, "board_tot", "certified_tot", "mailed_tot")),
    }))
    .filter((row) => row.year > 0)
    .sort((a, b) => a.year - b.year);
}

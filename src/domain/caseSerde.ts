import { defaultUserEvidence } from "./models";
import type { AssessmentStage, AssessmentStages } from "./models";
import { formatPin, normalizePin } from "./pin";
import type {
  AssessmentHistoryRow,
  CaseFile,
  Comparable,
  JsonValue,
  Parcel,
  Sale,
} from "./serdeTypes";

type JsonRecord = Record<string, JsonValue>;

function record(value: unknown): JsonRecord {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as JsonRecord) : {};
}

function array(value: unknown): JsonValue[] {
  return Array.isArray(value) ? value : [];
}

function stringValue(value: unknown): string {
  return value === null || value === undefined ? "" : String(value);
}

function nullableString(value: unknown): string | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }
  return String(value);
}

export function numberValue(value: unknown): number | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }
  const parsed = Number(String(value).replace(/,/g, ""));
  return Number.isFinite(parsed) ? parsed : null;
}

function intValue(value: unknown): number | null {
  const parsed = numberValue(value);
  return parsed === null ? null : Math.trunc(parsed);
}

function booleanValue(value: unknown, fallback: boolean): boolean {
  if (value === true || value === "true" || value === 1 || value === "1") {
    return true;
  }
  if (value === false || value === "false" || value === 0 || value === "0") {
    return false;
  }
  return fallback;
}

function assessmentStage(value: unknown): AssessmentStage {
  return value === "board" || value === "certified" || value === "mailed" ? value : null;
}

function assessmentStages(value: unknown): AssessmentStages {
  const stages = record(value);
  return {
    total: assessmentStage(stages.total),
    improvement: assessmentStage(stages.improvement),
    land: assessmentStage(stages.land),
  };
}

function stringArray(value: unknown): string[] {
  return array(value).map(String).filter(Boolean);
}

export function parcelFromJson(raw: JsonRecord): Parcel {
  const pin = normalizePin(stringValue(raw.pin));
  return {
    pin,
    pinFormatted: formatPin(pin),
    propertyClass: stringValue(raw.property_class ?? raw.class),
    townshipName: stringValue(raw.township_name),
    address: stringValue(raw.address ?? raw.prop_address_full),
    city: stringValue(raw.city ?? raw.prop_address_city_name),
    zipCode: stringValue(raw.zip_code ?? raw.prop_address_zipcode_1),
    neighborhood: nullableString(raw.neighborhood),
    townshipCode: nullableString(raw.township_code),
    taxCode: nullableString(raw.tax_code),
    buildingSqft: numberValue(raw.building_sqft),
    landSqft: numberValue(raw.land_sqft),
    yearBuilt: intValue(raw.year_built),
    style: nullableString(raw.style),
    amenityCount: Math.trunc(numberValue(raw.amenity_count) ?? 0),
    beds: numberValue(raw.beds),
    fullBaths: numberValue(raw.full_baths),
    lat: numberValue(raw.lat),
    lon: numberValue(raw.lon),
    assessmentYear: intValue(raw.current_assessment_year ?? raw.assessment_year),
    currentAv: numberValue(raw.current_av),
    currentImprovementAv: numberValue(raw.current_improvement_av),
    currentLandAv: numberValue(raw.current_land_av ?? raw.land_av),
    priorFinalAv: numberValue(raw.prior_final_av),
    assessmentStages: assessmentStages(raw.assessment_stages),
    assessmentComponentsReconciled: booleanValue(raw.assessment_components_reconciled, true),
    isMulticard: booleanValue(raw.is_multicard, (intValue(raw.card_count) ?? 1) > 1),
    cardCount: Math.max(1, intValue(raw.card_count) ?? 1),
    cardClasses: stringArray(raw.card_classes),
    characteristicsReconciled: booleanValue(raw.characteristics_reconciled, true),
  };
}

export function comparableFromJson(raw: JsonRecord): Comparable {
  const pin = normalizePin(stringValue(raw.pin));
  return {
    pin,
    pinFormatted: formatPin(pin),
    address: stringValue(raw.address),
    propertyClass: nullableString(raw.property_class ?? raw.class),
    buildingSqft: numberValue(raw.building_sqft),
    yearBuilt: intValue(raw.year_built),
    saleDate: nullableString(raw.sale_date),
    salePrice: numberValue(raw.sale_price),
    assessmentYear: intValue(raw.assessment_year),
    av: numberValue(raw.av),
    improvementAv: numberValue(raw.improvement_av),
    landAv: numberValue(raw.land_av),
    landSqft: numberValue(raw.land_sqft),
    style: nullableString(raw.style),
    amenityCount: Math.trunc(numberValue(raw.amenity_count) ?? 0),
    neighborhood: nullableString(raw.neighborhood),
    lat: numberValue(raw.lat),
    lon: numberValue(raw.lon),
    assessmentStages: assessmentStages(raw.assessment_stages),
    assessmentComponentsReconciled: booleanValue(raw.assessment_components_reconciled, true),
    isMulticard: booleanValue(raw.is_multicard, (intValue(raw.card_count) ?? 1) > 1),
    cardCount: Math.max(1, intValue(raw.card_count) ?? 1),
    cardClasses: stringArray(raw.card_classes),
    characteristicsReconciled: booleanValue(raw.characteristics_reconciled, true),
  };
}

export function caseFileFromJson(rawInput: unknown): CaseFile {
  const raw = record(rawInput);
  const parcel = parcelFromJson(record(raw.parcel));
  const assessmentHistory: AssessmentHistoryRow[] = array(raw.assessment_history).map((item) => {
    const row = record(item);
    return {
      year: Math.trunc(numberValue(row.year) ?? 0),
      mailedAv: numberValue(row.mailed_av),
      certifiedAv: numberValue(row.certified_av),
      boardAv: numberValue(row.board_av),
      finalAv: numberValue(row.final_av),
    };
  });
  const comparables = array(raw.comparables).map((item) => comparableFromJson(record(item)));
  const subjectSales: Sale[] = array(raw.subject_sales)
    .map((item) => {
      const row = record(item);
      const saleDate = nullableString(row.sale_date);
      const salePrice = numberValue(row.sale_price);
      if (!saleDate || salePrice === null) {
        return null;
      }
      return {
        saleDate,
        salePrice,
        source: "recorded sale",
      };
    })
    .filter((item): item is Sale => item !== null);
  const dataWarnings = array(raw.data_warnings).map((item) => String(item));

  return {
    parcel,
    assessmentHistory,
    comparables,
    subjectSales,
    userEvidence: defaultUserEvidence(),
    dataWarnings,
  };
}

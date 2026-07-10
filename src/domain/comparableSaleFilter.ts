import { ASSESSMENT_YEAR } from "./config";
import { isWithinYearsOf } from "./math";
import type { ResolvedVenue } from "./models";

export const SALE_RECENCY_YEARS = 3;

export interface ValueEvidencePolicy {
  years: number;
  description: string;
  exactRule: boolean;
}

export function lienDateForAssessmentYear(assessmentYear: number | null): string {
  return `${assessmentYear ?? ASSESSMENT_YEAR}-01-01`;
}

export function valueEvidencePolicy(venue: ResolvedVenue | null): ValueEvidencePolicy {
  if (venue === "assessor" || venue === "closed" || venue === null) {
    return {
      years: 2,
      description: "Assessor two-year value-evidence window",
      exactRule: true,
    };
  }
  if (venue === "bor") {
    return {
      years: 3,
      description: "Board of Review three-year purchase-evidence window",
      exactRule: true,
    };
  }
  return {
    years: 3,
    description:
      "conservative three-year PTAB screening window; PTAB asks for evidence as close as possible to January 1",
    exactRule: false,
  };
}

export type ComparableSaleFilter = "all" | "recent" | "recorded";

export function parseComparableSaleFilter(value: string | null): ComparableSaleFilter {
  return value === "recent" || value === "recorded" ? value : "all";
}

interface ComparableSaleRow {
  comparable: {
    saleDate: string | null;
    salePrice: number | null;
  };
}

export function hasRecordedSale(exhibit: ComparableSaleRow): boolean {
  return Boolean(
    exhibit.comparable.saleDate &&
      exhibit.comparable.salePrice !== null &&
      exhibit.comparable.salePrice > 0,
  );
}

export function isRecentSaleDate(
  saleDate: string | null,
  assessmentYear: number | null = ASSESSMENT_YEAR,
  years = SALE_RECENCY_YEARS,
): boolean {
  const lienDate = lienDateForAssessmentYear(assessmentYear);
  if (!saleDate || !/^\d{4}-\d{2}-\d{2}$/.test(saleDate) || saleDate > lienDate) {
    return false;
  }
  return isWithinYearsOf(saleDate, lienDate, years);
}

export function isQualifyingValueEvidenceDate(
  evidenceDate: string | null,
  assessmentYear: number | null,
  venue: ResolvedVenue | null,
): boolean {
  return isRecentSaleDate(evidenceDate, assessmentYear, valueEvidencePolicy(venue).years);
}

export function filterByComparableSale<T extends ComparableSaleRow>(
  pool: T[],
  filter: ComparableSaleFilter,
  assessmentYear: number | null = ASSESSMENT_YEAR,
): T[] {
  if (filter === "recent") {
    return pool.filter(
      (item) => hasRecordedSale(item) && isRecentSaleDate(item.comparable.saleDate, assessmentYear),
    );
  }
  if (filter === "recorded") {
    return pool.filter(hasRecordedSale);
  }
  return [...pool];
}

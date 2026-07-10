import {
  filterByComparableSale,
  isQualifyingValueEvidenceDate,
  isRecentSaleDate,
  parseComparableSaleFilter,
  valueEvidencePolicy,
} from "./comparableSaleFilter";
import type { ComparableExhibit } from "./models";
import { makeComparable } from "./testHelpers";

function exhibit(saleDate: string | null, salePrice: number | null): ComparableExhibit {
  return {
    comparable: makeComparable({ saleDate, salePrice }),
    avPerSqft: 20,
    distanceKm: 0.5,
    similarity: 0.1,
  };
}

test("sale recency is anchored to the configured assessment-year lien date", () => {
  expect(isRecentSaleDate("2023-01-01")).toBe(true);
  expect(isRecentSaleDate("2022-12-31")).toBe(false);
  expect(isRecentSaleDate("2026-01-02")).toBe(false);
  expect(isRecentSaleDate(null)).toBe(false);
});

test("comparable sale filters distinguish recent, recorded, and all rows", () => {
  const recent = exhibit("2024-05-01", 400000);
  const stale = exhibit("2019-05-01", 300000);
  const unavailable = exhibit(null, null);
  const pool = [recent, stale, unavailable];

  expect(filterByComparableSale(pool, "all")).toEqual(pool);
  expect(filterByComparableSale(pool, "recorded")).toEqual([recent, stale]);
  expect(filterByComparableSale(pool, "recent")).toEqual([recent]);
  expect(parseComparableSaleFilter("unexpected")).toBe("all");
});

test("subject value-evidence windows vary by assessment year and venue", () => {
  expect(isQualifyingValueEvidenceDate("2023-01-01", 2025, "assessor")).toBe(true);
  expect(isQualifyingValueEvidenceDate("2022-12-31", 2025, "assessor")).toBe(false);
  expect(isQualifyingValueEvidenceDate("2022-01-01", 2025, "bor")).toBe(true);
  expect(isQualifyingValueEvidenceDate("2025-01-02", 2025, "bor")).toBe(false);
  expect(valueEvidencePolicy("ptab").exactRule).toBe(false);
});

test("comparable recency follows the subject assessment year", () => {
  expect(isRecentSaleDate("2021-01-01", 2024)).toBe(true);
  expect(isRecentSaleDate("2020-12-31", 2024)).toBe(false);
});

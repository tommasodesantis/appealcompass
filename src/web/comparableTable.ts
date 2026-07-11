import type { ComparableExhibit } from "../domain/models";
import type { ComparableTableState } from "./sessionState";

export type ComparableSortKey =
  | "distance"
  | "buildingSqft"
  | "yearBuilt"
  | "saleDate"
  | "salePrice"
  | "improvementAvPerSqft"
  | "subjectComparison"
  | "similarity"
  | "landAvPerSqft";

function nullableCompare(a: number | string | null, b: number | string | null): number {
  if (a === null && b === null) return 0;
  if (a === null) return 1;
  if (b === null) return -1;
  return typeof a === "string" && typeof b === "string"
    ? a.localeCompare(b)
    : Number(a) - Number(b);
}

function sortValue(
  row: ComparableExhibit,
  key: ComparableSortKey,
  subjectPsf: number | null,
): number | string | null {
  if (key === "distance") return row.distanceKm;
  if (key === "buildingSqft") return row.comparable.buildingSqft;
  if (key === "yearBuilt") return row.comparable.yearBuilt;
  if (key === "saleDate") return row.comparable.saleDate;
  if (key === "salePrice") return row.comparable.salePrice;
  if (key === "improvementAvPerSqft") return row.improvementAvPerSqft;
  if (key === "subjectComparison") {
    return subjectPsf === null
      ? null
      : ((row.improvementAvPerSqft - subjectPsf) / subjectPsf) * 100;
  }
  if (key === "landAvPerSqft") return row.landAvPerSqft;
  return row.similarity;
}

export function filterAndSortComparables(
  rows: ComparableExhibit[],
  table: ComparableTableState,
  subjectYearBuilt: number | null,
  subjectPsf: number | null,
): ComparableExhibit[] {
  const bands = new Set(table.bands);
  const filtered = rows.filter((row) => {
    if (bands.size > 0 && !bands.has(row.band)) return false;
    if (table.saleFilter === "recorded" && (!row.comparable.saleDate || !row.comparable.salePrice))
      return false;
    if (table.saleFilter === "recent" && !row.recentSale) return false;
    if (table.propertyClass && row.comparable.propertyClass !== table.propertyClass) return false;
    if (table.neighborhood && row.comparable.neighborhood !== table.neighborhood) return false;
    if (
      table.maxDistanceKm !== null &&
      (row.distanceKm === null || row.distanceKm > table.maxDistanceKm)
    )
      return false;
    if (
      table.yearBuiltTolerance !== null &&
      (subjectYearBuilt === null ||
        row.comparable.yearBuilt === null ||
        Math.abs(row.comparable.yearBuilt - subjectYearBuilt) > table.yearBuiltTolerance)
    ) {
      return false;
    }
    return true;
  });
  const key = table.sortKey as ComparableSortKey;
  const direction = table.sortDirection === "desc" ? -1 : 1;
  return [...filtered].sort((a, b) => {
    const compared = nullableCompare(sortValue(a, key, subjectPsf), sortValue(b, key, subjectPsf));
    return compared === 0 ? a.comparable.pin.localeCompare(b.comparable.pin) : direction * compared;
  });
}

export function fastSelectComparablePins(
  rows: ComparableExhibit[],
  action: "all_filtered" | "top3" | "top5" | "top10" | "clear",
): string[] {
  if (action === "clear") return [];
  if (action === "all_filtered") return rows.map((row) => row.comparable.pin);
  const limit = action === "top3" ? 3 : action === "top5" ? 5 : 10;
  return [...rows]
    .sort((a, b) => a.similarity - b.similarity || a.comparable.pin.localeCompare(b.comparable.pin))
    .slice(0, limit)
    .map((row) => row.comparable.pin);
}

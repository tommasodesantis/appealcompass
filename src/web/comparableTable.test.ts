import type { ComparableExhibit } from "../domain/models";
import { makeComparable } from "../domain/testHelpers";
import { fastSelectComparablePins, filterAndSortComparables } from "./comparableTable";
import type { ComparableTableState } from "./sessionState";

function row(
  pin: string,
  similarity: number,
  band: ComparableExhibit["band"],
  distance: number,
): ComparableExhibit {
  return {
    comparable: makeComparable({
      pin,
      pinFormatted: pin,
      saleDate: "2024-01-01",
      salePrice: 400000,
    }),
    improvementAvPerSqft: 20 + similarity,
    landAvPerSqft: 2,
    salePricePerSqft: 200,
    distanceKm: distance,
    similarity,
    band,
    recentSale: true,
  };
}
const table: ComparableTableState = {
  bands: ["excellent", "good", "decent", "broad"],
  saleFilter: "all",
  propertyClass: "",
  neighborhood: "",
  maxDistanceKm: null,
  yearBuiltTolerance: null,
  sortKey: "similarity",
  sortDirection: "asc",
  page: 1,
  pageSize: 10,
};

test("filters and sorting operate in both directions without mutating source rows", () => {
  const rows = [
    row("3", 0.3, "decent", 3),
    row("1", 0.1, "excellent", 1),
    row("2", 0.2, "good", 2),
  ];
  const ascending = filterAndSortComparables(rows, table, 1924, 25);
  expect(ascending.map((item) => item.comparable.pin)).toEqual(["1", "2", "3"]);
  const descending = filterAndSortComparables(rows, { ...table, sortDirection: "desc" }, 1924, 25);
  expect(descending.map((item) => item.comparable.pin)).toEqual(["3", "2", "1"]);
  expect(rows[0]?.comparable.pin).toBe("3");
});

test("fast selection is similarity-based and persists as a PIN set independent of pagination", () => {
  const rows = Array.from({ length: 12 }, (_, index) =>
    row(String(index), 0.01 * (12 - index), "good", index),
  );
  expect(fastSelectComparablePins(rows, "top3")).toEqual(["11", "10", "9"]);
  expect(fastSelectComparablePins(rows, "top10")).toHaveLength(10);
  expect(fastSelectComparablePins(rows, "all_filtered")).toHaveLength(12);
  expect(fastSelectComparablePins(rows, "clear")).toEqual([]);
});

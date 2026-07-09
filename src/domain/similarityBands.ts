export interface SimilarityBand {
  value: string;
  max: number | null;
  label: string;
  meaning: string;
}

export const SIMILARITY_BANDS: SimilarityBand[] = [
  {
    value: "all",
    max: null,
    label: "All selected comps",
    meaning:
      "Show the full generated exhibit, including questionable rows when alternatives are sparse.",
  },
  {
    value: "0.10",
    max: 0.1,
    label: "Excellent (0.00-0.10)",
    meaning: "Excellent",
  },
  {
    value: "0.20",
    max: 0.2,
    label: "Good comp (0.00-0.20)",
    meaning: "Good comp",
  },
  {
    value: "0.35",
    max: 0.35,
    label: "Usable (0.00-0.35)",
    meaning: "Usable, but check the row carefully",
  },
  {
    value: "0.50",
    max: 0.5,
    label: "Broad match (0.00-0.50)",
    meaning: "Broad match; review the row carefully before using it",
  },
];

export function parseSimilarityMax(value: string | null | undefined): number | null {
  if (!value || value === "all") {
    return null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

export function similarityFilterValue(max: number | null): string {
  return max === null ? "all" : max.toFixed(2);
}

export function filterBySimilarity<T extends { similarity: number }>(
  rows: T[],
  max: number | null,
): T[] {
  return max === null ? rows : rows.filter((row) => row.similarity <= max);
}

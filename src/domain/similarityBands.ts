import type { SimilarityBandName } from "./models";

export interface SimilarityBand {
  value: SimilarityBandName;
  minExclusive: number | null;
  maxInclusive: number;
  label: string;
  meaning: string;
}

export const MAX_DISPLAYED_SIMILARITY = 0.5;
export const MAX_ACTIONABLE_SIMILARITY = 0.35;

export const SIMILARITY_BANDS: SimilarityBand[] = [
  {
    value: "excellent",
    minExclusive: null,
    maxInclusive: 0.1,
    label: "Excellent: 0.00–0.10",
    meaning: "Excellent observable match.",
  },
  {
    value: "good",
    minExclusive: 0.1,
    maxInclusive: 0.2,
    label: "Good: >0.10–0.20",
    meaning: "Good observable match.",
  },
  {
    value: "decent",
    minExclusive: 0.2,
    maxInclusive: 0.35,
    label: "Decent: >0.20–0.35",
    meaning: "Actionable screening range; verify the row carefully.",
  },
  {
    value: "broad",
    minExclusive: 0.35,
    maxInclusive: 0.5,
    label: "Broad: >0.35–0.50",
    meaning: "Context only; this row cannot drive a savings calculation.",
  },
];

export function similarityBand(score: number): SimilarityBandName | null {
  if (!Number.isFinite(score) || score < 0 || score > MAX_DISPLAYED_SIMILARITY) {
    return null;
  }
  if (score <= 0.1) return "excellent";
  if (score <= 0.2) return "good";
  if (score <= 0.35) return "decent";
  return "broad";
}

export function filterBySimilarityBands<T extends { band: SimilarityBandName }>(
  rows: T[],
  bands: SimilarityBandName[],
): T[] {
  if (bands.length === 0 || bands.length === SIMILARITY_BANDS.length) return [...rows];
  const selected = new Set(bands);
  return rows.filter((row) => selected.has(row.band));
}

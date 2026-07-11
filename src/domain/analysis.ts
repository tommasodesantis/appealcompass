import { profileForVenue } from "./comparableProfiles";
import type { ComparableProfile } from "./comparableProfiles";
import {
  isQualifyingValueEvidenceDate,
  isRecentSaleDate,
  valueEvidencePolicy,
} from "./comparableSaleFilter";
import {
  ASSESSMENT_LEVEL,
  BOR_RULES_URL,
  CCAO_APPEALS_URL,
  NOT_LEGAL_ADVICE,
  PTAB_RULES_URL,
  STATE_EQUALIZER,
} from "./config";
import { gapPct, medianValue, percentileRank, safeDiv } from "./math";
import type {
  AnalysisCase,
  AnalysisResult,
  Comparable,
  ComparableExhibit,
  ComparableSummary,
  EvidenceCandidate,
  EvidenceStatus,
  EvidenceType,
  Parcel,
  ResolvedVenue,
  SavingsCalculation,
  SavingsMethod,
  SimilarityBandName,
  SimilarityGroupKey,
  SimilarityGroupSummary,
} from "./models";
import { isCondo } from "./models";
import {
  MAX_ACTIONABLE_SIMILARITY,
  MAX_DISPLAYED_SIMILARITY,
  similarityBand,
} from "./similarityBands";

export const MIN_POTENTIALLY_USEFUL_GAP_PCT = 5;
export const PROMISING_GAP_PCT = 10;

function positive(value: number | null): number | null {
  return value !== null && value > 0 ? value : null;
}

function distanceKm(
  lat1: number | null,
  lon1: number | null,
  lat2: number | null,
  lon2: number | null,
): number | null {
  if (lat1 === null || lon1 === null || lat2 === null || lon2 === null) return null;
  const radius = 6371;
  const p1 = (Math.PI * lat1) / 180;
  const p2 = (Math.PI * lat2) / 180;
  const dphi = (Math.PI * (lat2 - lat1)) / 180;
  const dlambda = (Math.PI * (lon2 - lon1)) / 180;
  const a = Math.sin(dphi / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(dlambda / 2) ** 2;
  return 2 * radius * Math.asin(Math.sqrt(a));
}

export function comparableSimilarity(subject: Parcel, comp: Comparable): number {
  let score = 0;
  const subjectSqft = positive(subject.buildingSqft);
  const compSqft = positive(comp.buildingSqft);
  score +=
    subjectSqft !== null && compSqft !== null
      ? (0.5 * Math.abs(compSqft - subjectSqft)) / subjectSqft
      : 0.5;
  score +=
    subject.yearBuilt !== null && comp.yearBuilt !== null
      ? 0.3 * Math.min(Math.abs(comp.yearBuilt - subject.yearBuilt) / 50, 1)
      : 0.15;
  const distance = distanceKm(subject.lat, subject.lon, comp.lat, comp.lon);
  score += 0.2 * Math.min((distance ?? 1) / 2, 1);
  return score;
}

function passesYearFilter(parcel: Parcel, comp: Comparable, profile: ComparableProfile): boolean {
  const tolerance = profile.similaritySteps.at(-1)?.yearTolerance ?? 0;
  if (profile.requireYear) {
    return (
      parcel.yearBuilt !== null &&
      comp.yearBuilt !== null &&
      Math.abs(comp.yearBuilt - parcel.yearBuilt) <= tolerance
    );
  }
  return (
    parcel.yearBuilt === null ||
    comp.yearBuilt === null ||
    Math.abs(comp.yearBuilt - parcel.yearBuilt) <= tolerance
  );
}

function passesProfileRequirements(
  parcel: Parcel,
  comp: Comparable,
  profile: ComparableProfile,
): boolean {
  if (!passesYearFilter(parcel, comp, profile)) return false;
  if (profile.requireLand) {
    if (!parcel.landSqft || !comp.landSqft) return false;
    const tolerance = profile.landTolerance ?? 1;
    if (
      comp.landSqft < parcel.landSqft * (1 - tolerance) ||
      comp.landSqft > parcel.landSqft * (1 + tolerance)
    ) {
      return false;
    }
  }
  if (profile.requireStyle && (!parcel.style || !comp.style || parcel.style !== comp.style)) {
    return false;
  }
  if (profile.requireAmenity && comp.amenityCount <= 0) return false;
  if (!comp.characteristicsReconciled || !comp.assessmentComponentsReconciled) return false;
  return !(parcel.isMulticard && (!comp.isMulticard || comp.cardCount !== parcel.cardCount));
}

function selectProfilePool(
  parcel: Parcel,
  comparables: Comparable[],
  profile: ComparableProfile,
): { rows: Comparable[]; scope: string | null; warnings: string[] } {
  const warnings: string[] = [];
  const candidates = comparables.filter(
    (comp) =>
      comp.pin !== parcel.pin &&
      comp.propertyClass?.trim() === parcel.propertyClass.trim() &&
      (parcel.assessmentYear === null || comp.assessmentYear === parcel.assessmentYear) &&
      positive(comp.improvementAv) !== null &&
      positive(comp.buildingSqft) !== null &&
      passesProfileRequirements(parcel, comp, profile),
  );
  const excluded = comparables.length - candidates.length;
  if (excluded > 0) {
    warnings.push(
      `${excluded} comparable candidate${excluded === 1 ? " was" : "s were"} excluded by venue matching, class, assessment-year, card, or reconciliation requirements.`,
    );
  }
  const subjectSqft = parcel.buildingSqft;
  if (!subjectSqft) return { rows: [], scope: null, warnings };
  let selected: Comparable[] = [];
  let scope: string | null = "township";
  for (const step of profile.similaritySteps) {
    const scoped = candidates.filter(
      (comp) =>
        comp.buildingSqft !== null &&
        comp.buildingSqft >= subjectSqft * (1 - step.sqftTolerance) &&
        comp.buildingSqft <= subjectSqft * (1 + step.sqftTolerance) &&
        (parcel.yearBuilt === null ||
          comp.yearBuilt === null ||
          Math.abs(comp.yearBuilt - parcel.yearBuilt) <= step.yearTolerance),
    );
    const neighborhood = scoped.filter(
      (comp) => parcel.neighborhood !== null && comp.neighborhood === parcel.neighborhood,
    );
    if (neighborhood.length >= profile.preferSameNeighborhoodMinimum) {
      selected = neighborhood;
      scope = "neighborhood";
    } else {
      selected = scoped;
      scope = "township";
    }
    if (selected.length >= profile.targetComparables) break;
  }
  return { rows: selected, scope, warnings };
}

function groupCount(total: number, share: number): number {
  return total === 0 ? 0 : Math.max(1, Math.ceil(total * share));
}

export function nestedSimilarityGroups<T>(rows: T[]): Record<SimilarityGroupKey, T[]> {
  return {
    top25: rows.slice(0, groupCount(rows.length, 0.25)),
    top50: rows.slice(0, groupCount(rows.length, 0.5)),
    top75: rows.slice(0, groupCount(rows.length, 0.75)),
    all: [...rows],
  };
}

const GROUP_LABELS: Record<SimilarityGroupKey, string> = {
  top25: "top 25% most similar comps",
  top50: "top 50% most similar comps",
  top75: "top 75% most similar comps",
  all: "all comps",
};

function comparisonPct(subject: number | null, reference: number | null): number | null {
  return subject === null || reference === null || reference <= 0
    ? null
    : (100 * (subject - reference)) / reference;
}

function summarizeGroup(
  key: SimilarityGroupKey,
  rows: ComparableExhibit[],
  subject: Parcel,
  subjectImprovementPsf: number | null,
  subjectLandPsf: number | null,
  impliedMarketValue: number | null,
): SimilarityGroupSummary {
  const improvementValues = rows.map((row) => row.improvementAvPerSqft);
  const medianImprovement = improvementValues.length ? medianValue(improvementValues) : null;
  const recentSaleRows = rows.filter(
    (row) => row.recentSale && row.salePricePerSqft !== null && row.salePricePerSqft > 0,
  );
  const medianSalePsf =
    recentSaleRows.length >= 3
      ? medianValue(recentSaleRows.map((row) => row.salePricePerSqft ?? 0))
      : null;
  const preliminaryMarket =
    medianSalePsf !== null && subject.buildingSqft ? medianSalePsf * subject.buildingSqft : null;
  const landRows = rows.filter((row) => row.landAvPerSqft !== null && row.landAvPerSqft > 0);
  const medianLand =
    landRows.length > 0 ? medianValue(landRows.map((row) => row.landAvPerSqft ?? 0)) : null;
  return {
    key,
    label: GROUP_LABELS[key],
    count: rows.length,
    comparablePins: rows.map((row) => row.comparable.pin),
    medianImprovementAvPerSqft: medianImprovement,
    subjectImprovementComparisonPct: comparisonPct(subjectImprovementPsf, medianImprovement),
    recentSaleCount: recentSaleRows.length,
    medianRecentSalePricePerSqft: medianSalePsf,
    preliminarySupportedMarketValue: preliminaryMarket,
    impliedMarketValueComparisonPct: comparisonPct(impliedMarketValue, preliminaryMarket),
    usableLandCount: landRows.length,
    medianLandAvPerSqft: medianLand,
    subjectLandComparisonPct: comparisonPct(subjectLandPsf, medianLand),
  };
}

function emptyGroups(): Record<SimilarityGroupKey, SimilarityGroupSummary> {
  const parcel = {} as Parcel;
  return Object.fromEntries(
    (Object.keys(GROUP_LABELS) as SimilarityGroupKey[]).map((key) => [
      key,
      summarizeGroup(key, [], parcel, null, null, null),
    ]),
  ) as Record<SimilarityGroupKey, SimilarityGroupSummary>;
}

export function analyzeComparables(
  caseFile: AnalysisCase,
  venue: ResolvedVenue | null = null,
): ComparableSummary {
  const parcel = caseFile.effectiveParcel;
  const profile = profileForVenue(venue);
  const subjectImprovementPsf = safeDiv(
    positive(parcel.currentImprovementAv),
    positive(parcel.buildingSqft),
  );
  const subjectLandPsf = safeDiv(positive(parcel.currentLandAv), positive(parcel.landSqft));
  const impliedMarketValue =
    positive(parcel.currentAv) !== null ? (parcel.currentAv ?? 0) / ASSESSMENT_LEVEL : null;
  if (caseFile.blockingMissingFields.length > 0) {
    return {
      status: "insufficient_data",
      note: "Core comparable analysis cannot run until the blocking subject fields are confirmed.",
      profileKey: profile.key,
      profileLabel: profile.venueLabel,
      scope: null,
      warnings: [],
      universe: [],
      actionableUniverse: [],
      bandCounts: { excellent: 0, good: 0, decent: 0, broad: 0 },
      groups: emptyGroups(),
      subjectImprovementAvPerSqft: subjectImprovementPsf,
      subjectLandAvPerSqft: subjectLandPsf,
      subjectImpliedMarketValue: impliedMarketValue,
    };
  }
  const selection = selectProfilePool(parcel, caseFile.comparables, profile);
  const universe = selection.rows
    .map((comparable): ComparableExhibit | null => {
      const improvementAvPerSqft = safeDiv(
        positive(comparable.improvementAv),
        positive(comparable.buildingSqft),
      );
      if (improvementAvPerSqft === null) return null;
      const score = comparableSimilarity(parcel, comparable);
      const band = similarityBand(score);
      if (band === null || score > MAX_DISPLAYED_SIMILARITY) return null;
      return {
        comparable,
        improvementAvPerSqft,
        landAvPerSqft: safeDiv(positive(comparable.landAv), positive(comparable.landSqft)),
        salePricePerSqft: safeDiv(
          positive(comparable.salePrice),
          positive(comparable.buildingSqft),
        ),
        distanceKm: distanceKm(parcel.lat, parcel.lon, comparable.lat, comparable.lon),
        similarity: score,
        band,
        recentSale: isRecentSaleDate(comparable.saleDate, parcel.assessmentYear),
      };
    })
    .filter((row): row is ComparableExhibit => row !== null)
    .sort(
      (a, b) => a.similarity - b.similarity || a.comparable.pin.localeCompare(b.comparable.pin),
    );
  const actionableUniverse = universe.filter((row) => row.similarity <= MAX_ACTIONABLE_SIMILARITY);
  const grouped = nestedSimilarityGroups(universe);
  const groups = Object.fromEntries(
    (Object.keys(grouped) as SimilarityGroupKey[]).map((key) => [
      key,
      summarizeGroup(
        key,
        grouped[key],
        parcel,
        subjectImprovementPsf,
        subjectLandPsf,
        impliedMarketValue,
      ),
    ]),
  ) as Record<SimilarityGroupKey, SimilarityGroupSummary>;
  const bandCounts = { excellent: 0, good: 0, decent: 0, broad: 0 } satisfies Record<
    SimilarityBandName,
    number
  >;
  for (const row of universe) bandCounts[row.band] += 1;
  const warnings = [...selection.warnings];
  if (
    actionableUniverse.length >= 3 &&
    actionableUniverse.every((row) => row.distanceKm !== null && row.distanceKm > 3)
  ) {
    warnings.push(
      "Every actionable comparable is more than 3 km from the subject. Verify local differences before relying on the result.",
    );
  }
  if (caseFile.corrections.length > 0) {
    warnings.push(
      "Confirmed user corrections were used in the comparable search and calculations.",
    );
  }
  const status =
    isCondo(parcel) && universe.length === 0
      ? "condo"
      : actionableUniverse.length >= 3
        ? "ok"
        : "insufficient_data";
  return {
    status,
    note:
      actionableUniverse.length >= 3
        ? `Comparable analysis used ${actionableUniverse.length} actionable rows; broad rows remain context only.`
        : `Only ${actionableUniverse.length} actionable comparable${actionableUniverse.length === 1 ? " was" : "s were"} available; at least three are required for savings calculations.`,
    profileKey: profile.key,
    profileLabel: profile.venueLabel,
    scope: selection.scope,
    warnings,
    universe,
    actionableUniverse,
    bandCounts,
    groups,
    subjectImprovementAvPerSqft: subjectImprovementPsf,
    subjectLandAvPerSqft: subjectLandPsf,
    subjectImpliedMarketValue: impliedMarketValue,
  };
}

function officialRule(venue: ResolvedVenue | null): { summary: string; url: string } {
  if (venue === "bor") {
    return {
      summary:
        "Official venue rule: BOR rules govern the evidence and documents required for the selected contention.",
      url: BOR_RULES_URL,
    };
  }
  if (venue === "ptab") {
    return {
      summary:
        "Official venue rule: PTAB requires verified, relevant evidence and may require adjustments not available in public data.",
      url: PTAB_RULES_URL,
    };
  }
  return {
    summary:
      "Official venue rule: the Assessor accepts documented uniformity, value, and property-description evidence under its published guidance.",
    url: CCAO_APPEALS_URL,
  };
}

function gapStatus(gap: number | null): EvidenceStatus {
  if (gap === null) return "unavailable";
  if (gap >= PROMISING_GAP_PCT) return "promising";
  if (gap >= MIN_POTENTIALLY_USEFUL_GAP_PCT) return "potentially_useful";
  if (gap > 0) return "weak_or_incomplete";
  return "does_not_support_reduction";
}

function uniformityCandidate(
  caseFile: AnalysisCase,
  summary: ComparableSummary,
  venue: ResolvedVenue | null,
): EvidenceCandidate {
  const official = officialRule(venue);
  const subject = summary.subjectImprovementAvPerSqft;
  const rows = summary.actionableUniverse;
  if (subject === null || rows.length < 3) {
    return {
      type: "uniformity",
      name: "Uniformity",
      available: false,
      selectable: true,
      status: "unavailable",
      shortReason:
        "Fewer than three actionable comparables or a required subject value is missing.",
      screeningRule:
        "Appeal Compass screening threshold: at least three rows with similarity at or below 0.35.",
      officialRuleSummary: official.summary,
      officialRuleUrl: official.url,
      dataUsed: [],
      limitations: ["Broad comparables do not drive this method."],
    };
  }
  const values = rows.map((row) => row.improvementAvPerSqft);
  const percentile = percentileRank(subject, values);
  const gap = gapPct(subject, values);
  const status: EvidenceStatus =
    (percentile ?? 0) >= 75 && (gap ?? 0) >= 10
      ? "promising"
      : (percentile ?? 0) >= 60 || (gap ?? 0) >= 5
        ? "potentially_useful"
        : (gap ?? 0) > 0
          ? "weak_or_incomplete"
          : "does_not_support_reduction";
  return {
    type: "uniformity",
    name: "Uniformity",
    available: true,
    selectable: true,
    status,
    shortReason: `Subject percentile ${percentile?.toFixed(0) ?? "unavailable"}; Improvement AV/sqft gap ${gap?.toFixed(1) ?? "unavailable"}%.`,
    screeningRule:
      "Appeal Compass screening threshold: promising requires percentile at least 75 and gap at least 10%; potentially useful requires percentile at least 60 or gap at least 5%.",
    officialRuleSummary: official.summary,
    officialRuleUrl: official.url,
    dataUsed: rows.map((row) => row.comparable.pinFormatted),
    limitations: ["The percentile and gap thresholds are product screens, not official rules."],
    calculationInputs: { percentile, gapPct: gap, comparableCount: rows.length },
  };
}

function valueCandidate(
  type: "recorded_sale" | "reported_purchase" | "appraisal",
  value: number | null,
  date: string | null,
  summary: ComparableSummary,
  caseFile: AnalysisCase,
  venue: ResolvedVenue | null,
  duplicate = false,
): EvidenceCandidate {
  const official = officialRule(venue);
  const names = {
    recorded_sale: "Recorded subject sale",
    reported_purchase: "User-reported subject purchase",
    appraisal: "User-provided appraisal",
  } as const;
  if (value === null || date === null) {
    return {
      type,
      name: names[type],
      available: false,
      selectable: false,
      status: "unavailable",
      shortReason: "This evidence was not provided or found.",
      screeningRule: `Appeal Compass screening threshold: ${valueEvidencePolicy(venue).description}; 5% and 10% implied-value gap screens.`,
      officialRuleSummary: official.summary,
      officialRuleUrl: official.url,
      dataUsed: [],
      limitations: [],
    };
  }
  const implied = summary.subjectImpliedMarketValue;
  const qualifies = isQualifyingValueEvidenceDate(
    date,
    caseFile.effectiveParcel.assessmentYear,
    venue,
  );
  const gap = implied === null ? null : (100 * (implied - value)) / value;
  let status = gapStatus(gap);
  if (!qualifies || !caseFile.effectiveParcel.assessmentComponentsReconciled) {
    status = "weak_or_incomplete";
  }
  return {
    type,
    name: names[type],
    available: true,
    selectable: true,
    status,
    shortReason:
      implied === null
        ? "Total AV is unavailable, so the implied-value comparison cannot be calculated."
        : `${Math.abs(gap ?? 0).toFixed(1)}% ${gap !== null && gap >= 0 ? "above" : "below"} the evidence value${qualifies ? "" : "; date is outside the product screen"}.`,
    screeningRule: `Appeal Compass screening threshold: ${valueEvidencePolicy(venue).description}; 5% is potentially useful and 10% is promising.`,
    officialRuleSummary: official.summary,
    officialRuleUrl: official.url,
    dataUsed: [`${date}: ${value}`],
    limitations: [
      ...(!qualifies
        ? ["The evidence date is outside the configured product screening window."]
        : []),
      ...(duplicate
        ? ["This may describe the same transaction as another subject-value entry."]
        : []),
    ],
    calculationInputs: {
      evidenceValue: value,
      evidenceDate: date,
      impliedMarketValue: implied,
      gapPct: gap,
    },
  };
}

function firstActionableGroup(
  rows: ComparableExhibit[],
  predicate: (row: ComparableExhibit) => boolean = () => true,
): { key: SimilarityGroupKey; rows: ComparableExhibit[] } | null {
  const groups = nestedSimilarityGroups(rows);
  for (const key of ["top25", "top50", "top75", "all"] as SimilarityGroupKey[]) {
    const usable = groups[key].filter(predicate);
    if (usable.length >= 3) return { key, rows: usable };
  }
  return null;
}

function comparableSalesCandidate(
  caseFile: AnalysisCase,
  summary: ComparableSummary,
  venue: ResolvedVenue | null,
): EvidenceCandidate {
  const official = officialRule(venue);
  const group = firstActionableGroup(
    summary.actionableUniverse,
    (row) => row.recentSale && row.salePricePerSqft !== null && row.salePricePerSqft > 0,
  );
  if (!group || !caseFile.effectiveParcel.buildingSqft) {
    return {
      type: "comparable_sales",
      name: "Comparable-sales market evidence",
      available: false,
      selectable: true,
      status: "unavailable",
      shortReason: "Insufficient recent sales.",
      screeningRule:
        "Appeal Compass screening threshold: first nested actionable group with at least three recent-sale comparables.",
      officialRuleSummary: official.summary,
      officialRuleUrl: official.url,
      dataUsed: [],
      limitations: ["This is an unadjusted screening model, not an appraisal."],
    };
  }
  const medianSalePsf = medianValue(group.rows.map((row) => row.salePricePerSqft ?? 0));
  const preliminary = medianSalePsf * caseFile.effectiveParcel.buildingSqft;
  const gap = comparisonPct(summary.subjectImpliedMarketValue, preliminary);
  return {
    type: "comparable_sales",
    name: "Comparable-sales market evidence",
    available: true,
    selectable: true,
    status: gapStatus(gap),
    shortReason: `${GROUP_LABELS[group.key]} supplied ${group.rows.length} recent sales at a median ${medianSalePsf.toFixed(2)} per sqft.`,
    screeningRule:
      "Appeal Compass screening threshold: 5% implied-value gap is potentially useful and 10% is promising.",
    officialRuleSummary: official.summary,
    officialRuleUrl: official.url,
    dataUsed: group.rows.map((row) => row.comparable.pinFormatted),
    limitations: [
      "Unadjusted for condition, exact location, lot differences, renovations, garages, amenities, sale concessions, and market time.",
      "Transaction type is not inferred from the available public fields.",
    ],
    calculationInputs: {
      groupKey: group.key,
      groupLabel: GROUP_LABELS[group.key],
      medianSalePricePerSqft: medianSalePsf,
      preliminarySupportedMarketValue: preliminary,
      gapPct: gap,
      comparablePins: group.rows.map((row) => row.comparable.pin),
    },
  };
}

function landCandidate(
  caseFile: AnalysisCase,
  summary: ComparableSummary,
  venue: ResolvedVenue | null,
): EvidenceCandidate {
  const official = officialRule(venue);
  const subjectLandPsf = summary.subjectLandAvPerSqft;
  const group = firstActionableGroup(
    summary.actionableUniverse,
    (row) => row.landAvPerSqft !== null && row.landAvPerSqft > 0,
  );
  if (!group || subjectLandPsf === null || !caseFile.effectiveParcel.landSqft) {
    return {
      type: "land",
      name: "Land overassessment",
      available: false,
      selectable: true,
      status: "unavailable",
      shortReason: "Insufficient land data.",
      screeningRule:
        "Appeal Compass screening threshold: at least three actionable land rows; promising requires percentile at least 75 and gap at least 10%.",
      officialRuleSummary: official.summary,
      officialRuleUrl: official.url,
      dataUsed: [],
      limitations: ["The percentile and gap threshold is not an official Cook County rule."],
    };
  }
  const values = group.rows.map((row) => row.landAvPerSqft ?? 0);
  const median = medianValue(values);
  const percentile = percentileRank(subjectLandPsf, values);
  const gap = gapPct(subjectLandPsf, values);
  const status: EvidenceStatus =
    (percentile ?? 0) >= 75 && (gap ?? 0) >= 10
      ? "promising"
      : (gap ?? 0) > 0
        ? "weak_or_incomplete"
        : "does_not_support_reduction";
  return {
    type: "land",
    name: "Land overassessment",
    available: true,
    selectable: true,
    status,
    shortReason: `Land AV/sqft percentile ${percentile?.toFixed(0)}; gap ${gap?.toFixed(1)}%.`,
    screeningRule:
      "Appeal Compass screening threshold: promising requires land percentile at least 75 and Land AV/sqft gap at least 10%.",
    officialRuleSummary: official.summary,
    officialRuleUrl: official.url,
    dataUsed: group.rows.map((row) => row.comparable.pinFormatted),
    limitations: ["Lot and location differences require manual review."],
    calculationInputs: {
      groupKey: group.key,
      groupLabel: GROUP_LABELS[group.key],
      medianLandAvPerSqft: median,
      percentile,
      gapPct: gap,
      comparablePins: group.rows.map((row) => row.comparable.pin),
    },
  };
}

export function buildEvidenceCandidates(
  caseFile: AnalysisCase,
  summary: ComparableSummary,
  venue: ResolvedVenue | null,
): EvidenceCandidate[] {
  const recorded = [...caseFile.subjectSales].sort((a, b) =>
    b.saleDate.localeCompare(a.saleDate),
  )[0];
  const entered = caseFile.subjectValueEvidence;
  const likelyDuplicate = Boolean(
    recorded &&
      entered?.type === "purchase" &&
      Math.abs(recorded.salePrice - entered.value) <= 1 &&
      recorded.saleDate === entered.date,
  );
  const candidates: EvidenceCandidate[] = [
    uniformityCandidate(caseFile, summary, venue),
    valueCandidate(
      "recorded_sale",
      recorded?.salePrice ?? null,
      recorded?.saleDate ?? null,
      summary,
      caseFile,
      venue,
      likelyDuplicate,
    ),
    valueCandidate(
      "reported_purchase",
      entered?.type === "purchase" ? entered.value : null,
      entered?.type === "purchase" ? entered.date : null,
      summary,
      caseFile,
      venue,
      likelyDuplicate,
    ),
    valueCandidate(
      "appraisal",
      entered?.type === "appraisal" ? entered.value : null,
      entered?.type === "appraisal" ? entered.date : null,
      summary,
      caseFile,
      venue,
    ),
    comparableSalesCandidate(caseFile, summary, venue),
    landCandidate(caseFile, summary, venue),
  ];
  const official = officialRule(venue);
  candidates.push({
    type: "property_corrections",
    name: "Documented subject-property-data corrections",
    available: caseFile.corrections.length > 0,
    selectable: caseFile.corrections.length > 0,
    status: caseFile.corrections.length > 0 ? "potentially_useful" : "unavailable",
    shortReason:
      caseFile.corrections.length > 0
        ? `${caseFile.corrections.length} effective field change${caseFile.corrections.length === 1 ? "" : "s"} will be documented in the packet.`
        : "No subject property data was added or corrected.",
    screeningRule:
      "Appeal Compass treatment: confirmed corrections affect all calculations; they are packet evidence, not a separate savings method.",
    officialRuleSummary: official.summary,
    officialRuleUrl: official.url,
    dataUsed: caseFile.corrections.map((item) => item.field),
    limitations: ["The owner must include the identified proof separately."],
  });
  return candidates;
}

function candidateByMethod(
  candidates: EvidenceCandidate[],
  method: SavingsMethod,
): EvidenceCandidate {
  const candidate = candidates.find((item) => item.type === method);
  if (!candidate) throw new Error(`Missing evidence candidate ${method}.`);
  return candidate;
}

function baseCalculation(
  method: SavingsMethod,
  candidate: EvidenceCandidate,
  caseFile: AnalysisCase,
  taxRate: number,
  taxRateSource: string,
): SavingsCalculation {
  const total = positive(caseFile.effectiveParcel.currentAv);
  return {
    method,
    evidenceName: candidate.name,
    status: candidate.status,
    available: false,
    limitation: candidate.available ? null : candidate.shortReason,
    formula: "Calculation unavailable.",
    groupLabel: null,
    comparablePins: [],
    comparableCount: 0,
    currentTotalAv: total,
    targetTotalAv: null,
    avReduction: null,
    currentImpliedMarketValue: total === null ? null : total / ASSESSMENT_LEVEL,
    evidenceMarketValue: null,
    targetMarketValueEquivalent: null,
    estimatedCurrentTax: total === null ? null : total * STATE_EQUALIZER * taxRate,
    estimatedTargetTax: null,
    annualSavingsPoint: null,
    annualSavingsLow: null,
    annualSavingsHigh: null,
    stateEqualizer: STATE_EQUALIZER,
    taxRate,
    taxRateSource,
    assessmentLevel: ASSESSMENT_LEVEL,
    warnings: [],
    disclaimer: `${NOT_LEGAL_ADVICE} This exploratory estimate is not a guaranteed reduction.`,
  };
}

function finalizeCalculation(
  calculation: SavingsCalculation,
  target: number | null,
): SavingsCalculation {
  const current = calculation.currentTotalAv;
  if (current === null || target === null || target <= 0) {
    return {
      ...calculation,
      limitation: calculation.limitation ?? "Required AV inputs are unavailable.",
    };
  }
  const targetTotalAv = Math.round(target);
  const reduction = Math.max(0, current - targetTotalAv);
  const point = reduction * calculation.stateEqualizer * calculation.taxRate;
  const currentTax = current * calculation.stateEqualizer * calculation.taxRate;
  const warnings = [...calculation.warnings];
  if (currentTax > 0 && point / currentTax >= 0.2) {
    warnings.push(
      "This method's savings estimate is unusually large relative to estimated current tax. Verify every input and comparable.",
    );
  }
  return {
    ...calculation,
    available: true,
    limitation:
      reduction > 0
        ? calculation.limitation
        : "The calculated target is not below current Total AV, so this method produces no savings.",
    targetTotalAv,
    avReduction: reduction,
    targetMarketValueEquivalent: targetTotalAv / calculation.assessmentLevel,
    estimatedTargetTax: targetTotalAv * calculation.stateEqualizer * calculation.taxRate,
    annualSavingsPoint: point,
    annualSavingsLow: point * 0.8,
    annualSavingsHigh: point * 1.2,
    warnings,
  };
}

export function buildSavingsCalculations(
  caseFile: AnalysisCase,
  summary: ComparableSummary,
  candidates: EvidenceCandidate[],
  taxRate: number,
  taxRateSource: string,
): SavingsCalculation[] {
  const calculations: SavingsCalculation[] = [];
  for (const method of [
    "uniformity",
    "recorded_sale",
    "reported_purchase",
    "appraisal",
    "comparable_sales",
    "land",
  ] as SavingsMethod[]) {
    const candidate = candidateByMethod(candidates, method);
    let calculation = baseCalculation(method, candidate, caseFile, taxRate, taxRateSource);
    if (method === "uniformity") {
      const group = firstActionableGroup(summary.actionableUniverse);
      if (
        group &&
        caseFile.effectiveParcel.buildingSqft &&
        caseFile.effectiveParcel.currentLandAv
      ) {
        const median = medianValue(group.rows.map((row) => row.improvementAvPerSqft));
        calculation = {
          ...calculation,
          formula:
            "Target Improvement AV = chosen-group median Improvement AV/sqft × subject building sqft; Target Total AV = effective Land AV + Target Improvement AV.",
          groupLabel: GROUP_LABELS[group.key],
          comparablePins: group.rows.map((row) => row.comparable.pin),
          comparableCount: group.rows.length,
        };
        calculation = finalizeCalculation(
          calculation,
          median * caseFile.effectiveParcel.buildingSqft + caseFile.effectiveParcel.currentLandAv,
        );
      }
    } else if (
      method === "recorded_sale" ||
      method === "reported_purchase" ||
      method === "appraisal"
    ) {
      const evidenceValue = Number(candidate.calculationInputs?.evidenceValue ?? 0) || null;
      calculation = {
        ...calculation,
        formula: "Target Total AV = subject evidence market value × residential assessment level.",
        evidenceMarketValue: evidenceValue,
      };
      calculation = finalizeCalculation(
        calculation,
        evidenceValue === null ? null : evidenceValue * ASSESSMENT_LEVEL,
      );
    } else if (method === "comparable_sales") {
      const preliminary =
        Number(candidate.calculationInputs?.preliminarySupportedMarketValue ?? 0) || null;
      const pins = (candidate.calculationInputs?.comparablePins as string[] | undefined) ?? [];
      calculation = {
        ...calculation,
        formula:
          "Preliminary supported market value = median recent sale price/sqft × subject building sqft; Target Total AV = that value × assessment level.",
        groupLabel: String(candidate.calculationInputs?.groupLabel ?? "") || null,
        comparablePins: pins,
        comparableCount: pins.length,
        evidenceMarketValue: preliminary,
      };
      calculation = finalizeCalculation(
        calculation,
        preliminary === null ? null : preliminary * ASSESSMENT_LEVEL,
      );
    } else {
      const medianLand = Number(candidate.calculationInputs?.medianLandAvPerSqft ?? 0) || null;
      const pins = (candidate.calculationInputs?.comparablePins as string[] | undefined) ?? [];
      const parcel = caseFile.effectiveParcel;
      calculation = {
        ...calculation,
        formula:
          "Target Land AV = chosen-group median Land AV/sqft × effective subject land sqft; Target Total AV = effective Improvement AV + Target Land AV.",
        groupLabel: String(candidate.calculationInputs?.groupLabel ?? "") || null,
        comparablePins: pins,
        comparableCount: pins.length,
      };
      calculation = finalizeCalculation(
        calculation,
        medianLand && parcel.landSqft && parcel.currentImprovementAv
          ? medianLand * parcel.landSqft + parcel.currentImprovementAv
          : null,
      );
    }
    calculations.push(calculation);
  }
  return calculations;
}

export function buildAnalysisResult(input: {
  caseFile: AnalysisCase;
  venue: ResolvedVenue | null;
  revision: number;
  taxRate: number;
  taxRateSource: string;
  notices: AnalysisResult["notices"];
}): AnalysisResult {
  const comparableSummary = analyzeComparables(input.caseFile, input.venue);
  const evidenceCandidates = buildEvidenceCandidates(
    input.caseFile,
    comparableSummary,
    input.venue,
  );
  const savingsCalculations = buildSavingsCalculations(
    input.caseFile,
    comparableSummary,
    evidenceCandidates,
    input.taxRate,
    input.taxRateSource,
  );
  return {
    revision: input.revision,
    subject: {
      publicParcel: input.caseFile.publicParcel,
      effectiveParcel: input.caseFile.effectiveParcel,
      provenance: input.caseFile.provenance,
      corrections: input.caseFile.corrections,
      blockingMissingFields: input.caseFile.blockingMissingFields,
      optionalMissingFields: input.caseFile.optionalMissingFields,
    },
    propertyCards: input.caseFile.propertyCards,
    assessmentHistory: input.caseFile.assessmentHistory,
    subjectSales: input.caseFile.subjectSales,
    subjectValueEvidence: input.caseFile.subjectValueEvidence,
    comparableSummary,
    evidenceCandidates,
    savingsCalculations,
    notices: input.notices,
    warnings: [...new Set([...input.caseFile.dataWarnings, ...comparableSummary.warnings])],
  };
}

export function selectedEvidenceCandidates(
  candidates: EvidenceCandidate[],
  evidenceTypes: EvidenceType[],
): EvidenceCandidate[] {
  const selected = new Set(evidenceTypes);
  return candidates.filter((candidate) => selected.has(candidate.type));
}

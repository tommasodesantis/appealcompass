import type { ComparableProfile } from "./comparableProfiles";
import { ASSESSOR_PROFILE, profileForVenue } from "./comparableProfiles";
import { ASSESSMENT_LEVEL, ASSESSMENT_YEAR, NOT_LEGAL_ADVICE, STATE_EQUALIZER } from "./config";
import {
  estimatedSavingsRange,
  gapPct,
  isWithinYearsOf,
  medianValue,
  percentileRank,
  safeDiv,
} from "./math";
import type {
  ArgumentStrength,
  CaseFile,
  Comparable,
  ComparableAnalysis,
  ComparableExhibit,
  EvidenceArgument,
  EvidenceSummary,
  EvidenceTier,
  LandAssessmentCheck,
  MissingComparableField,
  Parcel,
  ResolvedVenue,
} from "./models";
import { isCondo } from "./models";

function distanceKm(
  lat1: number | null,
  lon1: number | null,
  lat2: number | null,
  lon2: number | null,
): number | null {
  if (lat1 === null || lon1 === null || lat2 === null || lon2 === null) {
    return null;
  }
  const radius = 6371.0;
  const p1 = (Math.PI * lat1) / 180;
  const p2 = (Math.PI * lat2) / 180;
  const dphi = (Math.PI * (lat2 - lat1)) / 180;
  const dlambda = (Math.PI * (lon2 - lon1)) / 180;
  const a = Math.sin(dphi / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(dlambda / 2) ** 2;
  return 2 * radius * Math.asin(Math.sqrt(a));
}

function positive(value: number | null): number | null {
  return value !== null && value > 0 ? value : null;
}

const SALE_EVIDENCE_YEARS = 3;
const LIEN_DATE = `${ASSESSMENT_YEAR}-01-01`;

function isRecentSaleEvidence(saleDate: string | null): boolean {
  if (!saleDate) {
    return false;
  }
  return saleDate <= LIEN_DATE && isWithinYearsOf(saleDate, LIEN_DATE, SALE_EVIDENCE_YEARS);
}

function similarity(subject: CaseFile, comp: Comparable): number {
  const parcel = subject.parcel;
  const parcelSqft = positive(parcel.buildingSqft);
  const compSqft = positive(comp.buildingSqft);
  let score = 0;
  if (parcelSqft !== null && compSqft !== null) {
    score += (0.5 * Math.abs(compSqft - parcelSqft)) / parcelSqft;
  } else {
    score += 0.5;
  }
  if (parcel.yearBuilt && comp.yearBuilt) {
    score += 0.3 * Math.min(Math.abs(comp.yearBuilt - parcel.yearBuilt) / 50, 1);
  } else {
    score += 0.15;
  }
  const distance = distanceKm(parcel.lat, parcel.lon, comp.lat, comp.lon);
  score += 0.2 * Math.min((distance ?? 1) / 2, 1);
  return score;
}

function subjectMetricValue(parcel: Parcel, profile: ComparableProfile): number | null {
  void profile;
  return parcel.currentImprovementAv;
}

function effectiveSqft(caseFile: CaseFile): number | null {
  return positive(caseFile.parcel.buildingSqft) ?? positive(caseFile.userEvidence.actualSqft);
}

function effectiveTotalAv(caseFile: CaseFile): number | null {
  return positive(caseFile.parcel.currentAv) ?? positive(caseFile.userEvidence.actualAv);
}

function effectiveMetricValue(caseFile: CaseFile, profile: ComparableProfile): number | null {
  const official = positive(subjectMetricValue(caseFile.parcel, profile));
  if (official !== null) {
    return official;
  }
  return positive(caseFile.userEvidence.actualImprovementAv);
}

function userSuppliedWarnings(caseFile: CaseFile, profile: ComparableProfile): string[] {
  const warnings: string[] = [];
  if (
    positive(caseFile.parcel.buildingSqft) === null &&
    positive(caseFile.userEvidence.actualSqft)
  ) {
    warnings.push("Using user-supplied building sqft for comparable analysis.");
  }
  if (
    profile.metric === "improvement_av" &&
    positive(caseFile.parcel.currentImprovementAv) === null &&
    positive(caseFile.userEvidence.actualImprovementAv)
  ) {
    warnings.push("Using user-supplied building/improvement assessment for comparable analysis.");
  }
  return warnings;
}

function missingSubjectFields(
  caseFile: CaseFile,
  profile: ComparableProfile,
): MissingComparableField[] {
  const fields: MissingComparableField[] = [];
  if (!effectiveSqft(caseFile)) {
    fields.push({
      name: "actualSqft",
      label: "Documented building sqft",
      helpText:
        "Use the building/living area from a property record card, appraisal, plans, or other reliable source.",
    });
  }
  if (!effectiveMetricValue(caseFile, profile)) {
    fields.push({
      name: "actualImprovementAv",
      label: "Documented Improvement AV",
      helpText:
        "Use the building/improvement assessed value from an official assessment notice or property record card.",
    });
  }
  return fields;
}

function comparableMetricValue(comp: Comparable, profile: ComparableProfile): number | null {
  void profile;
  return comp.improvementAv;
}

function samePropertyClass(parcel: Parcel, comp: Comparable): boolean {
  return comp.propertyClass !== null && comp.propertyClass.trim() === parcel.propertyClass.trim();
}

function sameAssessmentYear(parcel: Parcel, comp: Comparable): boolean {
  return (
    parcel.assessmentYear === null ||
    comp.assessmentYear === null ||
    comp.assessmentYear === parcel.assessmentYear
  );
}

function subjectDataWarnings(parcel: Parcel): string[] {
  const warnings: string[] = [];
  if (positive(parcel.currentImprovementAv) === null) {
    warnings.push(
      "Public Improvement AV is missing or nonpositive; comparable uniformity analysis needs a fallback Improvement AV.",
    );
  }
  if (positive(parcel.buildingSqft) === null) {
    warnings.push(
      "Public building square footage is missing or nonpositive; comparable uniformity analysis needs a fallback building sqft value.",
    );
  }
  if (positive(parcel.currentImprovementAv) === null && positive(parcel.currentAv) !== null) {
    warnings.push(
      "This parcel may have little or no assessed improvement value. Vacant or no-improvement parcels require manual review before using residential comparable evidence.",
    );
  }
  if (parcel.assessmentYear === null) {
    warnings.push(
      "The public assessment year for the subject could not be confirmed; verify the subject and comparable values use the same assessment year.",
    );
  }
  if (/^(211|212|234|278)$/.test(parcel.propertyClass.trim())) {
    warnings.push(
      "This residential class can involve multi-unit, multi-building, or other-improvement details. Verify the property record card before relying on Improvement AV/sqft.",
    );
  }
  return warnings;
}

function profiledAnalysis(input: {
  status: ComparableAnalysis["status"];
  note: string;
  profile: ComparableProfile;
  warnings?: string[];
  missingFields?: MissingComparableField[];
  missingDataRate?: number | null;
  scope?: string | null;
  poolSize?: number;
  subjectAvPerSqft?: number | null;
  medianAvPerSqft?: number | null;
  percentile?: number | null;
  gap?: number | null;
  pool?: ComparableExhibit[];
  exhibit?: ComparableExhibit[];
}): ComparableAnalysis {
  return {
    status: input.status,
    note: input.note,
    profileKey: input.profile.key,
    profileLabel: input.profile.venueLabel,
    metricLabel: input.profile.metricLabel,
    missingFields: input.missingFields ?? [],
    warnings: input.warnings ?? [],
    missingDataRate: input.missingDataRate ?? null,
    scope: input.scope ?? null,
    poolSize: input.poolSize ?? 0,
    subjectAvPerSqft: input.subjectAvPerSqft ?? null,
    medianAvPerSqft: input.medianAvPerSqft ?? null,
    percentile: input.percentile ?? null,
    gapPct: input.gap ?? null,
    pool: input.pool ?? [],
    exhibit: input.exhibit ?? [],
  };
}

function passesYearFilter(parcel: Parcel, comp: Comparable, profile: ComparableProfile): boolean {
  const lastStep = profile.similaritySteps[profile.similaritySteps.length - 1];
  const tolerance = lastStep?.yearTolerance ?? 0;
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
  if (!passesYearFilter(parcel, comp, profile)) {
    return false;
  }
  if (profile.requireLand) {
    if (!parcel.landSqft || !comp.landSqft) {
      return false;
    }
    const tolerance = profile.landTolerance ?? 1;
    const low = parcel.landSqft * (1 - tolerance);
    const high = parcel.landSqft * (1 + tolerance);
    if (!(low <= comp.landSqft && comp.landSqft <= high)) {
      return false;
    }
  }
  if (profile.requireStyle) {
    if (parcel.style && comp.style !== parcel.style) {
      return false;
    }
    if (!parcel.style && !comp.style) {
      return false;
    }
  }
  return !(profile.requireAmenity && comp.amenityCount <= 0);
}

function targetTotalAv(caseFile: CaseFile, profile: ComparableProfile, targetMetricValue: number) {
  const currentTotal = effectiveTotalAv(caseFile);
  const currentImprovement =
    positive(caseFile.parcel.currentImprovementAv) ??
    positive(caseFile.userEvidence.actualImprovementAv);
  if (profile.metric === "improvement_av" && currentImprovement !== null && currentTotal !== null) {
    const reduction = Math.max(0, currentImprovement - targetMetricValue);
    return Math.max(0, currentTotal - reduction);
  }
  return targetMetricValue;
}

function condoMissingDataRate(caseFile: CaseFile, profile: ComparableProfile): number {
  const candidates = caseFile.comparables.filter((comp) => comp.pin !== caseFile.parcel.pin);
  if (candidates.length === 0) {
    return 100;
  }
  let missing = 0;
  for (const comp of candidates) {
    const metricValue = comparableMetricValue(comp, profile);
    if (!comp.buildingSqft || comp.buildingSqft <= 0 || !metricValue || metricValue <= 0) {
      missing += 1;
    }
  }
  return Math.round((1000 * missing) / candidates.length) / 10;
}

function condoReliability(
  caseFile: CaseFile,
  profile: ComparableProfile,
): { shouldRun: boolean; warnings: string[]; missingRate: number } {
  const missingRate = condoMissingDataRate(caseFile, profile);
  if (missingRate > 50) {
    return { shouldRun: false, warnings: [], missingRate };
  }
  if (missingRate >= 30) {
    return {
      shouldRun: true,
      warnings: [
        `Condo comparable analysis is less reliable because ${missingRate.toFixed(
          0,
        )}% of public condo candidates are missing unit sqft or ${profile.metricLabel}.`,
      ],
      missingRate,
    };
  }
  return { shouldRun: true, warnings: [], missingRate };
}

function comparableRows(
  caseFile: CaseFile,
  comps: Comparable[],
  profile: ComparableProfile,
): ComparableExhibit[] {
  const parcel = caseFile.parcel;
  return comps
    .map((comp) => {
      const compPsf = safeDiv(comparableMetricValue(comp, profile), comp.buildingSqft);
      if (compPsf === null) {
        return null;
      }
      return {
        comparable: comp,
        avPerSqft: compPsf,
        distanceKm: distanceKm(parcel.lat, parcel.lon, comp.lat, comp.lon),
        similarity: similarity(caseFile, comp),
      };
    })
    .filter((item): item is ComparableExhibit => item !== null)
    .sort((a, b) => a.similarity - b.similarity);
}

export function analyzeComparables(
  caseFile: CaseFile,
  maxComps = 10,
  profile: ComparableProfile = ASSESSOR_PROFILE,
): ComparableAnalysis {
  const parcel = caseFile.parcel;
  let warnings = [...subjectDataWarnings(parcel), ...userSuppliedWarnings(caseFile, profile)];
  let missingDataRate: number | null = null;

  if (isCondo(parcel)) {
    const reliability = condoReliability(caseFile, profile);
    warnings = [...warnings, ...reliability.warnings];
    missingDataRate = reliability.missingRate;
    if (!reliability.shouldRun) {
      return profiledAnalysis({
        status: "condo",
        note: `Condo comparable analysis skipped after measuring ${missingDataRate.toFixed(
          0,
        )}% missing unit sqft or ${
          profile.metricLabel
        } in the public condo candidate pool. Use sale, appraisal, building-level equity, or factual-error evidence.`,
        profile,
        missingDataRate,
      });
    }
  }

  const subjectMetric = effectiveMetricValue(caseFile, profile);
  const subjectSqft = effectiveSqft(caseFile);
  const subjectPsf = safeDiv(subjectMetric, subjectSqft);
  if (subjectPsf === null || subjectSqft === null || subjectSqft <= 0) {
    const missingFields = missingSubjectFields(caseFile, profile);
    const fieldText =
      missingFields.length > 0
        ? missingFields.map((field) => field.label).join(" and ")
        : "the documented override fields";
    return profiledAnalysis({
      status: "insufficient_data",
      note: `Missing subject building square footage or ${profile.metricLabel}. Use ${fieldText} if you can document the missing value.`,
      profile,
      warnings,
      missingFields,
      missingDataRate,
    });
  }

  const mismatchedYearCount = caseFile.comparables.filter(
    (comp) =>
      parcel.assessmentYear !== null &&
      comp.assessmentYear !== null &&
      comp.assessmentYear !== parcel.assessmentYear,
  ).length;
  if (mismatchedYearCount > 0) {
    warnings = [
      ...warnings,
      `${mismatchedYearCount} comparable candidate${
        mismatchedYearCount === 1 ? " was" : "s were"
      } excluded because ${
        mismatchedYearCount === 1 ? "its" : "their"
      } assessment year did not match the subject assessment year.`,
    ];
  }

  const candidates = caseFile.comparables.filter((comp) => {
    const metricValue = comparableMetricValue(comp, profile);
    return (
      comp.pin !== parcel.pin &&
      samePropertyClass(parcel, comp) &&
      sameAssessmentYear(parcel, comp) &&
      metricValue !== null &&
      metricValue > 0 &&
      comp.buildingSqft !== null &&
      comp.buildingSqft > 0 &&
      passesProfileRequirements(parcel, comp, profile)
    );
  });

  let selected: Comparable[] = [];
  let scope = "township";
  for (const step of profile.similaritySteps) {
    const scoped = candidates.filter(
      (comp) =>
        comp.buildingSqft !== null &&
        subjectSqft * (1 - step.sqftTolerance) <= comp.buildingSqft &&
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
    if (selected.length >= profile.targetComparables) {
      break;
    }
  }

  const poolRows = comparableRows(caseFile, selected, profile);

  if (selected.length < profile.minimumComparables) {
    return profiledAnalysis({
      status: "insufficient_data",
      note: `Only ${selected.length} similar parcels found under the ${profile.venueLabel} profile; too few for a reliable exhibit.`,
      profile,
      warnings,
      missingDataRate,
      scope,
      poolSize: selected.length,
      pool: poolRows,
    });
  }

  const avPsfValues = selected
    .map((comp) => {
      const metricValue = comparableMetricValue(comp, profile);
      if (metricValue === null || comp.buildingSqft === null || comp.buildingSqft <= 0) {
        return null;
      }
      return metricValue / comp.buildingSqft;
    })
    .filter((value): value is number => value !== null);
  const medianPsf = medianValue(avPsfValues);
  const percentile = percentileRank(subjectPsf, avPsfValues);
  const gap = gapPct(subjectPsf, avPsfValues);
  const exhibits = poolRows.filter((item) => item.avPerSqft < subjectPsf).slice(0, maxComps);

  return profiledAnalysis({
    status: "ok",
    note: `Comparable analysis completed with the ${profile.venueLabel} profile using ${profile.metricLabel} per square foot.`,
    profile,
    warnings,
    missingDataRate,
    scope,
    poolSize: selected.length,
    subjectAvPerSqft: subjectPsf,
    medianAvPerSqft: medianPsf,
    percentile,
    gap,
    pool: poolRows,
    exhibit: exhibits,
  });
}

export function assessmentShockPct(caseFile: CaseFile): number | null {
  const current = caseFile.parcel.currentAv;
  const prior = caseFile.parcel.priorFinalAv;
  if (current === null || prior === null || prior <= 0) {
    return null;
  }
  return (100 * (current - prior)) / prior;
}

function analyzeLandAssessment(
  caseFile: CaseFile,
  comparablePool: ComparableExhibit[],
): LandAssessmentCheck {
  const parcel = caseFile.parcel;
  const subjectLandSqft = positive(parcel.landSqft);
  const subjectLandPsf = safeDiv(positive(parcel.currentLandAv), subjectLandSqft);
  if (subjectLandPsf === null || subjectLandSqft === null) {
    return {
      status: "insufficient_data",
      note: "Land-component check skipped because public Land AV or land sqft is missing for the subject.",
      subjectLandAvPerSqft: null,
      medianLandAvPerSqft: null,
      percentile: null,
      gapPct: null,
      medianComparableLandSqft: null,
      poolSize: 0,
      flagged: false,
    };
  }

  const rows = comparablePool
    .map((item) => {
      const landSqft = positive(item.comparable.landSqft);
      const landPsf = safeDiv(positive(item.comparable.landAv), landSqft);
      return landSqft !== null && landPsf !== null ? { landSqft, landPsf } : null;
    })
    .filter((item): item is { landSqft: number; landPsf: number } => item !== null);
  if (rows.length < 3) {
    return {
      status: "insufficient_data",
      note: `Land-component check skipped because only ${rows.length} comparable parcels had usable Land AV and land sqft.`,
      subjectLandAvPerSqft: subjectLandPsf,
      medianLandAvPerSqft: null,
      percentile: null,
      gapPct: null,
      medianComparableLandSqft: null,
      poolSize: rows.length,
      flagged: false,
    };
  }

  const landPsfValues = rows.map((row) => row.landPsf);
  const landSqftValues = rows.map((row) => row.landSqft);
  const medianLandPsf = medianValue(landPsfValues);
  const medianLandSqft = medianValue(landSqftValues);
  const percentile = percentileRank(subjectLandPsf, landPsfValues);
  const gap = gapPct(subjectLandPsf, landPsfValues);
  const lotSizeGap =
    medianLandSqft === null ? null : (100 * (subjectLandSqft - medianLandSqft)) / medianLandSqft;
  const flagged = (percentile ?? 0) >= 75 && (gap ?? 0) >= 10;
  const lotSizeDifferent = lotSizeGap !== null && Math.abs(lotSizeGap) >= 20;
  let note = "Land AV/sqft is not unusually high compared with the selected similar homes.";
  if (flagged) {
    note =
      "Land AV/sqft is high compared with selected similar homes. Check land sqft and land assessment details for a possible land or factual-error issue.";
  } else if (lotSizeDifferent) {
    note = `Total assessment differences may be partly explained by lot size: the subject lot is ${Math.abs(
      lotSizeGap,
    ).toFixed(0)}% ${lotSizeGap > 0 ? "larger" : "smaller"} than the median comparable lot.`;
  }

  return {
    status: "ok",
    note,
    subjectLandAvPerSqft: subjectLandPsf,
    medianLandAvPerSqft: medianLandPsf,
    percentile,
    gapPct: gap,
    medianComparableLandSqft: medianLandSqft,
    poolSize: rows.length,
    flagged,
  };
}

export function buildEvidenceSummary(
  caseFile: CaseFile,
  taxRate: number,
  venue: ResolvedVenue | null = null,
  taxRateSource = `county default assumption ${(taxRate * 100).toFixed(2)}%`,
): EvidenceSummary {
  const parcel = caseFile.parcel;
  const profile = profileForVenue(venue);
  const comparableAnalysis = analyzeComparables(caseFile, 10, profile);
  const landAssessment = analyzeLandAssessment(caseFile, comparableAnalysis.pool);
  const currentTotalAv = effectiveTotalAv(caseFile);
  const impliedMarket = currentTotalAv !== null ? currentTotalAv / ASSESSMENT_LEVEL : null;
  const args: EvidenceArgument[] = [];
  let tierPoints = 0;

  if (comparableAnalysis.status === "ok") {
    const percentile = comparableAnalysis.percentile ?? 0;
    const gap = comparableAnalysis.gapPct ?? 0;
    let strength: ArgumentStrength = "supporting";
    if (percentile >= 75 && gap >= 10) {
      strength = "strong";
      tierPoints += 2;
    } else if (percentile >= 60 || gap >= 5) {
      tierPoints += 1;
    }
    if (gap > 0 && comparableAnalysis.medianAvPerSqft && effectiveSqft(caseFile)) {
      const targetMetric = comparableAnalysis.medianAvPerSqft * (effectiveSqft(caseFile) ?? 0);
      const targetAv = targetTotalAv(caseFile, profile, targetMetric);
      const [, point] = estimatedSavingsRange(
        (currentTotalAv ?? 0) - targetAv,
        STATE_EQUALIZER,
        taxRate,
      );
      args.push({
        argumentType: "uniformity",
        strength,
        text: `Your ${profile.metricLabel} per square foot is higher than ${percentile.toFixed(
          0,
        )}% of ${comparableAnalysis.poolSize} similar homes and ${gap.toFixed(
          0,
        )}% above their median.`,
        targetAv,
        estimatedSavings: point,
      });
    }
  }

  if (landAssessment.flagged) {
    tierPoints += 1;
    args.push({
      argumentType: "land_component",
      strength: "supporting",
      text: landAssessment.note,
      targetAv: null,
      estimatedSavings: null,
    });
  }

  let evidenceValue: number | null = null;
  let evidenceSource: string | null = null;
  /*
   * Sale-value evidence is gated to the same conservative window documented in docs/LEARNINGS.md:
   * Cook County BOR Rule 18 treats purchases within three years of the January 1 lien date as sale
   * evidence; CCAO and PTAB guidance also emphasize recent arm's-length sales. Older sales are too
   * stale to drive overvaluation arguments or estimated savings.
   */
  const recentRecordedSales = caseFile.subjectSales.filter((sale) =>
    isRecentSaleEvidence(sale.saleDate),
  );
  if (recentRecordedSales.length > 0) {
    const latest = [...recentRecordedSales].sort((a, b) => b.saleDate.localeCompare(a.saleDate))[0];
    if (latest) {
      evidenceValue = latest.salePrice;
      evidenceSource = `recorded sale on ${latest.saleDate}`;
    }
  }
  if (
    caseFile.userEvidence.purchasePrice &&
    isRecentSaleEvidence(caseFile.userEvidence.purchaseDate)
  ) {
    evidenceValue = caseFile.userEvidence.purchasePrice;
    const when = caseFile.userEvidence.purchaseDate ?? "date n/a";
    evidenceSource = `reported purchase on ${when}`;
  }
  if (caseFile.userEvidence.appraisalValue) {
    evidenceValue = caseFile.userEvidence.appraisalValue;
    const when = caseFile.userEvidence.appraisalDate ?? "date n/a";
    evidenceSource = `reported appraisal on ${when}`;
  }

  if (evidenceValue && impliedMarket && evidenceValue > 0 && evidenceValue < impliedMarket) {
    const over = (100 * (impliedMarket - evidenceValue)) / evidenceValue;
    tierPoints += over >= 10 ? 2 : 1;
    const targetAv = evidenceValue * ASSESSMENT_LEVEL;
    const [, point] = estimatedSavingsRange(
      (currentTotalAv ?? 0) - targetAv,
      STATE_EQUALIZER,
      taxRate,
    );
    args.push({
      argumentType: "overvaluation",
      strength: over >= 10 ? "strong" : "supporting",
      text: `The implied market value is ${over.toFixed(0)}% above the ${evidenceSource} of $${Math.round(
        evidenceValue,
      ).toLocaleString("en-US")}.`,
      targetAv,
      estimatedSavings: point,
    });
  }

  const publicSqft = positive(parcel.buildingSqft);
  const userSqft = positive(caseFile.userEvidence.actualSqft);
  if (userSqft !== null && publicSqft !== null) {
    const sqftDelta = publicSqft - userSqft;
    if (Math.abs(sqftDelta) / publicSqft >= 0.05) {
      tierPoints += 2;
      args.push({
        argumentType: "property_description",
        strength: "strong",
        text: `The Assessor record shows ${publicSqft.toLocaleString(
          "en-US",
        )} sqft, but you reported ${userSqft.toLocaleString(
          "en-US",
        )} sqft. A documented factual correction is strongest at the Assessor level.`,
        targetAv: null,
        estimatedSavings: null,
      });
    }
  }

  const shock = assessmentShockPct(caseFile);
  if (shock !== null && shock >= 15) {
    tierPoints += 1;
    args.push({
      argumentType: "assessment_shock",
      strength: "supporting",
      text: `Current assessed value increased ${shock.toFixed(0)}% from the prior final value.`,
      targetAv: null,
      estimatedSavings: null,
    });
  }

  let tier: EvidenceTier;
  let tierMessage: string;
  if (tierPoints >= 3) {
    tier = "STRONG";
    tierMessage = "Multiple independent grounds support spending time on an appeal.";
  } else if (tierPoints >= 1) {
    tier = "MODERATE";
    tierMessage = "At least one credible ground supports an appeal.";
  } else {
    tier = "LIMITED";
    tierMessage =
      "Appeal Compass can make mistakes and doesn't check all factors that might lead to a property tax reduction.";
  }

  const pointSavings = Math.max(0, ...args.map((argument) => argument.estimatedSavings ?? 0));
  return {
    tier,
    tierMessage,
    comparableAnalysis,
    landAssessment,
    arguments: args,
    impliedMarketValue: impliedMarket,
    savingsAssumptions: {
      taxRate,
      taxRateSource,
      stateEqualizer: STATE_EQUALIZER,
      low: pointSavings * 0.8,
      point: pointSavings,
      high: pointSavings * 1.2,
    },
    disclaimers: [
      NOT_LEGAL_ADVICE,
      "Estimated savings are rough ranges, not promises. Taxes must still be paid on time.",
    ],
  };
}

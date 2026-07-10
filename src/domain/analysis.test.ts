import { analyzeComparables, buildEvidenceSummary } from "./analysis";
import { ASSESSOR_PROFILE, BOR_PROFILE, PTAB_PROFILE } from "./comparableProfiles";
import type { ComparableProfile } from "./comparableProfiles";
import { gapPct, medianValue, percentileRank } from "./math";
import {
  type CaseFile,
  type Comparable,
  type ComparableAnalysis,
  defaultUserEvidence,
  withUserEvidence,
} from "./models";
import { loadFixtureCase, makeComparable } from "./testHelpers";

function positive(value: number | null): number | null {
  return value !== null && value > 0 ? value : null;
}

function expectNullableClose(actual: number | null, expected: number | null): void {
  if (expected === null) {
    expect(actual).toBeNull();
    return;
  }
  expect(actual).not.toBeNull();
  expect(actual ?? 0).toBeCloseTo(expected, 8);
}

function activeProfileStep(
  caseFile: CaseFile,
  analysis: ComparableAnalysis,
  profile: ComparableProfile,
) {
  const subjectSqft =
    positive(caseFile.parcel.buildingSqft) ?? positive(caseFile.userEvidence.actualSqft);
  return profile.similaritySteps.find((step) =>
    analysis.pool.every((item) => {
      const compSqft = item.comparable.buildingSqft;
      if (subjectSqft === null || compSqft === null) {
        return false;
      }
      const sqftMatches =
        subjectSqft * (1 - step.sqftTolerance) <= compSqft &&
        compSqft <= subjectSqft * (1 + step.sqftTolerance);
      const yearMatches =
        caseFile.parcel.yearBuilt === null ||
        item.comparable.yearBuilt === null ||
        Math.abs(item.comparable.yearBuilt - caseFile.parcel.yearBuilt) <= step.yearTolerance;
      return sqftMatches && yearMatches;
    }),
  );
}

function expectSortedBySimilarity(rows: ComparableAnalysis["pool"]): void {
  for (let index = 1; index < rows.length; index += 1) {
    const previous = rows[index - 1];
    const current = rows[index];
    expect(previous).toBeDefined();
    expect(current).toBeDefined();
    expect(previous?.similarity ?? 0).toBeLessThanOrEqual(current?.similarity ?? 0);
  }
}

function expectComparableRealism(
  caseFile: CaseFile,
  analysis: ComparableAnalysis,
  profile: ComparableProfile,
): void {
  expect(analysis.status).toBe("ok");
  expect(analysis.poolSize).toBe(analysis.pool.length);
  expect(analysis.subjectAvPerSqft).not.toBeNull();
  expect(analysis.subjectAvPerSqft ?? 0).toBeGreaterThan(0);
  expect(analysis.subjectAvPerSqft ?? 0).toBeLessThan(500);
  expect(activeProfileStep(caseFile, analysis, profile)).toBeDefined();
  expectSortedBySimilarity(analysis.pool);
  expectSortedBySimilarity(analysis.exhibit);
  for (const item of analysis.pool) {
    expect(item.comparable.propertyClass).toBe(caseFile.parcel.propertyClass);
    expect(item.avPerSqft).toBeGreaterThan(0);
    expect(item.avPerSqft).toBeLessThan(500);
    if (analysis.scope === "neighborhood") {
      expect(item.comparable.neighborhood).toBe(caseFile.parcel.neighborhood);
    }
    if (item.distanceKm !== null) {
      expect(item.distanceKm).toBeGreaterThanOrEqual(0);
      expect(item.distanceKm).toBeLessThan(100);
    }
  }
  for (const item of analysis.exhibit) {
    expect(item.avPerSqft).toBeLessThan(analysis.subjectAvPerSqft ?? 0);
  }
  const avPerSqftValues = analysis.pool.map((item) => item.avPerSqft);
  expectNullableClose(analysis.medianAvPerSqft, medianValue(avPerSqftValues));
  expectNullableClose(
    analysis.percentile,
    percentileRank(analysis.subjectAvPerSqft ?? 0, avPerSqftValues),
  );
  expectNullableClose(analysis.gapPct, gapPct(analysis.subjectAvPerSqft, avPerSqftValues));
}

function condoCaseWithMissingRate(missingCount: number, totalCount: number): CaseFile {
  const caseFile = loadFixtureCase("03000000000001");
  const comps: Comparable[] = [];
  for (let index = 0; index < totalCount; index += 1) {
    const missing = index < missingCount;
    comps.push(
      makeComparable({
        pin: `0300000099${index.toString().padStart(4, "0")}`,
        pinFormatted: `03-00-000-099-${index.toString().padStart(4, "0")}`,
        address: `${index} CONDO ST`,
        propertyClass: "299",
        buildingSqft: missing ? null : 980 + index,
        yearBuilt: 1980,
        av: missing ? null : 35000 + index * 1000,
        improvementAv: missing ? null : 28000 + index * 1000,
        neighborhood: "0199",
        lat: 41.9902 + index * 0.0001,
        lon: -87.6972 - index * 0.0001,
      }),
    );
  }
  return {
    ...caseFile,
    parcel: {
      ...caseFile.parcel,
      propertyClass: "299",
      currentAv: 60000,
      currentImprovementAv: 50000,
      buildingSqft: 1000,
      yearBuilt: 1980,
      neighborhood: "0199",
    },
    comparables: comps,
    subjectSales: [],
  };
}

test("comparable analysis known fixture is strong", () => {
  const caseFile = loadFixtureCase("03000000000001");
  const comps = analyzeComparables(caseFile);
  expect(comps.status).toBe("ok");
  expect(comps.profileKey).toBe("assessor");
  expect(comps.poolSize).toBe(10);
  expect(comps.pool).toHaveLength(10);
  expect(comps.percentile).not.toBeNull();
  expect(comps.percentile ?? 0).toBeGreaterThanOrEqual(75);
  expect(comps.gapPct).not.toBeNull();
  expect(comps.gapPct ?? 0).toBeGreaterThan(10);
  expectComparableRealism(caseFile, comps, ASSESSOR_PROFILE);
  expect(comps.pool.some((item) => item.comparable.pinFormatted === "03-00-000-000-0010")).toBe(
    true,
  );
  expect(comps.exhibit.some((item) => item.comparable.pinFormatted === "03-00-000-000-0010")).toBe(
    false,
  );
  const compWithSale = comps.exhibit.find(
    (item) => item.comparable.pinFormatted === "03-00-000-000-0002",
  );
  expect(compWithSale?.comparable.propertyClass).toBe("203");
  expect(compWithSale?.comparable.saleDate).toBe("2024-08-10");
  expect(compWithSale?.comparable.salePrice).toBe(430000);
});

test("comparable analysis excludes candidates outside the subject property class", () => {
  const caseFile = loadFixtureCase("03000000000001");
  const sameClass = Array.from({ length: 3 }, (_, index) =>
    makeComparable({
      pin: `0300000005${index.toString().padStart(4, "0")}`,
      pinFormatted: `03-00-000-005-${index.toString().padStart(4, "0")}`,
      address: `${index} SAME CLASS ST`,
      buildingSqft: 1780 + index * 10,
      yearBuilt: 1924,
      av: 42000 + index * 1000,
      propertyClass: "203",
      neighborhood: "0101",
    }),
  );
  const mismatchedClass = makeComparable({
    pin: "03000000059999",
    pinFormatted: "03-00-000-005-9999",
    address: "MISMATCHED CLASS ST",
    buildingSqft: 1800,
    yearBuilt: 1924,
    av: 1000,
    propertyClass: "299",
    neighborhood: "0101",
  });
  const analysis = analyzeComparables({
    ...caseFile,
    comparables: [mismatchedClass, ...sameClass],
  });
  expect(analysis.status).toBe("ok");
  expect(analysis.pool.map((item) => item.comparable.pinFormatted)).not.toContain(
    mismatchedClass.pinFormatted,
  );
  expectComparableRealism(
    { ...caseFile, comparables: [mismatchedClass, ...sameClass] },
    analysis,
    ASSESSOR_PROFILE,
  );
});

test("comparable analysis excludes candidates from a different assessment year", () => {
  const caseFile = loadFixtureCase("03000000000001");
  const sameYear = Array.from({ length: 3 }, (_, index) =>
    makeComparable({
      pin: `0300000008${index.toString().padStart(4, "0")}`,
      pinFormatted: `03-00-000-008-${index.toString().padStart(4, "0")}`,
      address: `${index} SAME YEAR ST`,
      buildingSqft: 1780 + index * 10,
      yearBuilt: 1924,
      improvementAv: 32000 + index * 1000,
      propertyClass: "203",
      assessmentYear: caseFile.parcel.assessmentYear,
      neighborhood: "0101",
    }),
  );
  const mismatchedYear = makeComparable({
    pin: "03000000089999",
    pinFormatted: "03-00-000-008-9999",
    address: "MISMATCHED YEAR ST",
    buildingSqft: 1800,
    yearBuilt: 1924,
    improvementAv: 1000,
    propertyClass: "203",
    assessmentYear: (caseFile.parcel.assessmentYear ?? 2025) - 1,
    neighborhood: "0101",
  });
  const analysis = analyzeComparables({
    ...caseFile,
    comparables: [mismatchedYear, ...sameYear],
  });
  expect(analysis.status).toBe("ok");
  expect(analysis.pool.map((item) => item.comparable.pinFormatted)).not.toContain(
    mismatchedYear.pinFormatted,
  );
  expect(analysis.warnings.some((warning) => warning.includes("assessment year"))).toBe(true);
});

test("condo degrades after measuring empty pool", () => {
  const caseFile = loadFixtureCase("03000000000020");
  const comps = analyzeComparables(caseFile);
  expect(comps.status).toBe("condo");
  expect(comps.missingDataRate).toBe(100);
  expect(comps.note).toContain("100%");
});

test("condo missing rate above 50 skips with measured note", () => {
  const analysis = analyzeComparables(condoCaseWithMissingRate(6, 10));
  expect(analysis.status).toBe("condo");
  expect(analysis.missingDataRate).toBe(60);
  expect(analysis.note).toContain("60%");
});

test("condo missing rate 30 to 50 runs with warning", () => {
  const analysis = analyzeComparables(condoCaseWithMissingRate(4, 10));
  expect(analysis.status).toBe("ok");
  expect(analysis.missingDataRate).toBe(40);
  expect(analysis.warnings[0]).toContain("40%");
});

test("condo missing rate below 30 runs without warning", () => {
  const analysis = analyzeComparables(condoCaseWithMissingRate(2, 10));
  expect(analysis.status).toBe("ok");
  expect(analysis.missingDataRate).toBe(20);
  expect(analysis.warnings).toEqual([]);
});

test("missing characteristics degrade without crashing", () => {
  const caseFile = loadFixtureCase("03000000000030");
  const comps = analyzeComparables(caseFile);
  expect(comps.status).toBe("insufficient_data");
  expect(comps.missingFields.map((field) => field.name)).toContain("actualSqft");
});

test("missing sqft with user override completes and labels source", () => {
  const caseFile = loadFixtureCase("03000000000001");
  const overrideCase = {
    ...withUserEvidence(caseFile, defaultUserEvidence({ actualSqft: 1800 })),
    parcel: { ...caseFile.parcel, buildingSqft: null },
    subjectSales: [],
  };
  const analysis = analyzeComparables(overrideCase);
  expect(analysis.status).toBe("ok");
  expect(analysis.warnings.some((warning) => warning.includes("user-supplied building sqft"))).toBe(
    true,
  );
  expect(overrideCase.parcel.buildingSqft).toBeNull();
});

test("public sqft wins over user sqft and conflicting user sqft creates description argument", () => {
  const caseFile = loadFixtureCase("03000000000001");
  const overrideCase = withUserEvidence(caseFile, defaultUserEvidence({ actualSqft: 900 }));
  const analysis = analyzeComparables(overrideCase);
  expect(analysis.status).toBe("ok");
  expect(analysis.subjectAvPerSqft).toBe(
    (overrideCase.parcel.currentImprovementAv ?? 0) / (overrideCase.parcel.buildingSqft ?? 1),
  );
  const evidence = buildEvidenceSummary(overrideCase, 0.1);
  expect(
    evidence.arguments.some((argument) => argument.argumentType === "property_description"),
  ).toBe(true);
});

test("non-positive public sqft is treated as missing and user sqft is labeled fallback", () => {
  const caseFile = loadFixtureCase("03000000000001");
  const overrideCase = {
    ...withUserEvidence(caseFile, defaultUserEvidence({ actualSqft: 1800 })),
    parcel: { ...caseFile.parcel, buildingSqft: 0 },
    subjectSales: [],
  };
  const analysis = analyzeComparables(overrideCase);
  expect(analysis.status).toBe("ok");
  expect(analysis.warnings.some((warning) => warning.includes("user-supplied building sqft"))).toBe(
    true,
  );
});

test("public total AV wins over user total AV", () => {
  const caseFile = loadFixtureCase("03000000000001");
  const evidence = buildEvidenceSummary(
    withUserEvidence(caseFile, defaultUserEvidence({ actualAv: 1000 })),
    0.1,
  );
  expect(evidence.impliedMarketValue).toBe((caseFile.parcel.currentAv ?? 0) / 0.1);
});

test("user total AV is fallback-only when public total AV is missing", () => {
  const caseFile = loadFixtureCase("03000000000001");
  const overrideCase = {
    ...withUserEvidence(caseFile, defaultUserEvidence({ actualAv: 50000 })),
    parcel: { ...caseFile.parcel, currentAv: null },
  };
  const evidence = buildEvidenceSummary(overrideCase, 0.1);
  expect(evidence.impliedMarketValue).toBe(500000);
  const analysis = analyzeComparables(overrideCase);
  expect(analysis.status).toBe("ok");
});

test("missing total AV does not block improvement uniformity analysis", () => {
  const caseFile = loadFixtureCase("03000000000001");
  const missingAvCase = { ...caseFile, parcel: { ...caseFile.parcel, currentAv: null } };
  const analysis = analyzeComparables(missingAvCase);
  expect(analysis.status).toBe("ok");
  expect(analysis.missingFields.map((field) => field.name)).not.toContain("actualAv");
});

test("Assessor total AV per sqft alone does not create uniformity evidence", () => {
  const caseFile = loadFixtureCase("03000000000001");
  const parcel = {
    ...caseFile.parcel,
    currentAv: 120000,
    currentImprovementAv: 36000,
    currentLandAv: 10000,
    priorFinalAv: 120000,
  };
  const comps = Array.from({ length: 5 }, (_, index) =>
    makeComparable({
      pin: `0300000006${index.toString().padStart(4, "0")}`,
      pinFormatted: `03-00-000-006-${index.toString().padStart(4, "0")}`,
      address: `${index} TOTAL ONLY ST`,
      propertyClass: "203",
      buildingSqft: 1800,
      yearBuilt: 1924,
      av: 40000,
      improvementAv: 36000,
      landAv: 10000,
      landSqft: 3750,
      assessmentYear: parcel.assessmentYear,
      neighborhood: "0101",
    }),
  );
  const evidence = buildEvidenceSummary(
    { ...caseFile, parcel, comparables: comps, subjectSales: [] },
    0.1,
    "assessor",
  );
  expect(evidence.arguments.some((argument) => argument.argumentType === "uniformity")).toBe(false);
  expect(evidence.tier).toBe("LIMITED");
});

test("land component flags high Land AV per land sqft separately", () => {
  const caseFile = loadFixtureCase("03000000000001");
  const parcel = {
    ...caseFile.parcel,
    currentImprovementAv: 36000,
    currentLandAv: 30000,
    priorFinalAv: 60000,
  };
  const comps = Array.from({ length: 5 }, (_, index) =>
    makeComparable({
      pin: `0300000007${index.toString().padStart(4, "0")}`,
      pinFormatted: `03-00-000-007-${index.toString().padStart(4, "0")}`,
      address: `${index} LAND ST`,
      propertyClass: "203",
      buildingSqft: 1800,
      yearBuilt: 1924,
      av: 46000,
      improvementAv: 36000,
      landAv: 10000 + index * 100,
      landSqft: 3750,
      assessmentYear: parcel.assessmentYear,
      neighborhood: "0101",
    }),
  );
  const evidence = buildEvidenceSummary(
    { ...caseFile, parcel, comparables: comps, subjectSales: [] },
    0.1,
    "assessor",
  );
  expect(evidence.landAssessment.flagged).toBe(true);
  expect(evidence.arguments.some((argument) => argument.argumentType === "land_component")).toBe(
    true,
  );
});

test("BOR missing improvement AV guidance names improvement flag", () => {
  const caseFile = loadFixtureCase("03000000000001");
  const comps = caseFile.comparables
    .filter((comp) => comp.av !== null)
    .map((comp) => ({ ...comp, improvementAv: comp.av }));
  const missingImprovementCase = {
    ...caseFile,
    parcel: { ...caseFile.parcel, currentImprovementAv: null },
    comparables: comps,
  };
  const analysis = analyzeComparables(missingImprovementCase, 10, BOR_PROFILE);
  expect(analysis.status).toBe("insufficient_data");
  expect(analysis.missingFields.map((field) => field.name)).toContain("actualImprovementAv");
});

test("BOR user improvement AV override completes without mutating official record", () => {
  const caseFile = loadFixtureCase("03000000000001");
  const comps = caseFile.comparables
    .filter((comp) => comp.av !== null)
    .map((comp) => ({ ...comp, improvementAv: comp.av }));
  const overrideCase = {
    ...withUserEvidence(caseFile, defaultUserEvidence({ actualImprovementAv: 60000 })),
    parcel: { ...caseFile.parcel, currentImprovementAv: null },
    comparables: comps,
    subjectSales: [],
  };
  const analysis = analyzeComparables(overrideCase, 10, BOR_PROFILE);
  expect(analysis.status).toBe("ok");
  expect(
    analysis.warnings.some((warning) => warning.includes("user-supplied building/improvement")),
  ).toBe(true);
  expect(overrideCase.parcel.currentImprovementAv).toBeNull();
});

test("public improvement AV wins over user improvement AV", () => {
  const caseFile = loadFixtureCase("03000000000001");
  const comps = caseFile.comparables
    .filter((comp) => comp.av !== null)
    .map((comp) => ({ ...comp, improvementAv: comp.av }));
  const overrideCase = {
    ...withUserEvidence(caseFile, defaultUserEvidence({ actualImprovementAv: 1000 })),
    parcel: { ...caseFile.parcel, currentImprovementAv: 90000 },
    comparables: comps,
  };
  const analysis = analyzeComparables(overrideCase, 10, BOR_PROFILE);
  expect(analysis.status).toBe("ok");
  expect(analysis.subjectAvPerSqft).toBe(90000 / (caseFile.parcel.buildingSqft ?? 1));
});

test("evidence summary has honest strong tier", () => {
  const evidence = buildEvidenceSummary(loadFixtureCase("03000000000001"), 0.1);
  expect(evidence.tier).toBe("STRONG");
  expect(evidence.savingsAssumptions.point).toBeGreaterThan(0);
});

test("comparable analysis uses neighborhood scope", () => {
  const caseFile = loadFixtureCase("03000000000001");
  const comps = Array.from({ length: 16 }, (_, index) =>
    makeComparable({
      pin: `0300000001${index.toString().padStart(4, "0")}`,
      pinFormatted: `03-00-000-001-${index.toString().padStart(4, "0")}`,
      address: `${index} TEST ST`,
      buildingSqft: 1750 + index,
      yearBuilt: index === 0 ? null : 1924,
      av: 35000 + index * 1000,
      neighborhood: "0101",
      lat: index === 0 ? null : 41.99,
      lon: index === 0 ? null : -87.69,
    }),
  );
  const analysis = analyzeComparables({ ...caseFile, comparables: comps });
  expect(analysis.status).toBe("ok");
  expect(analysis.scope).toBe("neighborhood");
  expect(analysis.poolSize).toBe(16);
});

test("comparable analysis rejects too few comps", () => {
  const caseFile = loadFixtureCase("03000000000001");
  const analysis = analyzeComparables({
    ...caseFile,
    comparables: caseFile.comparables.slice(0, 2),
  });
  expect(analysis.status).toBe("insufficient_data");
  expect(analysis.note).toContain("too few");
  expect(analysis.subjectAvPerSqft).toBe(50000 / 1800);
});

test("BOR profile uses improvement assessment metric", () => {
  const caseFile = loadFixtureCase("03000000000001");
  const parcel = { ...caseFile.parcel, currentAv: 120000, currentImprovementAv: 90000 };
  const comps = Array.from({ length: 5 }, (_, index) =>
    makeComparable({
      pin: `0300000003${index.toString().padStart(4, "0")}`,
      pinFormatted: `03-00-000-003-${index.toString().padStart(4, "0")}`,
      address: `${index} BOR ST`,
      buildingSqft: 1800,
      yearBuilt: 1924,
      av: 140000,
      improvementAv: 60000 + index * 1000,
      neighborhood: "0101",
      lat: 41.9902,
      lon: -87.6972,
    }),
  );
  const analysis = analyzeComparables(
    { ...caseFile, parcel, comparables: comps, subjectSales: [] },
    10,
    BOR_PROFILE,
  );
  expect(analysis.status).toBe("ok");
  expect(analysis.profileKey).toBe("bor");
  expect(analysis.metricLabel).toBe("Improvement AV");
  expect(analysis.subjectAvPerSqft).toBe(50);
  expect(analysis.medianAvPerSqft).not.toBeNull();
  expect(analysis.medianAvPerSqft ?? 0).toBeLessThan(analysis.subjectAvPerSqft ?? 0);
  expectComparableRealism(
    { ...caseFile, parcel, comparables: comps, subjectSales: [] },
    analysis,
    BOR_PROFILE,
  );
});

test("PTAB profile can run when strict grid fields exist", () => {
  const caseFile = loadFixtureCase("03000000000001");
  const parcel = {
    ...caseFile.parcel,
    currentAv: 120000,
    currentImprovementAv: 90000,
    landSqft: 4000,
    style: "1 Story|Frame|Average",
    amenityCount: 4,
  };
  const comps = Array.from({ length: 4 }, (_, index) =>
    makeComparable({
      pin: `0300000004${index.toString().padStart(4, "0")}`,
      pinFormatted: `03-00-000-004-${index.toString().padStart(4, "0")}`,
      address: `${index} PTAB ST`,
      buildingSqft: 1760 + index * 10,
      yearBuilt: 1920 + index,
      av: 115000,
      improvementAv: 62000 + index * 1000,
      landSqft: 3900 + index * 25,
      style: "1 Story|Frame|Average",
      amenityCount: 5,
      neighborhood: "0101",
      lat: 41.9902 + index * 0.0001,
      lon: -87.6972 - index * 0.0001,
    }),
  );
  const analysis = analyzeComparables(
    { ...caseFile, parcel, comparables: comps, subjectSales: [] },
    10,
    PTAB_PROFILE,
  );
  expect(analysis.status).toBe("ok");
  expect(analysis.profileKey).toBe("ptab");
  expect(analysis.poolSize).toBe(4);
  expect(analysis.exhibit).toHaveLength(4);
  expectComparableRealism(
    { ...caseFile, parcel, comparables: comps, subjectSales: [] },
    analysis,
    PTAB_PROFILE,
  );
});

test("evidence summary supporting uniformity is moderate", () => {
  const caseFile = loadFixtureCase("03000000000001");
  const parcel = { ...caseFile.parcel, currentAv: 45000, priorFinalAv: 45000 };
  const psfValues = [20, 21, 22, 23, 24, 26, 27, 28];
  const comps = psfValues.map((psf, index) =>
    makeComparable({
      pin: `0300000002${index.toString().padStart(4, "0")}`,
      pinFormatted: `03-00-000-002-${index.toString().padStart(4, "0")}`,
      address: `${index} MODERATE ST`,
      buildingSqft: 1800,
      yearBuilt: 1924,
      av: 1800 * psf,
      improvementAv: 1800 * psf,
      neighborhood: "0101",
    }),
  );
  const evidence = buildEvidenceSummary(
    { ...caseFile, parcel, comparables: comps, subjectSales: [] },
    0.1,
  );
  expect(evidence.tier).toBe("MODERATE");
  expect(evidence.arguments.some((argument) => argument.argumentType === "uniformity")).toBe(true);
});

test("evidence summary user evidence paths", () => {
  const caseFile = loadFixtureCase("03000000000001");
  const evidenceCase = {
    ...withUserEvidence(
      caseFile,
      defaultUserEvidence({
        appraisalValue: 420000,
        appraisalDate: "2024-08-01",
        actualSqft: 1600,
      }),
    ),
    subjectSales: [],
  };
  const evidence = buildEvidenceSummary(evidenceCase, 0.1);
  const argumentTypes = new Set(evidence.arguments.map((argument) => argument.argumentType));
  expect([...argumentTypes]).toEqual(
    expect.arrayContaining(["overvaluation", "property_description"]),
  );
  expect(evidence.arguments.some((argument) => argument.text.includes("reported appraisal"))).toBe(
    true,
  );
});

test("recorded sale drives overvaluation when no user value evidence is supplied", () => {
  const caseFile = {
    ...loadFixtureCase("03000000000001"),
    subjectSales: [{ saleDate: "2025-01-01", salePrice: 300000, source: "recorded sale" }],
  };
  const evidence = buildEvidenceSummary(caseFile, 0.1);
  expect(evidence.arguments.some((argument) => argument.text.includes("recorded sale"))).toBe(true);
  expect(evidence.valueEvidence.actionability).toBe("actionable");
});

test("a sub-five-percent value gap is context only and does not produce savings", () => {
  const fixture = loadFixtureCase("03000000000001");
  const caseFile = {
    ...fixture,
    parcel: { ...fixture.parcel, currentAv: 34000, priorFinalAv: null },
    comparables: [],
    subjectSales: [{ saleDate: "2023-03-04", salePrice: 335000, source: "recorded sale" }],
  };

  const evidence = buildEvidenceSummary(caseFile, 0.095857);

  expect(evidence.valueEvidence.gapPct).toBeCloseTo(1.4925, 3);
  expect(evidence.valueEvidence.actionability).toBe("context_only");
  expect(evidence.arguments.some((argument) => argument.argumentType === "overvaluation")).toBe(
    false,
  );
  expect(evidence.savingsAssumptions.point).toBe(0);
  expect(evidence.tier).toBe("LIMITED");
});

test("a five-percent value gap is actionable", () => {
  const fixture = loadFixtureCase("03000000000001");
  const caseFile = {
    ...fixture,
    parcel: { ...fixture.parcel, currentAv: 31500, priorFinalAv: null },
    comparables: [],
    subjectSales: [{ saleDate: "2025-01-01", salePrice: 300000, source: "recorded sale" }],
  };

  const evidence = buildEvidenceSummary(caseFile, 0.1);

  expect(evidence.valueEvidence.gapPct).toBeCloseTo(5, 8);
  expect(evidence.valueEvidence.actionability).toBe("actionable");
  expect(evidence.arguments.some((argument) => argument.argumentType === "overvaluation")).toBe(
    true,
  );
  expect(evidence.savingsAssumptions.point).toBeGreaterThan(0);
  expect(evidence.tier).toBe("MODERATE");
});

test("stale recorded sale is excluded from overvaluation and savings", () => {
  const caseFile = {
    ...loadFixtureCase("03000000000030"),
    subjectSales: [{ saleDate: "2021-03-07", salePrice: 400000, source: "recorded sale" }],
  };
  const evidence = buildEvidenceSummary(caseFile, 0.1);
  expect(evidence.arguments.some((argument) => argument.argumentType === "overvaluation")).toBe(
    false,
  );
  expect(evidence.savingsAssumptions.point).toBe(0);
});

test("user purchase supersedes recorded sale as value evidence", () => {
  const caseFile = {
    ...withUserEvidence(
      loadFixtureCase("03000000000001"),
      defaultUserEvidence({ purchasePrice: 400000, purchaseDate: "2024-12-01" }),
    ),
    subjectSales: [{ saleDate: "2025-01-01", salePrice: 300000, source: "recorded sale" }],
  };
  const evidence = buildEvidenceSummary(caseFile, 0.1);
  expect(evidence.arguments.some((argument) => argument.text.includes("reported purchase"))).toBe(
    true,
  );
  expect(evidence.arguments.some((argument) => argument.text.includes("recorded sale"))).toBe(
    false,
  );
});

test("stale user purchase is excluded from overvaluation and savings", () => {
  const caseFile = {
    ...withUserEvidence(
      loadFixtureCase("03000000000030"),
      defaultUserEvidence({ purchasePrice: 400000, purchaseDate: "2021-03-07" }),
    ),
    subjectSales: [],
  };
  const evidence = buildEvidenceSummary(caseFile, 0.1);
  expect(evidence.arguments.some((argument) => argument.argumentType === "overvaluation")).toBe(
    false,
  );
  expect(evidence.savingsAssumptions.point).toBe(0);
});

test("broad comparable rows remain visible but cannot drive the calculation", () => {
  const fixture = loadFixtureCase("03000000000001");
  const closeRows = [20, 21, 22].map((metric, index) =>
    makeComparable({
      pin: `0300000077${index.toString().padStart(4, "0")}`,
      pinFormatted: `03-00-000-077-${index.toString().padStart(4, "0")}`,
      buildingSqft: 1800,
      yearBuilt: 1924,
      improvementAv: metric * 1800,
      landAv: 8000,
      av: metric * 1800 + 8000,
      landSqft: 3750,
      neighborhood: fixture.parcel.neighborhood,
      lat: (fixture.parcel.lat ?? 41.99) + index * 0.0001,
      lon: fixture.parcel.lon,
    }),
  );
  const broad = makeComparable({
    pin: "03000000779999",
    pinFormatted: "03-00-000-077-9999",
    buildingSqft: 2600,
    yearBuilt: 1959,
    improvementAv: 2600,
    landAv: 8000,
    av: 10600,
    landSqft: 3750,
    neighborhood: fixture.parcel.neighborhood,
    lat: (fixture.parcel.lat ?? 41.99) + 1,
    lon: fixture.parcel.lon,
  });

  const analysis = analyzeComparables({ ...fixture, comparables: [...closeRows, broad] });

  expect(analysis.status).toBe("ok");
  expect(analysis.poolSize).toBe(4);
  expect(analysis.actionablePoolSize).toBe(3);
  expect(analysis.pool.some((item) => item.comparable.pin === broad.pin)).toBe(true);
  expect(analysis.medianAvPerSqft).toBe(21);
});

test("multi-card subjects exclude parcels with a different card count", () => {
  const fixture = loadFixtureCase("03000000000001");
  const matching = [0, 1, 2].map((index) =>
    makeComparable({
      pin: `0300000066${index.toString().padStart(4, "0")}`,
      pinFormatted: `03-00-000-066-${index.toString().padStart(4, "0")}`,
      buildingSqft: 1800 + index * 10,
      yearBuilt: 1924,
      improvementAv: 32000 + index * 500,
      isMulticard: true,
      cardCount: 2,
      cardClasses: ["203"],
      neighborhood: fixture.parcel.neighborhood,
      lat: fixture.parcel.lat,
      lon: fixture.parcel.lon,
    }),
  );
  const wrongCardCount = makeComparable({
    pin: "03000000669999",
    pinFormatted: "03-00-000-066-9999",
    buildingSqft: 1800,
    yearBuilt: 1924,
    improvementAv: 1000,
    neighborhood: fixture.parcel.neighborhood,
    lat: fixture.parcel.lat,
    lon: fixture.parcel.lon,
  });
  const caseFile = {
    ...fixture,
    parcel: {
      ...fixture.parcel,
      isMulticard: true,
      cardCount: 2,
      cardClasses: ["203"],
    },
    comparables: [...matching, wrongCardCount],
  };

  const analysis = analyzeComparables(caseFile);

  expect(analysis.status).toBe("ok");
  expect(analysis.pool.map((item) => item.comparable.pin)).not.toContain(wrongCardCount.pin);
  expect(analysis.warnings.join(" ")).toContain("card count");
});

test("unreconciled subject cards suppress reduction arguments and savings", () => {
  const fixture = loadFixtureCase("03000000000001");
  const caseFile = {
    ...fixture,
    parcel: { ...fixture.parcel, characteristicsReconciled: false },
    subjectSales: [{ saleDate: "2025-01-01", salePrice: 300000, source: "recorded sale" }],
  };

  const evidence = buildEvidenceSummary(caseFile, 0.1);

  expect(evidence.comparableAnalysis.status).toBe("insufficient_data");
  expect(evidence.arguments.some((argument) => argument.argumentType === "uniformity")).toBe(false);
  expect(evidence.arguments.some((argument) => argument.argumentType === "overvaluation")).toBe(
    false,
  );
  expect(evidence.savingsAssumptions.point).toBe(0);
});

test("stale appraisal is context only under the Assessor window", () => {
  const caseFile = {
    ...withUserEvidence(
      loadFixtureCase("03000000000001"),
      defaultUserEvidence({ appraisalValue: 300000, appraisalDate: "2022-12-31" }),
    ),
    comparables: [],
    subjectSales: [],
  };

  const evidence = buildEvidenceSummary(caseFile, 0.1, "assessor");

  expect(evidence.valueEvidence.actionability).toBe("context_only");
  expect(evidence.valueEvidence.explanation).toContain("outside");
  expect(evidence.arguments.some((argument) => argument.argumentType === "overvaluation")).toBe(
    false,
  );
  expect(evidence.savingsAssumptions.point).toBe(0);
});

test("warns when every comparable driving the calculation is more than 3 km away", () => {
  const fixture = loadFixtureCase("03000000000001");
  const comparables = [0, 1, 2].map((index) =>
    makeComparable({
      pin: `0300000055${index.toString().padStart(4, "0")}`,
      pinFormatted: `03-00-000-055-${index.toString().padStart(4, "0")}`,
      buildingSqft: 1800 + index * 10,
      yearBuilt: 1924,
      improvementAv: 32000 + index * 500,
      neighborhood: fixture.parcel.neighborhood,
      lat: (fixture.parcel.lat ?? 41.99) + 0.04,
      lon: fixture.parcel.lon,
    }),
  );

  const analysis = analyzeComparables({ ...fixture, comparables });

  expect(analysis.status).toBe("ok");
  expect(analysis.warnings.join(" ")).toContain("more than 3 km");
});

test("warns when screening savings are large relative to current estimated tax", () => {
  const fixture = loadFixtureCase("03000000000001");
  const comparables = [0, 1, 2].map((index) =>
    makeComparable({
      pin: `0300000044${index.toString().padStart(4, "0")}`,
      pinFormatted: `03-00-000-044-${index.toString().padStart(4, "0")}`,
      buildingSqft: 1800,
      yearBuilt: 1924,
      improvementAv: 18000 + index * 180,
      landAv: 8000,
      av: 26000 + index * 180,
      neighborhood: fixture.parcel.neighborhood,
      lat: fixture.parcel.lat,
      lon: fixture.parcel.lon,
    }),
  );
  const evidence = buildEvidenceSummary(
    {
      ...fixture,
      parcel: { ...fixture.parcel, priorFinalAv: null },
      comparables,
      subjectSales: [],
    },
    0.1,
    "assessor",
  );

  expect(evidence.savingsAssumptions.point).toBeGreaterThan(0);
  expect(evidence.comparableAnalysis.warnings.join(" ")).toContain(
    "screening savings estimate is unusually large",
  );
});

test("limited evidence path has no forced recommendation", () => {
  const caseFile = loadFixtureCase("03000000000030");
  const limitedCase = {
    ...caseFile,
    parcel: { ...caseFile.parcel, currentAv: 45000, priorFinalAv: 45000 },
    subjectSales: [],
  };
  const evidence = buildEvidenceSummary(limitedCase, 0.1);
  expect(evidence.tier).toBe("LIMITED");
  expect(evidence.tierMessage).toContain("Comparable uniformity could not be established");
  expect(evidence.arguments).toEqual([]);
});

import {
  analyzeComparables,
  buildEvidenceCandidates,
  buildSavingsCalculations,
  nestedSimilarityGroups,
} from "./analysis";
import { ASSESSMENT_LEVEL } from "./config";
import type { AnalysisCase, SubjectCorrection } from "./models";
import { applySubjectCorrections } from "./subjectCorrections";
import { loadFixtureCase, makeComparable } from "./testHelpers";

const proof = "official_property_record_card" as const;

function corrected(caseFile: AnalysisCase, corrections: SubjectCorrection[]): AnalysisCase {
  return { ...caseFile, ...applySubjectCorrections(caseFile.publicParcel, corrections) };
}

test("public and effective parcels remain distinct and confirmed corrections override analysis values", () => {
  const fixture = loadFixtureCase("03000000000001");
  const result = corrected(fixture, [{ field: "buildingSqft", value: 2000, proofType: proof }]);
  expect(result.publicParcel.buildingSqft).toBe(1800);
  expect(result.effectiveParcel.buildingSqft).toBe(2000);
  expect(result.provenance.buildingSqft).toBe("user_corrected");
  expect(analyzeComparables(result).subjectImprovementAvPerSqft).toBe(25);
});

test("a user-added missing value is effective and keeps its provenance", () => {
  const fixture = loadFixtureCase("03000000000030");
  const result = corrected(fixture, [{ field: "buildingSqft", value: 1400, proofType: proof }]);
  expect(result.publicParcel.buildingSqft).toBeNull();
  expect(result.effectiveParcel.buildingSqft).toBe(1400);
  expect(result.provenance.buildingSqft).toBe("user_added");
});

test("one corrected AV component can derive the counterpart while preserving Total AV", () => {
  const fixture = loadFixtureCase("03000000000001");
  const result = corrected(fixture, [
    {
      field: "currentImprovementAv",
      value: 48000,
      proofType: "assessment_notice_or_tax_document",
      reconciliation: "automatic",
    },
  ]);
  expect(result.effectiveParcel.currentLandAv).toBe(12000);
  expect(result.provenance.currentLandAv).toBe("derived");
  expect(result.corrections.find((item) => item.field === "currentLandAv")?.derivation).toContain(
    "Total AV",
  );
});

test("Total AV cannot be corrected alone", () => {
  const fixture = loadFixtureCase("03000000000001");
  expect(() =>
    corrected(fixture, [{ field: "currentAv", value: 62000, proofType: proof }]),
  ).toThrow("Improvement AV and Land AV must also be supplied");
});

test("AV components must reconcile exactly", () => {
  const fixture = loadFixtureCase("03000000000001");
  expect(() =>
    corrected(fixture, [
      { field: "currentAv", value: 62000, proofType: proof },
      { field: "currentImprovementAv", value: 50000, proofType: proof },
      { field: "currentLandAv", value: 11000, proofType: proof },
    ]),
  ).toThrow("must equal Improvement AV plus Land AV exactly");
});

test("proof type is mandatory and Other proof requires a description", () => {
  const fixture = loadFixtureCase("03000000000001");
  expect(() => corrected(fixture, [{ field: "yearBuilt", value: 1920, proofType: null }])).toThrow(
    "Choose a proof type",
  );
  expect(() =>
    corrected(fixture, [{ field: "yearBuilt", value: 1920, proofType: "other_documented_proof" }]),
  ).toThrow("Describe the other documented proof");
});

test("blocking and optional missing fields are separated", () => {
  const fixture = loadFixtureCase("03000000000030");
  const effective = applySubjectCorrections({ ...fixture.publicParcel, neighborhood: null }, []);
  expect(effective.blockingMissingFields).toContain("buildingSqft");
  expect(effective.optionalMissingFields).not.toContain("buildingSqft");
  expect(effective.optionalMissingFields).toEqual(expect.arrayContaining(["neighborhood"]));
});

test("multiple-card details are preserved independently of aggregate parcel facts", () => {
  const fixture = loadFixtureCase("03000000000001");
  expect(fixture.propertyCards).toHaveLength(1);
  expect(fixture.propertyCards[0]).toMatchObject({
    cardNumber: "1",
    propertyClass: "203",
    buildingSqft: 1800,
  });
});

test("corrected neighborhood changes neighborhood scope preference", () => {
  const fixture = loadFixtureCase("03000000000001");
  const comps = Array.from({ length: 16 }, (_, index) =>
    makeComparable({
      pin: `0300000044${String(index).padStart(4, "0")}`,
      pinFormatted: `03-00-000-044-${String(index).padStart(4, "0")}`,
      neighborhood: "NEW",
      buildingSqft: 1800,
      yearBuilt: 1924,
      improvementAv: 30000 + index * 100,
      lat: fixture.effectiveParcel.lat,
      lon: fixture.effectiveParcel.lon,
    }),
  );
  const result = corrected({ ...fixture, comparables: comps }, [
    { field: "neighborhood", value: "NEW", proofType: proof },
  ]);
  expect(analyzeComparables(result).scope).toBe("neighborhood");
});

test("corrected sqft, year, and card count change similarity or venue matching", () => {
  const fixture = loadFixtureCase("03000000000001");
  const base = analyzeComparables(fixture);
  const result = corrected(fixture, [
    { field: "buildingSqft", value: 2200, proofType: proof },
    { field: "yearBuilt", value: 1940, proofType: proof },
    { field: "cardCount", value: 2, proofType: proof },
  ]);
  const changed = analyzeComparables(result);
  expect(changed.universe.map((row) => row.comparable.pin)).not.toEqual(
    base.universe.map((row) => row.comparable.pin),
  );
});

test("displayed universe excludes rows above 0.50 and broad rows are not actionable", () => {
  const fixture = loadFixtureCase("03000000000001");
  const far = makeComparable({
    pin: "03000000999999",
    pinFormatted: "03-00-000-099-9999",
    buildingSqft: 2600,
    yearBuilt: 1964,
    lat: 43,
    lon: -87,
  });
  const broad = makeComparable({
    pin: "03000000999998",
    pinFormatted: "03-00-000-099-9998",
    buildingSqft: 2300,
    yearBuilt: 1954,
    lat: 42.01,
    lon: -87.69,
  });
  const summary = analyzeComparables({
    ...fixture,
    comparables: [...fixture.comparables, far, broad],
  });
  expect(summary.universe.every((row) => row.similarity <= 0.5)).toBe(true);
  expect(summary.actionableUniverse.every((row) => row.similarity <= 0.35)).toBe(true);
  expect(summary.actionableUniverse.some((row) => row.band === "broad")).toBe(false);
});

test("top 25, 50, and 75 percent use ceil, contain at least one row, and remain nested", () => {
  const rows = [1, 2, 3, 4, 5];
  const groups = nestedSimilarityGroups(rows);
  expect(groups.top25).toEqual([1, 2]);
  expect(groups.top50).toEqual([1, 2, 3]);
  expect(groups.top75).toEqual([1, 2, 3, 4]);
  expect(nestedSimilarityGroups([1]).top25).toEqual([1]);
});

test("recent-sale summaries use assessment-year January 1 and median sale price per sqft", () => {
  const fixture = loadFixtureCase("03000000000001");
  const summary = analyzeComparables(fixture);
  expect(summary.groups.all.recentSaleCount).toBeGreaterThanOrEqual(3);
  const expected = summary.universe
    .filter((row) => row.recentSale && row.salePricePerSqft !== null)
    .map((row) => row.salePricePerSqft ?? 0)
    .sort((a, b) => a - b);
  const midpoint = Math.floor(expected.length / 2);
  const median =
    expected.length % 2
      ? expected[midpoint]
      : ((expected[midpoint - 1] ?? 0) + (expected[midpoint] ?? 0)) / 2;
  expect(summary.groups.all.medianRecentSalePricePerSqft).toBeCloseTo(median ?? 0);
  expect(summary.groups.all.preliminarySupportedMarketValue).toBeCloseTo(
    (median ?? 0) * (fixture.effectiveParcel.buildingSqft ?? 0),
  );
});

test("fewer than three recent sales produces an insufficient numeric state", () => {
  const fixture = loadFixtureCase("03000000000001");
  const comparables = fixture.comparables.map((comp, index) => ({
    ...comp,
    saleDate: index < 2 ? "2024-01-01" : null,
    salePrice: index < 2 ? 400000 : null,
  }));
  const summary = analyzeComparables({ ...fixture, comparables });
  expect(summary.groups.all.recentSaleCount).toBe(2);
  expect(summary.groups.all.medianRecentSalePricePerSqft).toBeNull();
  expect(summary.groups.all.preliminarySupportedMarketValue).toBeNull();
});

test("land medians and subject ratios use effective corrected values", () => {
  const fixture = loadFixtureCase("03000000000001");
  const result = corrected(fixture, [
    { field: "landSqft", value: 4000, proofType: proof },
    {
      field: "currentLandAv",
      value: 12000,
      proofType: proof,
      reconciliation: "automatic",
    },
  ]);
  expect(analyzeComparables(result).subjectLandAvPerSqft).toBe(3);
});

test("evidence candidates have independent statuses and no overall result", () => {
  const fixture = loadFixtureCase("03000000000001");
  const summary = analyzeComparables(fixture);
  const candidates = buildEvidenceCandidates(fixture, summary, "assessor");
  expect(candidates.map((candidate) => candidate.type)).toEqual(
    expect.arrayContaining(["uniformity", "recorded_sale", "comparable_sales", "land"]),
  );
  expect(candidates.every((candidate) => "status" in candidate)).toBe(true);
  expect("tier" in (candidates as unknown as Record<string, unknown>)).toBe(false);
});

test("uniformity screening distinguishes promising, useful, and no-support conditions", () => {
  const fixture = loadFixtureCase("03000000000001");
  const promising = buildEvidenceCandidates(fixture, analyzeComparables(fixture), "assessor").find(
    (candidate) => candidate.type === "uniformity",
  );
  expect(promising?.status).toBe("promising");
  const aligned = {
    ...fixture,
    effectiveParcel: { ...fixture.effectiveParcel, currentImprovementAv: 34000 },
  };
  const noSupport = buildEvidenceCandidates(aligned, analyzeComparables(aligned), "assessor").find(
    (candidate) => candidate.type === "uniformity",
  );
  expect(noSupport?.status).toBe("does_not_support_reduction");
});

test("recorded sale, purchase, and appraisal remain separate candidates", () => {
  const fixture = loadFixtureCase("03000000000001");
  const purchase = {
    ...fixture,
    subjectValueEvidence: {
      type: "purchase" as const,
      value: 470000,
      date: "2024-06-15",
      proofType: "deed_closing_statement_or_mydec" as const,
    },
  };
  const candidates = buildEvidenceCandidates(purchase, analyzeComparables(purchase), "bor");
  expect(candidates.find((item) => item.type === "recorded_sale")?.selectable).toBe(true);
  expect(candidates.find((item) => item.type === "reported_purchase")?.selectable).toBe(true);
  expect(candidates.find((item) => item.type === "appraisal")?.status).toBe("unavailable");
  expect(
    candidates.find((item) => item.type === "reported_purchase")?.limitations.join(" "),
  ).toContain("same transaction");
});

test("comparable-sales evidence uses median recent sale price per sqft times subject sqft", () => {
  const fixture = loadFixtureCase("03000000000001");
  const summary = analyzeComparables(fixture);
  const candidate = buildEvidenceCandidates(fixture, summary, "assessor").find(
    (item) => item.type === "comparable_sales",
  );
  expect(candidate?.available).toBe(true);
  const median = Number(candidate?.calculationInputs?.medianSalePricePerSqft);
  expect(candidate?.calculationInputs?.preliminarySupportedMarketValue).toBeCloseTo(
    median * (fixture.effectiveParcel.buildingSqft ?? 0),
  );
});

test("land evidence keeps its independent product screen", () => {
  const fixture = loadFixtureCase("03000000000001");
  const highLand = {
    ...fixture,
    effectiveParcel: {
      ...fixture.effectiveParcel,
      currentAv: 90000,
      currentImprovementAv: 50000,
      currentLandAv: 40000,
    },
  };
  const candidate = buildEvidenceCandidates(
    highLand,
    analyzeComparables(highLand),
    "assessor",
  ).find((item) => item.type === "land");
  expect(candidate?.status).toBe("promising");
});

test("savings calculations are separate and never combined", () => {
  const fixture = loadFixtureCase("03000000000001");
  const summary = analyzeComparables(fixture);
  const candidates = buildEvidenceCandidates(fixture, summary, "assessor");
  const calculations = buildSavingsCalculations(fixture, summary, candidates, 0.1, "test rate");
  expect(calculations).toHaveLength(6);
  expect(new Set(calculations.map((item) => item.method)).size).toBe(6);
  expect(calculations.some((item) => (item as unknown as { combined?: unknown }).combined)).toBe(
    false,
  );
  expect(
    calculations.find((item) => item.method === "comparable_sales")?.targetTotalAv,
  ).toBeCloseTo(
    (calculations.find((item) => item.method === "comparable_sales")?.evidenceMarketValue ?? 0) *
      ASSESSMENT_LEVEL,
    -1,
  );
});

test("unusually large savings warning belongs to the affected method", () => {
  const fixture = loadFixtureCase("03000000000001");
  const cheap = fixture.comparables.map((comp) => ({ ...comp, improvementAv: 5000 }));
  const caseFile = { ...fixture, comparables: cheap };
  const summary = analyzeComparables(caseFile);
  const candidates = buildEvidenceCandidates(caseFile, summary, "assessor");
  const calculations = buildSavingsCalculations(caseFile, summary, candidates, 0.1, "test rate");
  expect(calculations.find((item) => item.method === "uniformity")?.warnings.join(" ")).toContain(
    "unusually large",
  );
});

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { caseFileFromJson } from "./caseSerde";
import type { AnalysisCase, Comparable } from "./models";
import { applySubjectCorrections } from "./subjectCorrections";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

export function loadFixtureCase(pin: string): AnalysisCase {
  const raw = JSON.parse(readFileSync(join(root, "fixtures", "cases", `${pin}.json`), "utf8"));
  const fixture = caseFileFromJson(raw);
  return {
    ...fixture,
    ...applySubjectCorrections(fixture.publicParcel, []),
    subjectValueEvidence: null,
  };
}

export function loadAuthorityCrosscheck(): unknown {
  return JSON.parse(
    readFileSync(join(root, "fixtures", "authority", "ccao_2026_deadline_crosscheck.json"), "utf8"),
  );
}

export function makeComparable(overrides: Partial<Comparable>): Comparable {
  return {
    pin: "03000000990000",
    pinFormatted: "03-00-000-099-0000",
    address: "TEST ST",
    propertyClass: "203",
    townshipCode: "01",
    buildingSqft: 1800,
    yearBuilt: 1924,
    saleDate: null,
    salePrice: null,
    assessmentYear: 2025,
    av: 40000,
    improvementAv: 32000,
    landAv: 8000,
    landSqft: null,
    style: null,
    amenityCount: 0,
    neighborhood: "0101",
    lat: null,
    lon: null,
    assessmentStages: { total: null, improvement: null, land: null },
    assessmentComponentsReconciled: true,
    isMulticard: false,
    cardCount: 1,
    cardClasses: ["203"],
    characteristicsReconciled: true,
    ...overrides,
  };
}

import { buildEvidenceSummary } from "../domain/analysis";
import { DEFAULT_TAX_RATE } from "../domain/config";
import {
  type CaseFile,
  type UserEvidence,
  defaultUserEvidence,
  withUserEvidence,
} from "../domain/models";
import type { Venue } from "../domain/models";
import { routeCase } from "../domain/routing";
import { adapterForVenue } from "../domain/venues";
import type { CaseRepository } from "./repository";

export interface CasePayload {
  ok: true;
  demo: boolean;
  generatedAt: string;
  today: string;
  case: CaseFile;
  routing: ReturnType<typeof routeCase>;
  evidence: ReturnType<typeof buildEvidenceSummary>;
  venue: {
    key: string;
    name: string;
    officialUrl: string;
    checklist: string[];
    sections: Array<{ title: string; lines: string[] }>;
  };
  warnings: string[];
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function positiveNumber(params: URLSearchParams, name: string): number | null {
  const value = params.get(name);
  if (!value) {
    return null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function booleanFlag(params: URLSearchParams, name: string): boolean {
  return params.get(name) === "1" || params.get(name) === "true";
}

function userEvidenceFromParams(params: URLSearchParams): UserEvidence {
  return defaultUserEvidence({
    purchasePrice: positiveNumber(params, "purchasePrice"),
    purchaseDate: params.get("purchaseDate"),
    appraisalValue: positiveNumber(params, "appraisalValue"),
    appraisalDate: params.get("appraisalDate"),
    conditionIssues: params.getAll("conditionIssue").filter(Boolean),
    ownershipType:
      params.get("ownershipType") === "llc" ||
      params.get("ownershipType") === "corporation" ||
      params.get("ownershipType") === "other"
        ? (params.get("ownershipType") as "llc" | "corporation" | "other")
        : "individual",
    ownerOccupied: booleanFlag(params, "ownerOccupied") ? true : null,
    age65Plus: booleanFlag(params, "age65Plus") ? true : null,
    householdIncomeBelow65k: booleanFlag(params, "seniorFreezeIncome") ? true : null,
    veteranDisabled: booleanFlag(params, "veteranDisabled") ? true : null,
    personDisabled: booleanFlag(params, "personDisabled") ? true : null,
    vacancyClaim: booleanFlag(params, "vacancyClaim"),
    demolitionClaim: booleanFlag(params, "demolitionClaim"),
    assessorAppealFiled: booleanFlag(params, "assessorAppealFiled"),
    actualSqft: positiveNumber(params, "actualSqft"),
    actualAv: positiveNumber(params, "actualAv"),
    actualImprovementAv: positiveNumber(params, "actualImprovementAv"),
  });
}

export async function buildCasePayload(
  repo: CaseRepository,
  params: URLSearchParams,
  demo: boolean,
): Promise<CasePayload> {
  const pin = params.get("pin") ?? "";
  const today = params.get("today") ?? todayIso();
  const requestedVenue = (params.get("venue") ?? "auto") as Venue;
  const borDecisionDate = params.get("borDecisionDate");
  const taxRate = positiveNumber(params, "taxRate") ?? DEFAULT_TAX_RATE;
  const caseFile = withUserEvidence(await repo.loadCaseByPin(pin), userEvidenceFromParams(params));
  const routing = routeCase(caseFile.parcel.townshipName, today, requestedVenue, borDecisionDate);
  const evidence = buildEvidenceSummary(caseFile, taxRate, routing.venue);
  const adapter = adapterForVenue(routing.venue);
  const sections = adapter.sections(caseFile, evidence, routing);
  return {
    ok: true,
    demo,
    generatedAt: new Date().toISOString(),
    today,
    case: caseFile,
    routing,
    evidence,
    venue: {
      key: adapter.venueKey,
      name: adapter.venueName,
      officialUrl: adapter.officialUrl,
      checklist: adapter.checklist(caseFile),
      sections,
    },
    warnings: [
      ...routing.warnings,
      ...caseFile.dataWarnings,
      ...evidence.comparableAnalysis.warnings,
    ],
  };
}

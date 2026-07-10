import { buildEvidenceSummary } from "../domain/analysis";
import { DEFAULT_TAX_RATE, SUPPORTED_JURISDICTIONS } from "../domain/config";
import { UserInputError } from "../domain/errors";
import {
  type CaseFile,
  type DataNotice,
  type Jurisdiction,
  type UserEvidence,
  defaultUserEvidence,
  withUserEvidence,
} from "../domain/models";
import type { Venue } from "../domain/models";
import { buildDataNotices, cleanWarnings } from "../domain/notices";
import type { AppealStatusInput } from "../domain/routing";
import { routeCase } from "../domain/routing";
import { clerkTaxRateForCode } from "../domain/taxRates";
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
    submissionUrl: string;
    rulesUrl: string;
    checklist: string[];
    sections: Array<{ title: string; lines: string[] }>;
  };
  warnings: string[];
  notices: DataNotice[];
}

const ENTITY_REFUSAL_MESSAGE =
  "Appeal Compass is designed only for individual residential homeowners appealing their own home; if interested in a similar tool for commercial properties please reach out here.";

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function positiveNumber(params: URLSearchParams, name: string, label = name): number | null {
  const value = (params.get(name) ?? "").trim();
  if (!value) {
    return null;
  }
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new UserInputError(`Enter a positive number for ${label}.`);
  }
  return parsed;
}

function optionalIsoDate(params: URLSearchParams, name: string, label: string): string | null {
  const value = (params.get(name) ?? "").trim();
  if (!value) {
    return null;
  }
  const parsed = new Date(`${value}T00:00:00Z`);
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(value) ||
    Number.isNaN(parsed.getTime()) ||
    parsed.toISOString().slice(0, 10) !== value
  ) {
    throw new UserInputError(`Enter a valid date for ${label}.`);
  }
  return value;
}

function requiredChoice<T extends string>(
  params: URLSearchParams,
  name: string,
  allowed: readonly T[],
  label: string,
): T {
  const value = params.get(name);
  if (!value || !allowed.includes(value as T)) {
    throw new UserInputError(`Choose ${label}.`);
  }
  return value as T;
}

function requiredBoolean(params: URLSearchParams, name: string, label: string): boolean {
  const value = params.get(name);
  if (value === "yes" || value === "true" || value === "1") {
    return true;
  }
  if (value === "no" || value === "false" || value === "0") {
    return false;
  }
  throw new UserInputError(`Answer ${label}.`);
}

function jurisdictionFromParams(params: URLSearchParams): Jurisdiction {
  const jurisdiction = (params.get("jurisdiction") ?? "cook_county_il") as Jurisdiction;
  if (!(jurisdiction in SUPPORTED_JURISDICTIONS)) {
    throw new UserInputError("Appeal Compass currently supports only Cook County, Illinois.");
  }
  return jurisdiction;
}

function userEvidenceFromParams(params: URLSearchParams, requestedVenue: Venue): UserEvidence {
  const ownershipType = requiredChoice(
    params,
    "ownershipType",
    ["individual", "llc", "corporation", "other"] as const,
    "an ownership type",
  );
  if (ownershipType !== "individual") {
    throw new UserInputError(ENTITY_REFUSAL_MESSAGE);
  }
  let borNoticeReceived: boolean | null = null;
  let borNoticeDate: string | null = null;
  if (requestedVenue === "ptab") {
    borNoticeReceived = requiredBoolean(
      params,
      "borNoticeReceived",
      "whether you received the written Board of Review decision notice",
    );
    if (borNoticeReceived) {
      borNoticeDate = optionalIsoDate(
        params,
        "borNoticeDate",
        "the written Board of Review decision notice",
      );
      if (!borNoticeDate) {
        throw new UserInputError("Enter the date on the written Board of Review decision notice.");
      }
    }
  }
  const purchasePrice = positiveNumber(params, "purchasePrice", "purchase price");
  const purchaseDate = optionalIsoDate(params, "purchaseDate", "purchase date");
  const appraisalValue = positiveNumber(params, "appraisalValue", "appraisal value");
  const appraisalDate = optionalIsoDate(params, "appraisalDate", "appraisal date");
  if ((purchasePrice === null) !== (purchaseDate === null)) {
    throw new UserInputError("Enter both the subject-property purchase price and purchase date.");
  }
  if ((appraisalValue === null) !== (appraisalDate === null)) {
    throw new UserInputError("Enter both the appraisal value and appraisal date.");
  }
  if (purchasePrice !== null && appraisalValue !== null) {
    throw new UserInputError("Enter either a purchase or an appraisal, not both.");
  }
  return defaultUserEvidence({
    purchasePrice,
    purchaseDate,
    appraisalValue,
    appraisalDate,
    ownershipType,
    borNoticeReceived,
    borNoticeDate,
    actualSqft: positiveNumber(params, "actualSqft", "documented building sqft"),
    actualAv: positiveNumber(params, "actualAv", "documented Total AV"),
    actualImprovementAv: positiveNumber(params, "actualImprovementAv", "documented Improvement AV"),
  });
}

function appealStatusFromEvidence(userEvidence: UserEvidence): AppealStatusInput {
  return {
    borNoticeReceived: userEvidence.borNoticeReceived,
    borNoticeDate: userEvidence.borNoticeDate,
  };
}

function taxRateSelection(
  caseFile: CaseFile,
  overrideRate: number | null,
): { taxRate: number; source: string } {
  if (overrideRate !== null) {
    return {
      taxRate: overrideRate,
      source: `user-supplied tax-rate override ${(overrideRate * 100).toFixed(2)}%`,
    };
  }
  const clerkRate = clerkTaxRateForCode(caseFile.parcel.taxCode);
  if (clerkRate) {
    return {
      taxRate: clerkRate.taxRate,
      source: clerkRate.source,
    };
  }
  return {
    taxRate: DEFAULT_TAX_RATE,
    source: `county default assumption ${(DEFAULT_TAX_RATE * 100).toFixed(
      2,
    )}% because no parcel-specific Clerk tax-code rate was available`,
  };
}

export async function buildCasePayload(
  repo: CaseRepository,
  params: URLSearchParams,
  demo: boolean,
): Promise<CasePayload> {
  const pin = params.get("pin") ?? "";
  const today = params.get("today") ?? todayIso();
  jurisdictionFromParams(params);
  const requestedVenue: Venue = requiredChoice(
    params,
    "venue",
    ["assessor", "bor", "ptab"] as const,
    "where you want to appeal",
  );
  const taxRateOverride = positiveNumber(params, "taxRate");
  const userEvidence = userEvidenceFromParams(params, requestedVenue);
  const caseFile = withUserEvidence(await repo.loadCaseByPin(pin), userEvidence);
  const savingsTaxRate = taxRateSelection(caseFile, taxRateOverride);
  const routing = routeCase(
    caseFile.parcel.townshipName,
    today,
    requestedVenue,
    appealStatusFromEvidence(userEvidence),
  );
  const evidence = buildEvidenceSummary(
    caseFile,
    savingsTaxRate.taxRate,
    routing.venue,
    savingsTaxRate.source,
  );
  const adapter = adapterForVenue(routing.venue);
  const sections = adapter.sections(caseFile, evidence, routing);
  const warnings = cleanWarnings([
    ...routing.warnings,
    ...caseFile.dataWarnings,
    ...evidence.comparableAnalysis.warnings,
  ]);
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
      submissionUrl: adapter.submissionUrl,
      rulesUrl: adapter.rulesUrl,
      checklist: adapter.checklist(caseFile),
      sections,
    },
    warnings,
    notices: buildDataNotices(warnings),
  };
}

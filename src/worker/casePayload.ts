import { buildAnalysisResult } from "../domain/analysis";
import { DEFAULT_TAX_RATE, SUPPORTED_JURISDICTIONS } from "../domain/config";
import { UserInputError } from "../domain/errors";
import type {
  AnalysisCase,
  AnalysisResult,
  EvidenceType,
  Jurisdiction,
  PacketSelection,
  ProofType,
  SubjectCorrection,
  SubjectRecord,
  SubjectValueEvidence,
  Venue,
} from "../domain/models";
import { buildDataNotices, cleanWarnings } from "../domain/notices";
import { normalizePin } from "../domain/pin";
import type { AppealStatusInput } from "../domain/routing";
import { routeCase } from "../domain/routing";
import { PROOF_TYPES, applySubjectCorrections } from "../domain/subjectCorrections";
import { clerkTaxRateForCode } from "../domain/taxRates";
import { adapterForVenue } from "../domain/venues";
import type { CaseRepository } from "./repository";

export interface StepOneInput {
  jurisdiction: Jurisdiction;
  venue: Venue;
  ownershipType: "individual";
  borNoticeReceived: boolean | null;
  borNoticeDate: string | null;
  today: string;
}

export interface SubjectPayload {
  ok: true;
  phase: "subject";
  demo: boolean;
  generatedAt: string;
  stepOne: StepOneInput;
  subject: SubjectRecord & {
    blockingMissingFields: ReturnType<typeof applySubjectCorrections>["blockingMissingFields"];
    optionalMissingFields: ReturnType<typeof applySubjectCorrections>["optionalMissingFields"];
  };
  routing: ReturnType<typeof routeCase>;
  venue: ReturnType<typeof adapterForVenue>;
  warnings: string[];
  notices: ReturnType<typeof buildDataNotices>;
}

export interface AnalysisRequest {
  pin: string;
  stepOne: StepOneInput;
  corrections: SubjectCorrection[];
  valueEvidence: SubjectValueEvidence | null;
  revision: number;
  taxRate?: number | null;
}

export interface AnalysisPayload {
  ok: true;
  phase: "analysis";
  demo: boolean;
  generatedAt: string;
  stepOne: StepOneInput;
  routing: ReturnType<typeof routeCase>;
  venue: ReturnType<typeof adapterForVenue>;
  analysis: AnalysisResult;
}

export interface PacketRequest extends AnalysisRequest {
  selection: PacketSelection;
}

const ENTITY_REFUSAL_MESSAGE =
  "Appeal Compass is designed only for individual residential homeowners appealing their own home; if interested in a similar tool for commercial properties please reach out here.";

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function validIsoDate(value: unknown, label: string, required = false): string | null {
  const text = String(value ?? "").trim();
  if (!text) {
    if (required) throw new UserInputError(`Enter ${label}.`);
    return null;
  }
  const date = new Date(`${text}T00:00:00Z`);
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(text) ||
    Number.isNaN(date.getTime()) ||
    date.toISOString().slice(0, 10) !== text
  ) {
    throw new UserInputError(`Enter a valid date for ${label}.`);
  }
  return text;
}

function validPositiveNumber(value: unknown, label: string): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new UserInputError(`Enter a positive number for ${label}.`);
  }
  return parsed;
}

function stepOneFromRecord(raw: Record<string, unknown>): StepOneInput {
  const jurisdiction = String(raw.jurisdiction ?? "cook_county_il") as Jurisdiction;
  if (!(jurisdiction in SUPPORTED_JURISDICTIONS)) {
    throw new UserInputError("Appeal Compass currently supports only Cook County, Illinois.");
  }
  const venue = String(raw.venue ?? "") as Venue;
  if (!(["assessor", "bor", "ptab"] as string[]).includes(venue)) {
    throw new UserInputError("Choose where you want to appeal.");
  }
  if (raw.ownershipType !== "individual") throw new UserInputError(ENTITY_REFUSAL_MESSAGE);
  let borNoticeReceived: boolean | null = null;
  let borNoticeDate: string | null = null;
  if (venue === "ptab") {
    if (raw.borNoticeReceived === true || raw.borNoticeReceived === "yes") {
      borNoticeReceived = true;
      borNoticeDate = validIsoDate(
        raw.borNoticeDate,
        "the date on the written Board of Review decision notice",
        true,
      );
    } else if (raw.borNoticeReceived === false || raw.borNoticeReceived === "no") {
      borNoticeReceived = false;
    } else {
      throw new UserInputError(
        "Answer whether you received the written Board of Review decision notice.",
      );
    }
  }
  return {
    jurisdiction,
    venue,
    ownershipType: "individual",
    borNoticeReceived,
    borNoticeDate,
    today: validIsoDate(raw.today ?? todayIso(), "today", true) ?? todayIso(),
  };
}

export function stepOneFromParams(params: URLSearchParams): StepOneInput {
  return stepOneFromRecord(Object.fromEntries(params.entries()));
}

function appealStatus(stepOne: StepOneInput): AppealStatusInput {
  return {
    borNoticeReceived: stepOne.borNoticeReceived,
    borNoticeDate: stepOne.borNoticeDate,
  };
}

function valueEvidenceFromUnknown(value: unknown): SubjectValueEvidence | null {
  if (value === null || value === undefined) return null;
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new UserInputError("Subject purchase or appraisal evidence is invalid.");
  }
  const raw = value as Record<string, unknown>;
  const type = raw.type;
  if (type !== "purchase" && type !== "appraisal") {
    throw new UserInputError("Choose either a purchase or an appraisal.");
  }
  const proofType = String(raw.proofType ?? "") as ProofType;
  if (!PROOF_TYPES.includes(proofType)) {
    throw new UserInputError(`Choose a proof type for the ${type}.`);
  }
  const otherProofDescription = String(raw.otherProofDescription ?? "").trim() || null;
  if (proofType === "other_documented_proof" && !otherProofDescription) {
    throw new UserInputError(`Describe the other documented proof for the ${type}.`);
  }
  return {
    type,
    value: validPositiveNumber(
      raw.value,
      type === "purchase" ? "purchase price" : "appraisal value",
    ),
    date:
      validIsoDate(
        raw.date,
        type === "purchase" ? "purchase date" : "appraisal effective date",
        true,
      ) ?? "",
    proofType,
    otherProofDescription,
  };
}

function correctionsFromUnknown(value: unknown): SubjectCorrection[] {
  if (value === null || value === undefined) return [];
  if (!Array.isArray(value)) throw new UserInputError("Subject corrections are invalid.");
  return value.map((item) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      throw new UserInputError("A subject correction is invalid.");
    }
    return item as SubjectCorrection;
  });
}

export function parseAnalysisRequest(value: unknown): AnalysisRequest {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new UserInputError("Analysis request is invalid.");
  }
  const raw = value as Record<string, unknown>;
  const pin = String(raw.pin ?? "").trim();
  if (!pin) throw new UserInputError("Enter a Cook County PIN.");
  if (!raw.stepOne || typeof raw.stepOne !== "object" || Array.isArray(raw.stepOne)) {
    throw new UserInputError("Initial review choices are missing.");
  }
  const revision = Number(raw.revision ?? 1);
  if (!Number.isInteger(revision) || revision < 1) {
    throw new UserInputError("Analysis revision is invalid.");
  }
  const taxRate =
    raw.taxRate === null || raw.taxRate === undefined
      ? null
      : validPositiveNumber(raw.taxRate, "tax rate");
  return {
    pin,
    stepOne: stepOneFromRecord(raw.stepOne as Record<string, unknown>),
    corrections: correctionsFromUnknown(raw.corrections),
    valueEvidence: valueEvidenceFromUnknown(raw.valueEvidence),
    revision,
    taxRate,
  };
}

export function parsePacketRequest(value: unknown): PacketRequest {
  const analysis = parseAnalysisRequest(value);
  const raw = value as Record<string, unknown>;
  if (!raw.selection || typeof raw.selection !== "object" || Array.isArray(raw.selection)) {
    throw new UserInputError("Choose evidence for the packet.");
  }
  const selection = raw.selection as Record<string, unknown>;
  const evidenceTypes = Array.isArray(selection.evidenceTypes)
    ? selection.evidenceTypes.map(String)
    : [];
  const comparablePins = Array.isArray(selection.comparablePins)
    ? selection.comparablePins.map(String)
    : [];
  const allowedEvidenceTypes = new Set<EvidenceType>([
    "uniformity",
    "recorded_sale",
    "reported_purchase",
    "appraisal",
    "comparable_sales",
    "land",
    "property_corrections",
  ]);
  if (
    evidenceTypes.length > allowedEvidenceTypes.size ||
    evidenceTypes.some((type) => !allowedEvidenceTypes.has(type as EvidenceType))
  ) {
    throw new UserInputError("Packet evidence selection is invalid.");
  }
  if (comparablePins.length > 500) {
    throw new UserInputError("Too many comparable rows were selected for the packet.");
  }
  let normalizedPins: string[];
  try {
    normalizedPins = [...new Set(comparablePins.map(normalizePin))];
  } catch {
    throw new UserInputError("A selected comparable PIN is invalid.");
  }
  return {
    ...analysis,
    selection: {
      evidenceTypes: [...new Set(evidenceTypes)] as PacketSelection["evidenceTypes"],
      comparablePins: normalizedPins,
    },
  };
}

function taxRateSelection(
  subject: SubjectRecord,
  overrideRate: number | null | undefined,
): { taxRate: number; source: string } {
  if (overrideRate !== null && overrideRate !== undefined) {
    return {
      taxRate: overrideRate,
      source: `user-supplied tax-rate override ${(overrideRate * 100).toFixed(2)}%`,
    };
  }
  const clerkRate = clerkTaxRateForCode(subject.publicParcel.taxCode);
  if (clerkRate) return { taxRate: clerkRate.taxRate, source: clerkRate.source };
  return {
    taxRate: DEFAULT_TAX_RATE,
    source: `county default assumption ${(DEFAULT_TAX_RATE * 100).toFixed(2)}% because no parcel-specific Clerk tax-code rate was available`,
  };
}

export async function buildSubjectPayload(
  repo: CaseRepository,
  params: URLSearchParams,
  demo: boolean,
): Promise<SubjectPayload> {
  const pin = params.get("pin") ?? "";
  if (!pin) throw new UserInputError("Enter a Cook County PIN.");
  const stepOne = stepOneFromParams(params);
  const subject = await repo.loadSubjectByPin(pin);
  const effective = applySubjectCorrections(subject.publicParcel, []);
  const routing = routeCase(
    subject.publicParcel.townshipName,
    stepOne.today,
    stepOne.venue,
    appealStatus(stepOne),
  );
  const venue = adapterForVenue(routing.venue);
  const warnings = cleanWarnings([...routing.warnings, ...subject.dataWarnings]);
  return {
    ok: true,
    phase: "subject",
    demo,
    generatedAt: new Date().toISOString(),
    stepOne,
    subject: {
      ...subject,
      blockingMissingFields: effective.blockingMissingFields,
      optionalMissingFields: effective.optionalMissingFields,
    },
    routing,
    venue,
    warnings,
    notices: buildDataNotices(warnings),
  };
}

export async function buildAnalysisPayload(
  repo: CaseRepository,
  request: AnalysisRequest,
  demo: boolean,
): Promise<AnalysisPayload> {
  const subject = await repo.loadSubjectByPin(request.pin);
  const effective = applySubjectCorrections(subject.publicParcel, request.corrections);
  if (effective.blockingMissingFields.length > 0) {
    throw new UserInputError(
      `Provide the needed subject data before continuing: ${effective.blockingMissingFields.join(", ")}.`,
    );
  }
  const [comparables, comparableWarnings] = await repo.loadComparables(effective.effectiveParcel);
  const caseFile: AnalysisCase = {
    ...subject,
    ...effective,
    comparables,
    subjectValueEvidence: request.valueEvidence,
    dataWarnings: cleanWarnings([...subject.dataWarnings, ...comparableWarnings]),
  };
  const routing = routeCase(
    effective.effectiveParcel.townshipName,
    request.stepOne.today,
    request.stepOne.venue,
    appealStatus(request.stepOne),
  );
  const venue = adapterForVenue(routing.venue);
  const tax = taxRateSelection(subject, request.taxRate);
  const warnings = cleanWarnings([
    ...routing.warnings,
    ...caseFile.dataWarnings,
    ...(effective.corrections.length > 0
      ? [
          "Confirmed user-corrected values are used in this analysis; original public values remain available.",
        ]
      : []),
    ...(tax.source.includes("no parcel-specific")
      ? [
          "Parcel-specific tax-rate information was unavailable; savings use the labeled county default assumption.",
        ]
      : []),
    ...(routing.venue === "ptab"
      ? [
          "PTAB public-data limitations prevent a complete adjusted comparison grid; verify property cards and required adjustments separately.",
        ]
      : []),
  ]);
  const notices = buildDataNotices(warnings);
  const analysis = buildAnalysisResult({
    caseFile,
    venue: routing.venue,
    revision: request.revision,
    taxRate: tax.taxRate,
    taxRateSource: tax.source,
    notices,
  });
  analysis.warnings = cleanWarnings([...warnings, ...analysis.comparableSummary.warnings]);
  analysis.notices = buildDataNotices(analysis.warnings);
  return {
    ok: true,
    phase: "analysis",
    demo,
    generatedAt: new Date().toISOString(),
    stepOne: request.stepOne,
    routing,
    venue,
    analysis,
  };
}

export function analysisRequestFromParams(params: URLSearchParams): AnalysisRequest {
  return {
    pin: params.get("pin") ?? "",
    stepOne: stepOneFromParams(params),
    corrections: [],
    valueEvidence: null,
    revision: 1,
    taxRate: params.get("taxRate") ? validPositiveNumber(params.get("taxRate"), "tax rate") : null,
  };
}

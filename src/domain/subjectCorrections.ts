import { UserInputError } from "./errors";
import type {
  EffectiveSubject,
  FieldProvenance,
  Parcel,
  ProofType,
  SubjectCorrection,
  SubjectField,
} from "./models";
import { propertyClassDecision } from "./propertyClasses";

export const SUBJECT_FIELDS: SubjectField[] = [
  "propertyClass",
  "townshipName",
  "neighborhood",
  "buildingSqft",
  "landSqft",
  "yearBuilt",
  "currentAv",
  "currentImprovementAv",
  "currentLandAv",
  "cardCount",
];

export const PROOF_TYPES: ProofType[] = [
  "official_property_record_card",
  "assessment_notice_or_tax_document",
  "appraisal",
  "survey",
  "architectural_plans_or_measurements",
  "deed_closing_statement_or_mydec",
  "photographs",
  "contractor_or_architect_documentation",
  "other_documented_proof",
];

export const SUBJECT_FIELD_LABELS: Record<SubjectField, string> = {
  propertyClass: "Property class",
  townshipName: "Township",
  neighborhood: "Neighborhood",
  buildingSqft: "Building sqft",
  landSqft: "Land sqft",
  yearBuilt: "Year built",
  currentAv: "Total AV",
  currentImprovementAv: "Improvement AV",
  currentLandAv: "Land AV",
  cardCount: "Number of property cards",
};

export const PROOF_TYPE_LABELS: Record<ProofType, string> = {
  official_property_record_card: "Official property record card",
  assessment_notice_or_tax_document: "Assessment notice or tax document",
  appraisal: "Appraisal",
  survey: "Survey",
  architectural_plans_or_measurements: "Architectural plans or measurements",
  deed_closing_statement_or_mydec: "Deed, closing statement, or MyDec",
  photographs: "Photographs",
  contractor_or_architect_documentation: "Contractor or architect documentation",
  other_documented_proof: "Other documented proof",
};

const STRING_FIELDS = new Set<SubjectField>(["propertyClass", "townshipName", "neighborhood"]);
const INTEGER_FIELDS = new Set<SubjectField>(["yearBuilt", "cardCount"]);

function cloneParcel(parcel: Parcel): Parcel {
  return {
    ...parcel,
    assessmentStages: { ...parcel.assessmentStages },
    cardClasses: [...parcel.cardClasses],
  };
}

function hasPublicValue(parcel: Parcel, field: SubjectField): boolean {
  const value = parcel[field];
  return typeof value === "string"
    ? value.trim().length > 0
    : typeof value === "number" && value > 0;
}

function validateProof(correction: SubjectCorrection): void {
  if (!correction.proofType || !PROOF_TYPES.includes(correction.proofType)) {
    throw new UserInputError(`Choose a proof type for ${SUBJECT_FIELD_LABELS[correction.field]}.`);
  }
  if (
    correction.proofType === "other_documented_proof" &&
    !(correction.otherProofDescription ?? "").trim()
  ) {
    throw new UserInputError(
      `Describe the other documented proof for ${SUBJECT_FIELD_LABELS[correction.field]}.`,
    );
  }
}

function normalizedValue(field: SubjectField, raw: string | number): string | number {
  if (STRING_FIELDS.has(field)) {
    const value = String(raw).trim();
    if (!value) {
      throw new UserInputError(`Enter a value for ${SUBJECT_FIELD_LABELS[field]}.`);
    }
    if (value.length > 120) {
      throw new UserInputError(`${SUBJECT_FIELD_LABELS[field]} is too long.`);
    }
    if (field === "propertyClass" && !propertyClassDecision(value).supported) {
      throw new UserInputError("Enter a supported residential property class.");
    }
    return value;
  }
  const value = Number(raw);
  if (!Number.isFinite(value) || value <= 0) {
    throw new UserInputError(`Enter a positive value for ${SUBJECT_FIELD_LABELS[field]}.`);
  }
  if (INTEGER_FIELDS.has(field) && !Number.isInteger(value)) {
    throw new UserInputError(`${SUBJECT_FIELD_LABELS[field]} must be a whole number.`);
  }
  if ((field === "buildingSqft" || field === "landSqft") && value > 10_000_000) {
    throw new UserInputError(`${SUBJECT_FIELD_LABELS[field]} is outside the supported range.`);
  }
  if (field === "yearBuilt" && (value < 1600 || value > new Date().getUTCFullYear() + 1)) {
    throw new UserInputError("Year built is outside the supported range.");
  }
  if (field === "cardCount" && value > 100) {
    throw new UserInputError("Number of property cards is outside the supported range.");
  }
  if (
    (field === "currentAv" || field === "currentImprovementAv" || field === "currentLandAv") &&
    value > 1_000_000_000
  ) {
    throw new UserInputError(`${SUBJECT_FIELD_LABELS[field]} is outside the supported range.`);
  }
  return value;
}

function initialProvenance(): Record<SubjectField, FieldProvenance> {
  return Object.fromEntries(SUBJECT_FIELDS.map((field) => [field, "public"])) as Record<
    SubjectField,
    FieldProvenance
  >;
}

function derivedCorrection(
  field: SubjectField,
  value: number,
  derivation: string,
): SubjectCorrection {
  return {
    field,
    value,
    proofType: null,
    provenance: "derived",
    derivation,
  };
}

export function applySubjectCorrections(
  publicParcel: Parcel,
  requestedCorrections: SubjectCorrection[],
): EffectiveSubject {
  const effectiveParcel = cloneParcel(publicParcel);
  const provenance = initialProvenance();
  const corrections: SubjectCorrection[] = [];
  const seen = new Set<SubjectField>();

  for (const requested of requestedCorrections) {
    if (!SUBJECT_FIELDS.includes(requested.field)) {
      throw new UserInputError("A subject correction field is invalid.");
    }
    if (seen.has(requested.field)) {
      throw new UserInputError(
        `${SUBJECT_FIELD_LABELS[requested.field]} can be corrected only once.`,
      );
    }
    seen.add(requested.field);
    validateProof(requested);
    const value = normalizedValue(requested.field, requested.value);
    const provenanceValue: FieldProvenance = hasPublicValue(publicParcel, requested.field)
      ? "user_corrected"
      : "user_added";
    const correction: SubjectCorrection = {
      ...requested,
      value,
      provenance: provenanceValue,
      otherProofDescription: requested.otherProofDescription?.trim() || null,
    };
    (effectiveParcel as unknown as Record<SubjectField, string | number | null>)[requested.field] =
      value;
    provenance[requested.field] = provenanceValue;
    corrections.push(correction);
  }

  if (seen.has("townshipName") && effectiveParcel.townshipName !== publicParcel.townshipName) {
    effectiveParcel.townshipCode = null;
  }

  const totalCorrection = corrections.find((item) => item.field === "currentAv");
  const improvementCorrection = corrections.find((item) => item.field === "currentImprovementAv");
  const landCorrection = corrections.find((item) => item.field === "currentLandAv");

  if (totalCorrection && (!improvementCorrection || !landCorrection)) {
    throw new UserInputError(
      "When Total AV is corrected, Improvement AV and Land AV must also be supplied.",
    );
  }

  if (totalCorrection && improvementCorrection && landCorrection) {
    if (
      Number(totalCorrection.value) !==
      Number(improvementCorrection.value) + Number(landCorrection.value)
    ) {
      throw new UserInputError("Total AV must equal Improvement AV plus Land AV exactly.");
    }
  } else if (improvementCorrection && landCorrection) {
    if (
      effectiveParcel.currentAv === null ||
      Number(improvementCorrection.value) + Number(landCorrection.value) !==
        effectiveParcel.currentAv
    ) {
      throw new UserInputError(
        "Corrected Improvement AV and Land AV must equal the current Total AV, or Total AV must also be corrected.",
      );
    }
  } else if (improvementCorrection || landCorrection) {
    const manual = improvementCorrection ?? landCorrection;
    if (manual?.reconciliation !== "automatic") {
      throw new UserInputError(
        "Choose automatic AV reconciliation or enter the other AV component manually.",
      );
    }
    if (effectiveParcel.currentAv === null || effectiveParcel.currentAv <= 0) {
      throw new UserInputError("Total AV is needed for automatic AV reconciliation.");
    }
    const derivedField: SubjectField = improvementCorrection
      ? "currentLandAv"
      : "currentImprovementAv";
    const derivedValue = effectiveParcel.currentAv - Number(manual.value);
    if (derivedValue <= 0) {
      throw new UserInputError(
        "Automatic AV reconciliation would produce an invalid AV component.",
      );
    }
    effectiveParcel[derivedField] = derivedValue;
    provenance[derivedField] = "derived";
    const derivation = `${SUBJECT_FIELD_LABELS[derivedField]} = Total AV ${effectiveParcel.currentAv} - ${SUBJECT_FIELD_LABELS[manual.field]} ${Number(manual.value)}.`;
    corrections.push(derivedCorrection(derivedField, derivedValue, derivation));
  }

  if (
    effectiveParcel.currentAv === null &&
    effectiveParcel.currentImprovementAv !== null &&
    effectiveParcel.currentImprovementAv > 0 &&
    effectiveParcel.currentLandAv !== null &&
    effectiveParcel.currentLandAv > 0
  ) {
    effectiveParcel.currentAv =
      effectiveParcel.currentImprovementAv + effectiveParcel.currentLandAv;
    provenance.currentAv = "derived";
    corrections.push(
      derivedCorrection(
        "currentAv",
        effectiveParcel.currentAv,
        "Total AV = Improvement AV + Land AV.",
      ),
    );
  }

  if (
    effectiveParcel.currentImprovementAv === null &&
    effectiveParcel.currentAv !== null &&
    effectiveParcel.currentLandAv !== null &&
    effectiveParcel.currentAv > effectiveParcel.currentLandAv
  ) {
    effectiveParcel.currentImprovementAv =
      effectiveParcel.currentAv - effectiveParcel.currentLandAv;
    provenance.currentImprovementAv = "derived";
    corrections.push(
      derivedCorrection(
        "currentImprovementAv",
        effectiveParcel.currentImprovementAv,
        "Improvement AV = Total AV - Land AV.",
      ),
    );
  }

  effectiveParcel.assessmentComponentsReconciled = Boolean(
    effectiveParcel.currentAv &&
      effectiveParcel.currentImprovementAv &&
      effectiveParcel.currentLandAv &&
      effectiveParcel.currentAv ===
        effectiveParcel.currentImprovementAv + effectiveParcel.currentLandAv,
  );
  if (provenance.cardCount !== "public") {
    effectiveParcel.isMulticard = effectiveParcel.cardCount > 1;
    effectiveParcel.characteristicsReconciled = true;
  }

  const blockingMissingFields: SubjectField[] = [];
  if (!effectiveParcel.propertyClass.trim()) blockingMissingFields.push("propertyClass");
  if (!effectiveParcel.townshipName.trim()) blockingMissingFields.push("townshipName");
  if (!effectiveParcel.buildingSqft || effectiveParcel.buildingSqft <= 0)
    blockingMissingFields.push("buildingSqft");
  if (!effectiveParcel.currentImprovementAv || effectiveParcel.currentImprovementAv <= 0)
    blockingMissingFields.push("currentImprovementAv");
  if (
    !effectiveParcel.cardCount ||
    effectiveParcel.cardCount <= 0 ||
    (!publicParcel.characteristicsReconciled && provenance.cardCount === "public")
  ) {
    blockingMissingFields.push("cardCount");
  }

  const optionalMissingFields = (
    ["neighborhood", "yearBuilt", "currentAv", "landSqft", "currentLandAv"] as SubjectField[]
  ).filter((field) => !hasPublicValue(effectiveParcel, field));

  return {
    publicParcel: cloneParcel(publicParcel),
    effectiveParcel,
    provenance,
    corrections,
    blockingMissingFields: [...new Set(blockingMissingFields)],
    optionalMissingFields,
  };
}

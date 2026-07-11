export type Venue = "assessor" | "bor" | "ptab";
export type Jurisdiction = "cook_county_il";
export type ResolvedVenue = "assessor" | "bor" | "ptab" | "closed";
export type ActionStatus = "open" | "upcoming" | "closed" | "urgent" | "expired" | "needs_input";
export type DeadlineState = "published" | "not_published" | "awaiting_notice" | "expired";
export type NoticeSeverity = "caution" | "info";
export type AssessmentStage = "board" | "certified" | "mailed" | null;

export interface AssessmentStages {
  total: AssessmentStage;
  improvement: AssessmentStage;
  land: AssessmentStage;
}

export interface Parcel {
  pin: string;
  pinFormatted: string;
  propertyClass: string;
  townshipName: string;
  address: string;
  city: string;
  zipCode: string;
  neighborhood: string | null;
  townshipCode: string | null;
  taxCode: string | null;
  buildingSqft: number | null;
  landSqft: number | null;
  yearBuilt: number | null;
  style: string | null;
  amenityCount: number;
  beds: number | null;
  fullBaths: number | null;
  lat: number | null;
  lon: number | null;
  assessmentYear: number | null;
  currentAv: number | null;
  currentImprovementAv: number | null;
  currentLandAv: number | null;
  priorFinalAv: number | null;
  assessmentStages: AssessmentStages;
  assessmentComponentsReconciled: boolean;
  isMulticard: boolean;
  cardCount: number;
  cardClasses: string[];
  characteristicsReconciled: boolean;
}

export interface PropertyCardDetail {
  cardNumber: string;
  propertyClass: string | null;
  buildingSqft: number | null;
  yearBuilt: number | null;
}

export interface Comparable {
  pin: string;
  pinFormatted: string;
  address: string;
  propertyClass: string | null;
  townshipCode: string | null;
  buildingSqft: number | null;
  yearBuilt: number | null;
  saleDate: string | null;
  salePrice: number | null;
  assessmentYear: number | null;
  av: number | null;
  improvementAv: number | null;
  landAv: number | null;
  landSqft: number | null;
  style: string | null;
  amenityCount: number;
  neighborhood: string | null;
  lat: number | null;
  lon: number | null;
  assessmentStages: AssessmentStages;
  assessmentComponentsReconciled: boolean;
  isMulticard: boolean;
  cardCount: number;
  cardClasses: string[];
  characteristicsReconciled: boolean;
}

export interface Sale {
  saleDate: string;
  salePrice: number;
  source: string;
}

export interface AssessmentHistoryRow {
  year: number;
  mailedAv: number | null;
  certifiedAv: number | null;
  boardAv: number | null;
  finalAv: number | null;
}

export interface SubjectRecord {
  publicParcel: Parcel;
  propertyCards: PropertyCardDetail[];
  assessmentHistory: AssessmentHistoryRow[];
  subjectSales: Sale[];
  dataWarnings: string[];
}

export type SubjectField =
  | "propertyClass"
  | "townshipName"
  | "neighborhood"
  | "buildingSqft"
  | "landSqft"
  | "yearBuilt"
  | "currentAv"
  | "currentImprovementAv"
  | "currentLandAv"
  | "cardCount";

export type FieldProvenance = "public" | "user_corrected" | "user_added" | "derived";

export type ProofType =
  | "official_property_record_card"
  | "assessment_notice_or_tax_document"
  | "appraisal"
  | "survey"
  | "architectural_plans_or_measurements"
  | "deed_closing_statement_or_mydec"
  | "photographs"
  | "contractor_or_architect_documentation"
  | "other_documented_proof";

export interface SubjectCorrection {
  field: SubjectField;
  value: string | number;
  proofType: ProofType | null;
  otherProofDescription?: string | null;
  reconciliation?: "automatic" | "manual";
  provenance?: Exclude<FieldProvenance, "public">;
  derivation?: string | null;
}

export interface SubjectValueEvidence {
  type: "purchase" | "appraisal";
  value: number;
  date: string;
  proofType: ProofType;
  otherProofDescription?: string | null;
}

export interface EffectiveSubject {
  publicParcel: Parcel;
  effectiveParcel: Parcel;
  provenance: Record<SubjectField, FieldProvenance>;
  corrections: SubjectCorrection[];
  blockingMissingFields: SubjectField[];
  optionalMissingFields: SubjectField[];
}

export interface AnalysisCase extends SubjectRecord, EffectiveSubject {
  comparables: Comparable[];
  subjectValueEvidence: SubjectValueEvidence | null;
}

export interface DataNotice {
  code: string;
  severity: NoticeSeverity;
  title: string;
  summary: string;
  details: string[];
}

export type SimilarityBandName = "excellent" | "good" | "decent" | "broad";

export interface ComparableExhibit {
  comparable: Comparable;
  improvementAvPerSqft: number;
  landAvPerSqft: number | null;
  salePricePerSqft: number | null;
  distanceKm: number | null;
  similarity: number;
  band: SimilarityBandName;
  recentSale: boolean;
}

export type SimilarityGroupKey = "top25" | "top50" | "top75" | "all";

export interface SimilarityGroupSummary {
  key: SimilarityGroupKey;
  label: string;
  count: number;
  comparablePins: string[];
  medianImprovementAvPerSqft: number | null;
  subjectImprovementComparisonPct: number | null;
  recentSaleCount: number;
  medianRecentSalePricePerSqft: number | null;
  preliminarySupportedMarketValue: number | null;
  impliedMarketValueComparisonPct: number | null;
  usableLandCount: number;
  medianLandAvPerSqft: number | null;
  subjectLandComparisonPct: number | null;
}

export interface ComparableSummary {
  status: "ok" | "insufficient_data" | "condo";
  note: string;
  profileKey: string;
  profileLabel: string;
  scope: string | null;
  warnings: string[];
  universe: ComparableExhibit[];
  actionableUniverse: ComparableExhibit[];
  bandCounts: Record<SimilarityBandName, number>;
  groups: Record<SimilarityGroupKey, SimilarityGroupSummary>;
  subjectImprovementAvPerSqft: number | null;
  subjectLandAvPerSqft: number | null;
  subjectImpliedMarketValue: number | null;
}

export type EvidenceType =
  | "uniformity"
  | "recorded_sale"
  | "reported_purchase"
  | "appraisal"
  | "comparable_sales"
  | "land"
  | "property_corrections";

export type EvidenceStatus =
  | "promising"
  | "potentially_useful"
  | "weak_or_incomplete"
  | "does_not_support_reduction"
  | "unavailable";

export interface EvidenceCandidate {
  type: EvidenceType;
  name: string;
  available: boolean;
  selectable: boolean;
  status: EvidenceStatus;
  shortReason: string;
  screeningRule: string;
  officialRuleSummary: string;
  officialRuleUrl: string;
  dataUsed: string[];
  limitations: string[];
  calculationInputs?: Record<string, string | number | null | string[]>;
}

export type SavingsMethod = Exclude<EvidenceType, "property_corrections">;

export interface SavingsCalculation {
  method: SavingsMethod;
  evidenceName: string;
  status: EvidenceStatus;
  available: boolean;
  limitation: string | null;
  formula: string;
  groupLabel: string | null;
  comparablePins: string[];
  comparableCount: number;
  currentTotalAv: number | null;
  targetTotalAv: number | null;
  avReduction: number | null;
  currentImpliedMarketValue: number | null;
  evidenceMarketValue: number | null;
  targetMarketValueEquivalent: number | null;
  estimatedCurrentTax: number | null;
  estimatedTargetTax: number | null;
  annualSavingsPoint: number | null;
  annualSavingsLow: number | null;
  annualSavingsHigh: number | null;
  stateEqualizer: number;
  taxRate: number;
  taxRateSource: string;
  assessmentLevel: number;
  warnings: string[];
  disclaimer: string;
}

export interface AnalysisResult {
  revision: number;
  subject: EffectiveSubject;
  propertyCards: PropertyCardDetail[];
  assessmentHistory: AssessmentHistoryRow[];
  subjectSales: Sale[];
  subjectValueEvidence: SubjectValueEvidence | null;
  comparableSummary: ComparableSummary;
  evidenceCandidates: EvidenceCandidate[];
  savingsCalculations: SavingsCalculation[];
  notices: DataNotice[];
  warnings: string[];
}

export interface PacketSelection {
  evidenceTypes: EvidenceType[];
  comparablePins: string[];
}

export interface RouteResult {
  venue: ResolvedVenue;
  headline: string;
  reasoning: string[];
  actionStatus: ActionStatus;
  deadline: string | null;
  daysRemaining: number | null;
  deadlineState: DeadlineState;
  deadlineLabel: string;
  deadlines: DeadlineItem[];
  warnings: string[];
  officialUrl: string | null;
}

export interface DeadlineItem {
  kind: "opens" | "filing" | "evidence" | "ptab";
  label: string;
  date: string;
  daysRemaining: number | null;
}

export interface PacketSection {
  title: string;
  lines: string[];
}

export function isCondo(parcel: Parcel): boolean {
  return parcel.propertyClass.trim() === "299";
}

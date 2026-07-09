export type Venue = "assessor" | "bor" | "ptab";
export type Jurisdiction = "cook_county_il";
export type ResolvedVenue = "assessor" | "bor" | "ptab" | "closed";
export type EvidenceTier = "STRONG" | "MODERATE" | "LIMITED";
export type ActionStatus = "open" | "upcoming" | "closed" | "urgent" | "expired" | "needs_input";
export type ComparableStatus = "ok" | "condo" | "insufficient_data";
export type ArgumentStrength = "strong" | "supporting";
export type DeadlineState = "published" | "not_published" | "awaiting_notice" | "expired";
export type NoticeSeverity = "caution" | "info";

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
}

export interface Comparable {
  pin: string;
  pinFormatted: string;
  address: string;
  propertyClass: string | null;
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

export interface UserEvidence {
  purchasePrice: number | null;
  purchaseDate: string | null;
  appraisalValue: number | null;
  appraisalDate: string | null;
  ownershipType: "individual" | "llc" | "corporation" | "other";
  assessorAppealFiled: boolean | null;
  assessorDecisionReceived: boolean | null;
  borAppealFiled: boolean | null;
  borDecisionReceived: boolean | null;
  borDecisionDate: string | null;
  borNoticeReceived: boolean | null;
  borNoticeDate: string | null;
  actualSqft: number | null;
  actualAv: number | null;
  actualImprovementAv: number | null;
}

export interface DataNotice {
  code: string;
  severity: NoticeSeverity;
  title: string;
  summary: string;
  details: string[];
}

export interface CaseFile {
  parcel: Parcel;
  assessmentHistory: AssessmentHistoryRow[];
  comparables: Comparable[];
  subjectSales: Sale[];
  userEvidence: UserEvidence;
  dataWarnings: string[];
}

export interface ComparableExhibit {
  comparable: Comparable;
  avPerSqft: number;
  distanceKm: number | null;
  similarity: number;
}

export type MissingComparableFieldName = "actualSqft" | "actualImprovementAv";

export interface MissingComparableField {
  name: MissingComparableFieldName;
  label: string;
  helpText: string;
}

export interface ComparableAnalysis {
  status: ComparableStatus;
  note: string;
  profileKey: string;
  profileLabel: string;
  metricLabel: string;
  missingFields: MissingComparableField[];
  warnings: string[];
  missingDataRate: number | null;
  scope: string | null;
  poolSize: number;
  subjectAvPerSqft: number | null;
  medianAvPerSqft: number | null;
  percentile: number | null;
  gapPct: number | null;
  pool: ComparableExhibit[];
  exhibit: ComparableExhibit[];
}

export interface LandAssessmentCheck {
  status: "ok" | "insufficient_data";
  note: string;
  subjectLandAvPerSqft: number | null;
  medianLandAvPerSqft: number | null;
  percentile: number | null;
  gapPct: number | null;
  medianComparableLandSqft: number | null;
  poolSize: number;
  flagged: boolean;
}

export interface EvidenceArgument {
  argumentType: string;
  strength: ArgumentStrength;
  text: string;
  targetAv: number | null;
  estimatedSavings: number | null;
}

export interface SavingsAssumption {
  taxRate: number;
  taxRateSource: string;
  stateEqualizer: number;
  low: number;
  point: number;
  high: number;
}

export interface EvidenceSummary {
  tier: EvidenceTier;
  tierMessage: string;
  comparableAnalysis: ComparableAnalysis;
  landAssessment: LandAssessmentCheck;
  arguments: EvidenceArgument[];
  impliedMarketValue: number | null;
  savingsAssumptions: SavingsAssumption;
  disclaimers: string[];
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

export function defaultUserEvidence(overrides: Partial<UserEvidence> = {}): UserEvidence {
  return {
    purchasePrice: null,
    purchaseDate: null,
    appraisalValue: null,
    appraisalDate: null,
    ownershipType: "individual",
    assessorAppealFiled: null,
    assessorDecisionReceived: null,
    borAppealFiled: null,
    borDecisionReceived: null,
    borDecisionDate: null,
    borNoticeReceived: null,
    borNoticeDate: null,
    actualSqft: null,
    actualAv: null,
    actualImprovementAv: null,
    ...overrides,
  };
}

export function withUserEvidence(caseFile: CaseFile, userEvidence: UserEvidence): CaseFile {
  return {
    ...caseFile,
    userEvidence,
  };
}

export function isCondo(parcel: Parcel): boolean {
  return parcel.propertyClass.trim() === "299";
}

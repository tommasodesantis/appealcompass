import type {
  EvidenceType,
  SavingsMethod,
  SimilarityBandName,
  SubjectCorrection,
  SubjectValueEvidence,
} from "../domain/models";

export const APP_SESSION_KEY = "appealcompass:session";
export const APP_SESSION_SCHEMA_VERSION = 3;

export interface ComparableTableState {
  bands: SimilarityBandName[];
  saleFilter: "all" | "recorded" | "recent";
  propertyClass: string;
  neighborhood: string;
  maxDistanceKm: number | null;
  yearBuiltTolerance: number | null;
  sortKey: string;
  sortDirection: "asc" | "desc";
  page: number;
  pageSize: 5 | 10 | 25 | 50;
}

export interface AppSessionState<TSubject = unknown, TAnalysis = unknown> {
  schemaVersion: typeof APP_SESSION_SCHEMA_VERSION;
  savedAt: string;
  stepOneQuery: string;
  screen: "step_one" | "subject_review" | "analysis";
  subjectPayload: TSubject | null;
  corrections: SubjectCorrection[];
  valueEvidence: SubjectValueEvidence | null;
  analysisPayload: TAnalysis | null;
  analysisRevision: number;
  table: ComparableTableState;
  selectedComparablePins: string[];
  savingsMethods: SavingsMethod[];
  packetEvidenceTypes: EvidenceType[];
}

export function serializeSessionState<TSubject, TAnalysis>(
  state: Omit<AppSessionState<TSubject, TAnalysis>, "schemaVersion" | "savedAt">,
  savedAt = new Date().toISOString(),
): string {
  return JSON.stringify({
    ...state,
    schemaVersion: APP_SESSION_SCHEMA_VERSION,
    savedAt,
  } satisfies AppSessionState<TSubject, TAnalysis>);
}

export function parseSessionState<TSubject, TAnalysis>(
  value: string | null,
): AppSessionState<TSubject, TAnalysis> | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as Partial<AppSessionState<TSubject, TAnalysis>>;
    if (
      parsed.schemaVersion !== APP_SESSION_SCHEMA_VERSION ||
      typeof parsed.savedAt !== "string" ||
      typeof parsed.stepOneQuery !== "string" ||
      !["step_one", "subject_review", "analysis"].includes(String(parsed.screen)) ||
      !parsed.table ||
      !Array.isArray(parsed.corrections) ||
      !Array.isArray(parsed.selectedComparablePins) ||
      !Array.isArray(parsed.savingsMethods) ||
      !Array.isArray(parsed.packetEvidenceTypes)
    ) {
      return null;
    }
    return parsed as AppSessionState<TSubject, TAnalysis>;
  } catch {
    return null;
  }
}

export function saveSessionState<TSubject, TAnalysis>(
  storage: Pick<Storage, "setItem">,
  state: Omit<AppSessionState<TSubject, TAnalysis>, "schemaVersion" | "savedAt">,
): boolean {
  try {
    storage.setItem(APP_SESSION_KEY, serializeSessionState(state));
    return true;
  } catch {
    return false;
  }
}

export function loadSessionState<TSubject, TAnalysis>(
  storage: Pick<Storage, "getItem">,
): AppSessionState<TSubject, TAnalysis> | null {
  try {
    return parseSessionState<TSubject, TAnalysis>(storage.getItem(APP_SESSION_KEY));
  } catch {
    return null;
  }
}

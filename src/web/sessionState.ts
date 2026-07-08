export const ASSESSMENT_SNAPSHOT_KEY = "appealcompass:lastAssessment";

export interface AssessmentSnapshot<T> {
  query: URLSearchParams;
  payload: T;
  savedAt: string;
}

interface StoredAssessmentSnapshot<T> {
  queryString: string;
  payload: T;
  savedAt: string;
}

export function serializeAssessmentSnapshot<T>(
  query: URLSearchParams,
  payload: T,
  savedAt = new Date().toISOString(),
): string {
  return JSON.stringify({
    queryString: query.toString(),
    payload,
    savedAt,
  } satisfies StoredAssessmentSnapshot<T>);
}

export function parseAssessmentSnapshot<T>(value: string | null): AssessmentSnapshot<T> | null {
  if (!value) {
    return null;
  }
  try {
    const parsed = JSON.parse(value) as Partial<StoredAssessmentSnapshot<T>>;
    if (
      !parsed ||
      typeof parsed !== "object" ||
      typeof parsed.queryString !== "string" ||
      typeof parsed.savedAt !== "string" ||
      !("payload" in parsed)
    ) {
      return null;
    }
    return {
      query: new URLSearchParams(parsed.queryString),
      payload: parsed.payload as T,
      savedAt: parsed.savedAt,
    };
  } catch {
    return null;
  }
}

export function saveAssessmentSnapshot<T>(
  storage: Pick<Storage, "setItem">,
  query: URLSearchParams,
  payload: T,
): boolean {
  try {
    storage.setItem(ASSESSMENT_SNAPSHOT_KEY, serializeAssessmentSnapshot(query, payload));
    return true;
  } catch {
    return false;
  }
}

export function loadAssessmentSnapshot<T>(
  storage: Pick<Storage, "getItem">,
): AssessmentSnapshot<T> | null {
  try {
    return parseAssessmentSnapshot<T>(storage.getItem(ASSESSMENT_SNAPSHOT_KEY));
  } catch {
    return null;
  }
}

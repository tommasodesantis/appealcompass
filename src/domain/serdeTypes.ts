export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };

export type {
  AssessmentHistoryRow,
  Comparable,
  Parcel,
  PropertyCardDetail,
  Sale,
  SubjectRecord,
} from "./models";

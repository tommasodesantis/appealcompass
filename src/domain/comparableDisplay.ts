import type { Comparable } from "./models";

export function assessmentTypeLabel(profileKey: string): "Total AV" | "Improvement AV" {
  return profileKey === "assessor" ? "Total AV" : "Improvement AV";
}

export function assessmentValueForProfile(
  profileKey: string,
  comparable: Pick<Comparable, "av" | "improvementAv">,
): number | null {
  return profileKey === "assessor" ? comparable.av : comparable.improvementAv;
}

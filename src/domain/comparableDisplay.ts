import type { Comparable } from "./models";

export function assessmentTypeLabel(profileKey: string): "Improvement AV" {
  void profileKey;
  return "Improvement AV";
}

export function assessmentValueForProfile(
  profileKey: string,
  comparable: Pick<Comparable, "av" | "improvementAv">,
): number | null {
  void profileKey;
  return comparable.improvementAv;
}

import type { AssessmentStage, AssessmentStages } from "./models";

export function assessmentStageLabel(stage: AssessmentStage): string {
  switch (stage) {
    case "board":
      return "Board of Review";
    case "certified":
      return "Assessor certified";
    case "mailed":
      return "Assessor mailed";
    default:
      return "stage unavailable";
  }
}

export function assessmentStagesLabel(stages: AssessmentStages): string {
  const unique = [...new Set([stages.total, stages.improvement, stages.land].filter(Boolean))];
  if (unique.length === 0) {
    return "assessment stage unavailable";
  }
  return unique.map((stage) => assessmentStageLabel(stage)).join(" / ");
}

import {
  BOR_CALENDAR,
  BOR_DATES_PDF_URL,
  CCAO_CALENDAR,
  CCAO_OFFICIAL_URL,
  type FilingWindow,
  PTAB_OFFICIAL_URL,
  type WindowStatus,
  borWindowsForTownship,
  canonicalTownship,
  ccaoWindowsForTownship,
  stalenessWarning,
  windowStatusOn,
} from "./config";
import { addDays, daysBetween } from "./dateUtils";
import type { RouteResult, Venue } from "./models";

export interface AppealStatusInput {
  assessorAppealFiled: boolean;
  assessorDecisionReceived: boolean | null;
  borAppealFiled: boolean;
  borDecisionReceived: boolean | null;
  borDecisionDate: string | null;
}

const DEFAULT_APPEAL_STATUS: AppealStatusInput = {
  assessorAppealFiled: false,
  assessorDecisionReceived: null,
  borAppealFiled: false,
  borDecisionReceived: null,
  borDecisionDate: null,
};

const CERTIFICATE_OF_ERROR_EXPLANATION =
  "A Certificate of Error is a Cook County process to fix past-year mistakes - like a missed exemption or wrong property facts - which can lead to a refund. Ask the Assessor's office about it.";

function firstOpenOrUpcoming(
  windows: FilingWindow[],
  today: string,
): { status: WindowStatus | null; deadline: string | null; days: number | null } {
  for (const window of windows) {
    const { status, days } = windowStatusOn(window, today);
    if (status === "open") {
      return { status: "open", deadline: window.closes, days };
    }
  }

  const upcoming = windows
    .map((window) => ({ window, status: windowStatusOn(window, today) }))
    .filter((item) => item.status.status === "upcoming")
    .sort((a, b) => a.window.opens.localeCompare(b.window.opens));

  const next = upcoming[0];
  if (next) {
    return {
      status: "upcoming",
      deadline: next.window.opens,
      days: next.status.days,
    };
  }

  return { status: null, deadline: null, days: null };
}

function selectedWindowStatus(
  windows: FilingWindow[],
  today: string,
): {
  status: WindowStatus;
  deadline: string | null;
  days: number | null;
  window: FilingWindow | null;
} {
  const actionable = firstOpenOrUpcoming(windows, today);
  if (actionable.status) {
    const window =
      windows.find((item) =>
        actionable.status === "open"
          ? item.closes === actionable.deadline
          : item.opens === actionable.deadline,
      ) ?? null;
    return { ...actionable, status: actionable.status, window };
  }
  const latestClosed = [...windows]
    .filter((window) => windowStatusOn(window, today).status === "closed")
    .sort((a, b) => b.closes.localeCompare(a.closes))[0];
  if (latestClosed) {
    return {
      status: "closed",
      deadline: latestClosed.closes,
      days: daysBetween(today, latestClosed.closes),
      window: latestClosed,
    };
  }
  return { status: "closed", deadline: null, days: null, window: null };
}

export function routeCase(
  townshipName: string,
  today: string,
  requestedVenue: Venue,
  borDecisionDate: string | null = null,
  appealStatus: AppealStatusInput = DEFAULT_APPEAL_STATUS,
): RouteResult {
  const township = canonicalTownship(townshipName);
  const warnings = (
    requestedVenue === "assessor"
      ? [stalenessWarning(CCAO_CALENDAR, today)]
      : requestedVenue === "bor"
        ? [stalenessWarning(BOR_CALENDAR, today)]
        : []
  ).filter((warning): warning is string => Boolean(warning));
  const status = { ...DEFAULT_APPEAL_STATUS, ...appealStatus };
  const suppliedBorDecisionDate = status.borDecisionDate ?? borDecisionDate;

  function ptabNeedsInput(): RouteResult {
    return {
      venue: "ptab",
      headline: "PTAB deadline cannot be computed without your BOR decision date.",
      reasoning: [
        "PTAB is only available after a BOR decision for the same tax year.",
        "The 30-day deadline is jurisdictional, so this tool refuses to guess.",
        "Answer the Step 1 BOR-decision question and enter the BOR decision date if you have the decision notice.",
      ],
      actionStatus: "needs_input",
      deadline: null,
      daysRemaining: null,
      warnings,
      officialUrl: PTAB_OFFICIAL_URL,
    };
  }

  function ptabFromDecisionDate(decisionDate: string): RouteResult {
    const deadline = addDays(decisionDate, 30);
    const daysRemaining = daysBetween(today, deadline);
    if (daysRemaining >= 0) {
      return {
        venue: "ptab",
        headline: `PTAB is actionable now. File by ${deadline}.`,
        reasoning: [
          "You supplied a BOR decision date, so the PTAB 30-day clock controls.",
          "PTAB requires a prior BOR appeal for the year under appeal.",
          "Taxes must be paid while PTAB is pending; success can result in a refund.",
        ],
        actionStatus: daysRemaining <= 7 ? "urgent" : "open",
        deadline,
        daysRemaining,
        warnings,
        officialUrl: PTAB_OFFICIAL_URL,
      };
    }
    return {
      venue: "ptab",
      headline: `PTAB 30-day window appears expired. Deadline was ${deadline}.`,
      reasoning: [
        "The deadline was computed only from the BOR decision date you supplied.",
        "Verify immediately with PTAB if you believe a different notice date applies.",
      ],
      actionStatus: "expired",
      deadline,
      daysRemaining,
      warnings,
      officialUrl: PTAB_OFFICIAL_URL,
    };
  }

  function routeAssessor(): RouteResult {
    const assessor = selectedWindowStatus(ccaoWindowsForTownship(township), today);
    return {
      venue: "assessor",
      headline:
        assessor.status === "open"
          ? "Assessor filing window is open now."
          : assessor.status === "upcoming"
            ? "Assessor window is upcoming; prepare now."
            : "Assessor window is not currently configured as open.",
      reasoning: [
        "You selected the Cook County Assessor, the first-level appeal venue.",
        `Township matched to Assessor calendar as ${township}.`,
        assessor.status === "closed"
          ? "No configured Assessor filing window is currently open or upcoming for this township; prepare evidence and verify the next filing period at the official source."
          : "File by the township close date shown by the official Assessor calendar.",
        `Property-description errors start with the Assessor. ${CERTIFICATE_OF_ERROR_EXPLANATION}`,
      ],
      actionStatus: assessor.status,
      deadline: assessor.deadline,
      daysRemaining: assessor.days,
      warnings,
      officialUrl: CCAO_OFFICIAL_URL,
    };
  }

  function routeBor(): RouteResult {
    const bor = selectedWindowStatus(borWindowsForTownship(township), today);
    const evidenceText = bor.window?.evidenceDeadline
      ? ` Evidence deadline: ${bor.window.evidenceDeadline}.`
      : "";
    return {
      venue: "bor",
      headline:
        bor.status === "open"
          ? "BOR filing window is open now."
          : bor.status === "upcoming"
            ? "BOR window is upcoming; prepare now."
            : "BOR window is not currently open.",
      reasoning: [
        "You selected the Cook County Board of Review, the second-level Cook County appeal venue.",
        `Township matched to BOR calendar as ${township}.`,
        bor.status === "closed"
          ? "No configured BOR filing window is currently open or upcoming for this township; prepare evidence and verify the next filing period at the official source."
          : `File by the township close date and submit evidence by the evidence deadline.${evidenceText}`,
      ],
      actionStatus: bor.status,
      deadline: bor.deadline,
      daysRemaining: bor.days,
      warnings,
      officialUrl: BOR_DATES_PDF_URL,
    };
  }

  if (requestedVenue === "ptab") {
    if (status.borAppealFiled && status.borDecisionReceived === false) {
      return {
        venue: "ptab",
        headline: "Wait for the BOR decision before starting PTAB.",
        reasoning: [
          "You selected PTAB and reported that a BOR appeal has already been filed for this year.",
          "PTAB becomes available only after the BOR issues its written decision.",
          "Keep preparing evidence and enter the BOR decision date when the notice arrives.",
        ],
        actionStatus: "upcoming",
        deadline: null,
        daysRemaining: null,
        warnings,
        officialUrl: PTAB_OFFICIAL_URL,
      };
    }
    if (status.borDecisionReceived === true) {
      return suppliedBorDecisionDate
        ? ptabFromDecisionDate(suppliedBorDecisionDate)
        : ptabNeedsInput();
    }
    return suppliedBorDecisionDate
      ? ptabFromDecisionDate(suppliedBorDecisionDate)
      : ptabNeedsInput();
  }

  return requestedVenue === "assessor" ? routeAssessor() : routeBor();
}

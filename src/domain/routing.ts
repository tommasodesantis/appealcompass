import {
  BOR_CALENDAR,
  BOR_DATES_URL,
  CCAO_CALENDAR,
  CCAO_OFFICIAL_URL,
  type FilingWindow,
  ILLINOIS_STATE_HOLIDAYS,
  PTAB_OFFICIAL_URL,
  type WindowStatus,
  canonicalTownship,
  ccaoWindowsForTownship,
  stalenessWarning,
  windowStatusOn,
} from "./config";
import { addDays, daysBetween, nextBusinessDay } from "./dateUtils";
import type { DeadlineItem, RouteResult, Venue } from "./models";

export interface AppealStatusInput {
  borNoticeReceived?: boolean | null;
  borNoticeDate?: string | null;
}

const DEFAULT_APPEAL_STATUS: AppealStatusInput = {
  borNoticeReceived: null,
  borNoticeDate: null,
};

const CERTIFICATE_OF_ERROR_EXPLANATION =
  "A Certificate of Error is a Cook County process to fix past-year mistakes, such as a missed exemption or incorrect property facts, which can lead to a refund. Ask the Assessor's office about it.";

interface SelectedWindow {
  status: WindowStatus | "not_published";
  deadline: string | null;
  days: number | null;
  window: FilingWindow | null;
}

function selectedWindowStatus(windows: FilingWindow[], today: string): SelectedWindow {
  if (windows.length === 0) {
    return { status: "not_published", deadline: null, days: null, window: null };
  }

  const open = windows.find((window) => windowStatusOn(window, today).status === "open");
  if (open) {
    return {
      status: "open",
      deadline: open.closes,
      days: daysBetween(today, open.closes),
      window: open,
    };
  }

  const upcoming = [...windows]
    .filter((window) => windowStatusOn(window, today).status === "upcoming")
    .sort((a, b) => a.opens.localeCompare(b.opens))[0];
  if (upcoming) {
    return {
      status: "upcoming",
      deadline: upcoming.opens,
      days: daysBetween(today, upcoming.opens),
      window: upcoming,
    };
  }

  const latestClosed = [...windows].sort((a, b) => b.closes.localeCompare(a.closes))[0];
  if (!latestClosed) {
    return { status: "not_published", deadline: null, days: null, window: null };
  }
  return {
    status: "closed",
    deadline: latestClosed.closes,
    days: daysBetween(today, latestClosed.closes),
    window: latestClosed,
  };
}

function windowDeadlines(window: FilingWindow | null, today: string): DeadlineItem[] {
  if (!window) {
    return [];
  }
  const deadlines: DeadlineItem[] = [
    {
      kind: "opens",
      label: "Filing opens",
      date: window.opens,
      daysRemaining: daysBetween(today, window.opens),
    },
    {
      kind: "filing",
      label: "Filing closes",
      date: window.closes,
      daysRemaining: daysBetween(today, window.closes),
    },
  ];
  if (window.evidenceDeadline) {
    deadlines.push({
      kind: "evidence",
      label: "Evidence due",
      date: window.evidenceDeadline,
      daysRemaining: daysBetween(today, window.evidenceDeadline),
    });
  }
  return deadlines;
}

function ptabNeedsNoticeDate(warnings: string[]): RouteResult {
  return {
    venue: "ptab",
    headline: "Enter the date on your written BOR decision notice.",
    reasoning: [
      "PTAB is available only after a Board of Review decision for the same tax year.",
      "The filing period is generally 30 days, so Appeal Compass will not guess the notice date.",
    ],
    actionStatus: "needs_input",
    deadline: null,
    daysRemaining: null,
    deadlineState: "awaiting_notice",
    deadlineLabel: "BOR notice date needed",
    deadlines: [],
    warnings,
    officialUrl: PTAB_OFFICIAL_URL,
  };
}

function ptabAwaitingNotice(warnings: string[]): RouteResult {
  return {
    venue: "ptab",
    headline: "Wait for the written BOR decision notice before filing with PTAB.",
    reasoning: [
      "PTAB is available only after the Board of Review issues its written decision.",
      "Keep preparing your evidence. Return when the notice arrives and enter the notice date.",
    ],
    actionStatus: "upcoming",
    deadline: null,
    daysRemaining: null,
    deadlineState: "awaiting_notice",
    deadlineLabel: "Waiting for BOR written notice",
    deadlines: [],
    warnings,
    officialUrl: PTAB_OFFICIAL_URL,
  };
}

function ptabFromNoticeDate(noticeDate: string, today: string, warnings: string[]): RouteResult {
  const thirtiethDay = addDays(noticeDate, 30);
  const deadline = nextBusinessDay(thirtiethDay, ILLINOIS_STATE_HOLIDAYS);
  const daysRemaining = daysBetween(today, deadline);
  const shifted = deadline !== thirtiethDay;
  const deadlineRule = shifted
    ? `The 30th day was ${thirtiethDay}; because it fell on a weekend or Illinois legal holiday, the date moves to ${deadline}.`
    : "The date shown is 30 days after the written-notice date you entered.";
  const reasoning = [
    deadlineRule,
    "The calculation excludes the notice date and includes the last day, consistent with PTAB's procedural rule.",
    "For Cook County, a later statutory date tied to the township's final-action transmission may apply. Appeal Compass cannot observe that transmission, so treat this as a conservative notice-based date and verify with PTAB.",
    "Taxes must still be paid while a PTAB appeal is pending.",
  ];
  const deadlineItem: DeadlineItem = {
    kind: "ptab",
    label: "Conservative PTAB filing date",
    date: deadline,
    daysRemaining,
  };

  if (daysRemaining < 0) {
    return {
      venue: "ptab",
      headline: "The notice-based PTAB filing date appears to have passed.",
      reasoning,
      actionStatus: "expired",
      deadline,
      daysRemaining,
      deadlineState: "expired",
      deadlineLabel: "Notice-based PTAB date passed",
      deadlines: [deadlineItem],
      warnings,
      officialUrl: PTAB_OFFICIAL_URL,
    };
  }

  return {
    venue: "ptab",
    headline: "Prepare to file with PTAB by the conservative notice-based deadline.",
    reasoning,
    actionStatus: daysRemaining <= 7 ? "urgent" : "open",
    deadline,
    daysRemaining,
    deadlineState: "published",
    deadlineLabel: "Conservative PTAB filing date",
    deadlines: [deadlineItem],
    warnings,
    officialUrl: PTAB_OFFICIAL_URL,
  };
}

export function routeCase(
  townshipName: string,
  today: string,
  requestedVenue: Venue,
  appealStatus: AppealStatusInput = DEFAULT_APPEAL_STATUS,
): RouteResult {
  const township = canonicalTownship(townshipName);
  const status = { ...DEFAULT_APPEAL_STATUS, ...appealStatus };
  const warnings = (
    requestedVenue === "assessor" ? [stalenessWarning(CCAO_CALENDAR, today)] : []
  ).filter((warning): warning is string => Boolean(warning));

  if (requestedVenue === "ptab") {
    const noticeReceived = status.borNoticeReceived;
    const noticeDate = status.borNoticeDate;
    if (noticeReceived === false) {
      return ptabAwaitingNotice(warnings);
    }
    if (!noticeDate) {
      return ptabNeedsNoticeDate(warnings);
    }
    return ptabFromNoticeDate(noticeDate, today, warnings);
  }

  if (requestedVenue === "bor") {
    return {
      venue: "bor",
      headline: "Tax Year 2026 BOR township filing dates have not been published yet.",
      reasoning: [
        "The official Board of Review dates page currently lists the prior Tax Year 2025 schedule, so Appeal Compass does not reuse those expired dates for 2026.",
        `Your township is ${township}. Check the official dates page for its 2026 filing window and preregister in the BOR portal if appropriate.`,
        "BOR filing and evidence deadlines can be different. Review both dates when the schedule is released.",
      ],
      actionStatus: "upcoming",
      deadline: null,
      daysRemaining: null,
      deadlineState: "not_published",
      deadlineLabel: "2026 BOR dates not published yet",
      deadlines: [],
      warnings: BOR_CALENDAR.published ? warnings : [],
      officialUrl: BOR_DATES_URL,
    };
  }

  const assessor = selectedWindowStatus(ccaoWindowsForTownship(township), today);
  if (assessor.status === "not_published") {
    return {
      venue: "assessor",
      headline: `${township} Assessor filing dates have not been published yet.`,
      reasoning: [
        "You selected the Cook County Assessor, the first-level appeal venue.",
        "The official 2026 calendar does not yet list an opening and closing date for this township.",
        `Monitor the official Assessor calendar. ${CERTIFICATE_OF_ERROR_EXPLANATION}`,
      ],
      actionStatus: "upcoming",
      deadline: null,
      daysRemaining: null,
      deadlineState: "not_published",
      deadlineLabel: "Township dates not published yet",
      deadlines: [],
      warnings,
      officialUrl: CCAO_OFFICIAL_URL,
    };
  }

  const isClosed = assessor.status === "closed";
  return {
    venue: "assessor",
    headline:
      assessor.status === "open"
        ? "Assessor filing window is open now."
        : assessor.status === "upcoming"
          ? "Assessor filing window is upcoming; prepare now."
          : "This township's 2026 Assessor filing window has closed.",
    reasoning: [
      "You selected the Cook County Assessor, the first-level appeal venue.",
      `Township matched to the official Assessor calendar as ${township}.`,
      isClosed
        ? "Verify the official calendar and consider the next available appeal venue."
        : "Use the closing date below as the filing deadline and verify it before filing.",
      `Property-description errors start with the Assessor. ${CERTIFICATE_OF_ERROR_EXPLANATION}`,
    ],
    actionStatus: assessor.status,
    deadline: assessor.deadline,
    daysRemaining: assessor.days,
    deadlineState: isClosed ? "expired" : "published",
    deadlineLabel:
      assessor.status === "upcoming"
        ? "Filing opens"
        : isClosed
          ? "Filing window closed"
          : "Filing closes",
    deadlines: windowDeadlines(assessor.window, today),
    warnings,
    officialUrl: CCAO_OFFICIAL_URL,
  };
}

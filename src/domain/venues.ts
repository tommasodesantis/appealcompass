import {
  ASSESSMENT_YEAR,
  BOR_DATES_URL,
  BOR_OFFICIAL_URL,
  BOR_PORTAL_URL,
  BOR_PROPERTY_OWNER_GUIDE_URL,
  BOR_RULES_URL,
  CCAO_APPEALS_URL,
  CCAO_OFFICIAL_URL,
  PTAB_EFILE_URL,
  PTAB_OFFICIAL_URL,
  PTAB_RESIDENTIAL_APPEAL_FORM_URL,
} from "./config";
import { isWithinYearsOf } from "./math";
import type {
  CaseFile,
  EvidenceSummary,
  PacketSection,
  ResolvedVenue,
  RouteResult,
} from "./models";

const OTHER_POSSIBLE_FACTORS =
  "Other possible reduction factors can include documented condition issues, vacancy, demolition, incorrect property characteristics, recent sale/appraisal evidence, and other factual errors.";
const CERTIFICATE_OF_ERROR_EXPLANATION =
  "A Certificate of Error is a Cook County process to fix past-year mistakes - like a missed exemption or wrong property facts - which can lead to a refund. Ask the Assessor's office about it.";
const EXEMPTION_FACTORS =
  "Exemptions may also reduce taxes for qualifying homeowners, including owner-occupants, seniors, veterans, people with disabilities, returning veterans, home-improvement cases, and some long-time occupants; verify eligibility with the official venue.";

export interface VenueAdapter {
  venueKey: ResolvedVenue;
  venueName: string;
  officialUrl: string;
  submissionUrl: string;
  rulesUrl: string;
  checklist(caseFile: CaseFile): string[];
  sections(caseFile: CaseFile, evidence: EvidenceSummary, route: RouteResult): PacketSection[];
}

class AssessorAdapter implements VenueAdapter {
  venueKey = "assessor" as const;
  venueName = "Cook County Assessor Appeal";
  officialUrl = CCAO_OFFICIAL_URL;
  submissionUrl = CCAO_APPEALS_URL;
  rulesUrl = CCAO_APPEALS_URL;

  checklist(caseFile: CaseFile): string[] {
    const items = [
      "Download the Appeal Compass PDF summary and use it only after double-checking every finding.",
      `Submit the PDF with the other required Assessor appeal documents listed at ${this.submissionUrl}.`,
      "This evidence can support an appeal, but it does not guarantee success.",
      OTHER_POSSIBLE_FACTORS,
      EXEMPTION_FACTORS,
    ];
    if (caseFile.userEvidence.actualSqft) {
      items.push(
        "Property-description correction: attach proof of actual square footage (appraisal, plans, survey, or other reliable documentation).",
      );
    }
    return items;
  }

  sections(caseFile: CaseFile, _evidence: EvidenceSummary, route: RouteResult): PacketSection[] {
    const timingLine =
      route.deadlineState === "not_published"
        ? "The township's 2026 filing dates are not published yet; monitor the official Assessor calendar."
        : "Use this first-level appeal while the township window is open.";
    const sections: PacketSection[] = [
      {
        title: "Assessor Filing Instructions",
        lines: [
          "Recommended venue: Cook County Assessor.",
          timingLine,
          "Property-description errors are strongest here when documented.",
          `Official source: ${this.officialUrl}`,
        ],
      },
      { title: "What's Next?", lines: this.checklist(caseFile) },
    ];
    if (route.actionStatus === "closed") {
      sections.push({
        title: "Closed-Window Preparation",
        lines: [
          "The selected Assessor window is not currently open in the configured calendar.",
          "Use this packet to prepare evidence for the next Assessor session, but verify current dates at the official source before filing.",
          CERTIFICATE_OF_ERROR_EXPLANATION,
        ],
      });
    }
    return sections;
  }
}

class BoardOfReviewAdapter implements VenueAdapter {
  venueKey = "bor" as const;
  venueName = "Cook County Board of Review Appeal";
  officialUrl = BOR_OFFICIAL_URL;
  submissionUrl = BOR_PROPERTY_OWNER_GUIDE_URL;
  rulesUrl = BOR_RULES_URL;

  checklist(caseFile: CaseFile): string[] {
    const items = [
      "Download the Appeal Compass PDF summary and use it only after double-checking every finding.",
      `Submit the PDF with the other required BOR appeal documents through the BOR portal: ${BOR_PORTAL_URL}`,
      `Review the BOR property-owner guide and official rules before filing: ${this.submissionUrl} and ${this.rulesUrl}`,
      "This evidence can support an appeal, but it does not guarantee success.",
      OTHER_POSSIBLE_FACTORS,
      EXEMPTION_FACTORS,
    ];
    const purchaseDate = caseFile.userEvidence.purchaseDate;
    if (purchaseDate && isWithinYearsOf(purchaseDate, `${ASSESSMENT_YEAR}-01-01`, 3)) {
      items.push(
        "[Rule 18] Purchase within three years of lien date: disclose price/date and attach closing statement, deed, or MyDec.",
      );
    }
    if (caseFile.userEvidence.appraisalValue) {
      items.push("[Rule 19] Appraisal evidence must include required property photos and PINs.");
    }
    return items;
  }

  sections(caseFile: CaseFile, _evidence: EvidenceSummary, route: RouteResult): PacketSection[] {
    const timingLine =
      route.deadlineState === "not_published"
        ? "Tax Year 2026 township filing and evidence dates are not published yet; monitor the official dates page and preregister in the BOR portal if appropriate."
        : "Use the close date and evidence deadline shown in the routing section.";
    const sections: PacketSection[] = [
      {
        title: "BOR Filing Instructions",
        lines: [
          "Recommended venue: Cook County Board of Review.",
          "This is the second-level Cook County appeal forum.",
          timingLine,
          `Official dates source: ${BOR_DATES_URL}`,
        ],
      },
      { title: "What's Next?", lines: this.checklist(caseFile) },
    ];
    if (route.deadlineState === "not_published") {
      sections.push({
        title: "Schedule-Pending Preparation",
        lines: [
          "The official BOR page still lists the prior Tax Year 2025 schedule, not Tax Year 2026 dates.",
          "Prepare evidence now, but do not use the expired 2025 dates as current filing deadlines.",
          "If you later receive a BOR decision and want PTAB screening, choose PTAB and enter the date on the written decision notice.",
        ],
      });
    } else if (route.actionStatus === "closed") {
      sections.push({
        title: "Closed-Window Preparation",
        lines: [
          "The selected BOR window is not currently open in the configured calendar.",
          "Use this packet to prepare evidence for the next BOR session, but verify current dates at the official source before filing.",
          "If you later receive a BOR decision and want PTAB screening, choose PTAB and enter the date on the written decision notice.",
        ],
      });
    }
    return sections;
  }
}

class PtabAdapter implements VenueAdapter {
  venueKey = "ptab" as const;
  venueName = "Illinois Property Tax Appeal Board Appeal";
  officialUrl = PTAB_OFFICIAL_URL;
  submissionUrl = PTAB_RESIDENTIAL_APPEAL_FORM_URL;
  rulesUrl = PTAB_OFFICIAL_URL;

  checklist(): string[] {
    return [
      "Download the Appeal Compass PDF summary and use it only after double-checking every finding.",
      `Submit the PDF with the required PTAB residential appeal documents listed at ${this.submissionUrl}.`,
      "Attach the BOR written decision notice and verify the PTAB deadline before filing.",
      "This evidence can support an appeal, but it does not guarantee success.",
      OTHER_POSSIBLE_FACTORS,
      EXEMPTION_FACTORS,
      `PTAB e-filing/source: ${PTAB_EFILE_URL}`,
    ];
  }

  sections(_caseFile: CaseFile, _evidence: EvidenceSummary, route: RouteResult): PacketSection[] {
    return [
      {
        title: "PTAB Filing Instructions",
        lines: [
          "Recommended venue: Illinois Property Tax Appeal Board.",
          "PTAB is available only after a BOR decision for the same tax year.",
          route.deadline
            ? "The displayed date is a conservative notice-based date; a later Cook County township-transmission date may control."
            : "A filing date cannot be shown until the written BOR notice arrives and its date is entered.",
          `Official source: ${this.officialUrl}`,
        ],
      },
      { title: "What's Next?", lines: this.checklist() },
      {
        title: "PTAB Comparable Grid Public-Data Limits",
        lines: [
          "Public data may populate PIN, class, building sqft, year built, neighborhood, coordinates, land sqft, style, and assessment metrics when those fields are available.",
          "Not available from public data - supply from your property record card: property record cards or listing sheets for the subject and comparables.",
          "Not available from public data - supply from your property record card: verified condition, room-by-room details, photos, and any PTAB grid field not shown in this packet.",
          "Do not file the PTAB grid as complete unless you have supplied and checked the missing property-record-card fields yourself.",
        ],
      },
    ];
  }
}

class ClosedSessionAdapter implements VenueAdapter {
  venueKey = "closed" as const;
  venueName = "Cook County Appeal Preparation Packet";
  officialUrl = CCAO_OFFICIAL_URL;
  submissionUrl = CCAO_APPEALS_URL;
  rulesUrl = CCAO_APPEALS_URL;

  checklist(): string[] {
    return [
      "Download the Appeal Compass PDF summary and use it only after double-checking every finding.",
      `Verify the correct active venue and required submission documents at ${this.submissionUrl}.`,
      "This evidence can support a future appeal, but it does not guarantee success.",
      OTHER_POSSIBLE_FACTORS,
      EXEMPTION_FACTORS,
      CERTIFICATE_OF_ERROR_EXPLANATION,
    ];
  }

  sections(): PacketSection[] {
    return [
      {
        title: "Closed-Window Preparation Instructions",
        lines: [
          "No configured current-year CCAO or BOR filing window is actionable.",
          `Use this for preparation and PTAB screening. ${CERTIFICATE_OF_ERROR_EXPLANATION}`,
          "Do not file this as a BOR packet unless BOR shows a valid window.",
          `Official source: ${this.officialUrl}`,
        ],
      },
      { title: "What's Next?", lines: this.checklist() },
    ];
  }
}

export function adapterForVenue(venue: ResolvedVenue): VenueAdapter {
  if (venue === "assessor") {
    return new AssessorAdapter();
  }
  if (venue === "ptab") {
    return new PtabAdapter();
  }
  if (venue === "closed") {
    return new ClosedSessionAdapter();
  }
  return new BoardOfReviewAdapter();
}

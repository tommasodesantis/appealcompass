from __future__ import annotations

from dataclasses import dataclass
from datetime import date, datetime
from typing import Literal

ASSESSMENT_YEAR = 2026
STATE_EQUALIZER = 3.0163
DEFAULT_TAX_RATE = 0.10
ASSESSMENT_LEVEL = 0.10

CCAO_OFFICIAL_URL = "https://www.cookcountyassessoril.gov/assessment-calendar-and-deadlines"
BOR_OFFICIAL_URL = "https://www.cookcountyboardofreview.com/"
BOR_PORTAL_URL = "https://appeals.cookcountyboardofreview.com/"
BOR_DATES_PDF_URL = (
    "https://www.cookcountyboardofreview.com/sites/g/files/ywwepo261/files/document/"
    "file/2025-07/2025TOWNSHIPOPEN-CLOSE.pdf"
)
PTAB_OFFICIAL_URL = "https://ptab.illinois.gov/"
PTAB_EFILE_URL = "https://ptab.illinois.gov/"

NOT_LEGAL_ADVICE = (
    "NOT LEGAL ADVICE. This tool is for pro se individual residential filers. "
    "Entities such as LLCs, corporations, and condo associations generally require an attorney."
)


@dataclass(frozen=True)
class FilingWindow:
    opens: date
    closes: date
    evidence_deadline: date | None = None

    def status_on(self, today: date) -> tuple[Literal["upcoming", "open", "closed"], int | None]:
        if today < self.opens:
            return "upcoming", (self.opens - today).days
        if today <= self.closes:
            return "open", (self.closes - today).days
        return "closed", None


@dataclass(frozen=True)
class CalendarConfig:
    venue_label: str
    session_label: str
    session_end: date
    source_url: str
    source_note: str

    def staleness_warning(self, today: date) -> str | None:
        if today > self.session_end:
            return (
                f"{self.venue_label} configured calendar is past its session end "
                f"({self.session_end.isoformat()}). Verify current deadlines at {self.source_url}."
            )
        return None


@dataclass(frozen=True)
class BorGroup:
    townships: tuple[str, ...]
    windows: tuple[FilingWindow, ...]


def d(value: str) -> date:
    return datetime.strptime(value, "%m/%d/%Y").date()


CCAO_CALENDAR = CalendarConfig(
    venue_label="Cook County Assessor",
    session_label="Tax Year 2026 Assessor Appeal Windows",
    session_end=d("8/12/2026"),
    source_url=CCAO_OFFICIAL_URL,
    source_note=(
        "Manual authority file 'Assessment & Appeal Calendar _ Cook County Assessor's "
        "Office.pdf' extracted on 2026-07-06 from the official Assessor calendar page, "
        "which reported Last updated: 6/29/26. Direct shell automation still returned "
        "CloudFront 403, so manually verify at the official source before filing."
    ),
)

# The authority file contains every Cook County township row. Blank future rows are retained as
# empty lists so known townships remain explicit without fabricating unavailable dates.
CCAO_WINDOWS: dict[str, list[FilingWindow]] = {
    "Barrington": [],
    "Berwyn": [FilingWindow(d("5/20/2026"), d("7/6/2026"))],
    "Bloom": [],
    "Bremen": [],
    "Calumet": [],
    "Cicero": [FilingWindow(d("6/17/2026"), d("7/31/2026"))],
    "Elk Grove": [FilingWindow(d("6/22/2026"), d("8/4/2026"))],
    "Evanston": [FilingWindow(d("4/22/2026"), d("6/4/2026"))],
    "Hanover": [],
    "Hyde Park": [],
    "Jefferson": [],
    "Lake": [],
    "Lakeview": [FilingWindow(d("5/28/2026"), d("7/13/2026"))],
    "Lemont": [],
    "Leyden": [],
    "Lyons": [],
    "Maine": [FilingWindow(d("6/5/2026"), d("7/21/2026"))],
    "New Trier": [FilingWindow(d("5/7/2026"), d("6/22/2026"))],
    "Niles": [],
    "North Chicago": [],
    "Northfield": [],
    "Norwood Park": [FilingWindow(d("4/13/2026"), d("5/26/2026"))],
    "Oak Park": [FilingWindow(d("5/6/2026"), d("6/18/2026"))],
    "Orland": [],
    "Palatine": [],
    "Palos": [FilingWindow(d("6/3/2026"), d("7/17/2026"))],
    "Proviso": [],
    "Rich": [],
    "River Forest": [FilingWindow(d("4/20/2026"), d("6/2/2026"))],
    "Riverside": [FilingWindow(d("4/24/2026"), d("6/8/2026"))],
    "Rogers Park": [FilingWindow(d("4/17/2026"), d("6/1/2026"))],
    "Schaumburg": [],
    "South Chicago": [],
    "Stickney": [FilingWindow(d("6/29/2026"), d("8/12/2026"))],
    "Thornton": [],
    "West Chicago": [],
    "Wheeling": [],
    "Worth": [],
}

BOR_CALENDAR = CalendarConfig(
    venue_label="Cook County Board of Review",
    session_label="Tax Year 2025 - Cook County Board of Review 2025-26 Session",
    session_end=d("6/3/2026"),
    source_url=BOR_DATES_PDF_URL,
    source_note="BOR 2025 township date PDF linked from the official Board of Review site.",
)

BOR_GROUPS: dict[str, BorGroup] = {
    "1": BorGroup(
        townships=(
            "Berwyn",
            "Evanston",
            "Norwood Park",
            "River Forest",
            "Riverside",
            "Rogers Park",
        ),
        windows=(
            FilingWindow(d("7/7/2025"), d("8/5/2025"), d("8/15/2025")),
            FilingWindow(d("12/3/2025"), d("12/12/2025"), d("12/22/2025")),
        ),
    ),
    "2a": BorGroup(
        townships=("Cicero", "Oak Park", "Palos"),
        windows=(
            FilingWindow(d("7/21/2025"), d("8/19/2025"), d("8/29/2025")),
            FilingWindow(d("12/3/2025"), d("12/12/2025"), d("12/22/2025")),
        ),
    ),
    "2b": BorGroup(
        townships=("Elk Grove", "Lakeview", "Lyons", "New Trier"),
        windows=(
            FilingWindow(d("8/18/2025"), d("9/16/2025"), d("9/26/2025")),
            FilingWindow(d("12/3/2025"), d("12/12/2025"), d("12/22/2025")),
        ),
    ),
    "3": BorGroup(
        townships=("Barrington", "Maine", "Northfield", "Stickney", "West Chicago"),
        windows=(
            FilingWindow(d("9/22/2025"), d("10/21/2025"), d("10/31/2025")),
            FilingWindow(d("12/3/2025"), d("12/12/2025"), d("12/22/2025")),
        ),
    ),
    "4": BorGroup(
        townships=("Bremen", "Calumet", "Hyde Park", "Lemont", "Leyden", "Worth"),
        windows=(
            FilingWindow(d("10/23/2025"), d("11/21/2025"), d("12/1/2025")),
            FilingWindow(d("12/3/2025"), d("12/12/2025"), d("12/22/2025")),
        ),
    ),
    "5": BorGroup(
        townships=("Jefferson", "Proviso", "Wheeling"),
        windows=(FilingWindow(d("11/20/2025"), d("12/19/2025"), d("12/29/2025")),),
    ),
    "6": BorGroup(
        townships=("Lake", "Orland", "Palatine", "Schaumburg", "Thornton"),
        windows=(FilingWindow(d("1/5/2026"), d("2/3/2026"), d("2/13/2026")),),
    ),
    "7": BorGroup(
        townships=("Bloom", "Hanover", "Niles", "Rich", "North Chicago", "South Chicago"),
        windows=(FilingWindow(d("1/20/2026"), d("2/18/2026"), d("2/28/2026")),),
    ),
}

TOWNSHIP_ALIASES = {"Lake View": "Lakeview"}
TOWNSHIP_TO_BOR_GROUP = {
    township: group for group, info in BOR_GROUPS.items() for township in info.townships
}


def canonical_township(name: str) -> str:
    title = " ".join(str(name).strip().split()).title()
    return TOWNSHIP_ALIASES.get(title, title)


def bor_windows_for_township(township_name: str) -> list[FilingWindow]:
    township = canonical_township(township_name)
    group = TOWNSHIP_TO_BOR_GROUP.get(township)
    if group is None:
        return []
    return list(BOR_GROUPS[group].windows)


def ccao_windows_for_township(township_name: str) -> list[FilingWindow]:
    return CCAO_WINDOWS.get(canonical_township(township_name), [])

from __future__ import annotations

from dataclasses import dataclass
from typing import Literal

from appeal_tool.models import ResolvedVenue

AssessmentMetric = Literal["total_av", "improvement_av"]


@dataclass(frozen=True)
class SimilarityStep:
    sqft_tolerance: float
    year_tolerance: int


@dataclass(frozen=True)
class ComparableProfile:
    key: str
    venue_label: str
    metric: AssessmentMetric
    metric_label: str
    minimum_comparables: int
    target_comparables: int
    similarity_steps: tuple[SimilarityStep, ...]
    prefer_same_neighborhood_minimum: int
    require_year: bool = False
    require_land: bool = False
    require_style: bool = False
    require_amenity: bool = False
    land_tolerance: float | None = None
    feasibility_verdict: str = "FEASIBLE"
    source_note: str = ""


ASSESSOR_PROFILE = ComparableProfile(
    key="assessor",
    venue_label="Cook County Assessor",
    metric="total_av",
    metric_label="total assessed value",
    minimum_comparables=3,
    target_comparables=8,
    similarity_steps=(
        SimilarityStep(0.25, 15),
        SimilarityStep(0.40, 25),
        SimilarityStep(0.60, 40),
    ),
    prefer_same_neighborhood_minimum=15,
    feasibility_verdict="FEASIBLE-WITH-CAVEATS",
    source_note=(
        "Profile verified against reachable Phase 2 official guidance and measured in "
        "reports/comps_feasibility_2026-07-06.md."
    ),
)

BOR_PROFILE = ComparableProfile(
    key="bor",
    venue_label="Cook County Board of Review",
    metric="improvement_av",
    metric_label="building assessment",
    minimum_comparables=3,
    target_comparables=8,
    similarity_steps=(
        SimilarityStep(0.25, 15),
        SimilarityStep(0.35, 20),
        SimilarityStep(0.50, 35),
    ),
    prefer_same_neighborhood_minimum=3,
    feasibility_verdict="FEASIBLE-WITH-CAVEATS",
    source_note=(
        "BOR public rules do not publish a PTAB-style grid; this profile uses the measured "
        "building-assessment-per-square-foot path from Phase 2 feasibility."
    ),
)

PTAB_PROFILE = ComparableProfile(
    key="ptab",
    venue_label="Illinois PTAB",
    metric="improvement_av",
    metric_label="improvement assessment",
    minimum_comparables=3,
    target_comparables=6,
    similarity_steps=(SimilarityStep(0.25, 15),),
    prefer_same_neighborhood_minimum=3,
    require_year=True,
    require_land=True,
    require_style=True,
    require_amenity=True,
    land_tolerance=0.50,
    feasibility_verdict="NOT FEASIBLE",
    source_note=(
        "Full PTAB grid alignment is blocked by public-data limits; see BLOCKERS.md and "
        "reports/comps_feasibility_2026-07-06.md."
    ),
)

PROFILES_BY_VENUE = {
    "assessor": ASSESSOR_PROFILE,
    "bor": BOR_PROFILE,
    "ptab": PTAB_PROFILE,
    "closed": ASSESSOR_PROFILE,
}


def profile_for_venue(venue: ResolvedVenue | None) -> ComparableProfile:
    return PROFILES_BY_VENUE[venue or "assessor"]

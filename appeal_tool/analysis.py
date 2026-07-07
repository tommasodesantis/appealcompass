from __future__ import annotations

import math
from datetime import date
from statistics import median
from typing import Literal

from appeal_tool.comparable_profiles import (
    ASSESSOR_PROFILE,
    ComparableProfile,
    profile_for_venue,
)
from appeal_tool.config import ASSESSMENT_LEVEL, NOT_LEGAL_ADVICE, STATE_EQUALIZER
from appeal_tool.math_utils import estimated_savings_range, gap_pct, percentile_rank, safe_div
from appeal_tool.models import (
    CaseFile,
    Comparable,
    ComparableAnalysis,
    ComparableExhibit,
    EvidenceArgument,
    EvidenceSummary,
    EvidenceTier,
    Parcel,
    ResolvedVenue,
    SavingsAssumption,
)

Strength = Literal["strong", "supporting"]


def _distance_km(
    lat1: float | None, lon1: float | None, lat2: float | None, lon2: float | None
) -> float | None:
    if lat1 is None or lon1 is None or lat2 is None or lon2 is None:
        return None
    radius = 6371.0
    p1 = math.radians(lat1)
    p2 = math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dlambda / 2) ** 2
    return 2 * radius * math.asin(math.sqrt(a))


def _similarity(subject: CaseFile, comp: Comparable) -> float:
    parcel = subject.parcel
    score = 0.0
    if parcel.building_sqft and comp.building_sqft:
        score += 0.5 * abs(comp.building_sqft - parcel.building_sqft) / parcel.building_sqft
    else:
        score += 0.5
    if parcel.year_built and comp.year_built:
        score += 0.3 * min(abs(comp.year_built - parcel.year_built) / 50.0, 1.0)
    else:
        score += 0.15
    distance = _distance_km(parcel.lat, parcel.lon, comp.lat, comp.lon)
    score += 0.2 * min((distance or 1.0) / 2.0, 1.0)
    return score


def _subject_metric_value(parcel: Parcel, profile: ComparableProfile) -> float | None:
    if profile.metric == "improvement_av":
        return parcel.current_improvement_av
    return parcel.current_av


def _comparable_metric_value(comp: Comparable, profile: ComparableProfile) -> float | None:
    if profile.metric == "improvement_av":
        return comp.improvement_av
    return comp.av


def _profiled_analysis(
    *,
    status: Literal["ok", "condo", "insufficient_data"],
    note: str,
    profile: ComparableProfile,
    warnings: tuple[str, ...] = (),
    missing_data_rate: float | None = None,
    scope: str | None = None,
    pool_size: int = 0,
    subject_av_per_sqft: float | None = None,
    median_av_per_sqft: float | None = None,
    percentile: float | None = None,
    gap: float | None = None,
    exhibit: tuple[ComparableExhibit, ...] = (),
) -> ComparableAnalysis:
    return ComparableAnalysis(
        status=status,
        note=note,
        profile_key=profile.key,
        profile_label=profile.venue_label,
        metric_label=profile.metric_label,
        warnings=warnings,
        missing_data_rate=missing_data_rate,
        scope=scope,
        pool_size=pool_size,
        subject_av_per_sqft=subject_av_per_sqft,
        median_av_per_sqft=median_av_per_sqft,
        percentile=percentile,
        gap_pct=gap,
        exhibit=exhibit,
    )


def _passes_year_filter(parcel: Parcel, comp: Comparable, profile: ComparableProfile) -> bool:
    tolerance = profile.similarity_steps[-1].year_tolerance
    if profile.require_year:
        return (
            parcel.year_built is not None
            and comp.year_built is not None
            and abs(comp.year_built - parcel.year_built) <= tolerance
        )
    return (
        parcel.year_built is None
        or comp.year_built is None
        or abs(comp.year_built - parcel.year_built) <= tolerance
    )


def _passes_profile_requirements(
    parcel: Parcel, comp: Comparable, profile: ComparableProfile
) -> bool:
    if not _passes_year_filter(parcel, comp, profile):
        return False
    if profile.require_land:
        if not parcel.land_sqft or not comp.land_sqft:
            return False
        tolerance = profile.land_tolerance or 1.0
        low = parcel.land_sqft * (1 - tolerance)
        high = parcel.land_sqft * (1 + tolerance)
        if not low <= comp.land_sqft <= high:
            return False
    if profile.require_style:
        if parcel.style and comp.style != parcel.style:
            return False
        if not parcel.style and not comp.style:
            return False
    return not (profile.require_amenity and comp.amenity_count <= 0)


def _target_total_av(
    parcel: Parcel, profile: ComparableProfile, target_metric_value: float
) -> float:
    if profile.metric == "improvement_av" and parcel.current_improvement_av and parcel.current_av:
        reduction = max(0.0, parcel.current_improvement_av - target_metric_value)
        return max(0.0, parcel.current_av - reduction)
    return target_metric_value


def _condo_missing_data_rate(case: CaseFile, profile: ComparableProfile) -> float:
    candidates = [comp for comp in case.comparables if comp.pin != case.parcel.pin]
    if not candidates:
        return 100.0
    missing = 0
    for comp in candidates:
        metric_value = _comparable_metric_value(comp, profile)
        if (
            not comp.building_sqft
            or comp.building_sqft <= 0
            or not metric_value
            or metric_value <= 0
        ):
            missing += 1
    return round(100.0 * missing / len(candidates), 1)


def _condo_reliability(
    case: CaseFile, profile: ComparableProfile
) -> tuple[bool, tuple[str, ...], float]:
    missing_rate = _condo_missing_data_rate(case, profile)
    if missing_rate > 50:
        return False, (), missing_rate
    if missing_rate >= 30:
        return (
            True,
            (
                "Condo comparable analysis is less reliable because "
                f"{missing_rate:.0f}% of public condo candidates are missing unit sqft or "
                f"{profile.metric_label}.",
            ),
            missing_rate,
        )
    return True, (), missing_rate


def analyze_comparables(
    case: CaseFile,
    max_comps: int = 10,
    profile: ComparableProfile = ASSESSOR_PROFILE,
) -> ComparableAnalysis:
    parcel = case.parcel
    warnings: tuple[str, ...] = ()
    missing_data_rate: float | None = None
    if parcel.is_condo:
        should_run, warnings, missing_data_rate = _condo_reliability(case, profile)
        if not should_run:
            return _profiled_analysis(
                status="condo",
                note=(
                    "Condo comparable analysis skipped after measuring "
                    f"{missing_data_rate:.0f}% missing unit sqft or {profile.metric_label} "
                    "in the public condo candidate pool. Use sale, appraisal, building-level "
                    "equity, or factual-error evidence."
                ),
                profile=profile,
                missing_data_rate=missing_data_rate,
            )

    subject_metric_value = _subject_metric_value(parcel, profile)
    subject_psf = safe_div(subject_metric_value, parcel.building_sqft)
    if subject_psf is None or parcel.building_sqft is None or parcel.building_sqft <= 0:
        return _profiled_analysis(
            status="insufficient_data",
            note=(
                "Missing subject building square footage or "
                f"{profile.metric_label}; re-run with documented user-supplied values if "
                "available."
            ),
            profile=profile,
            warnings=warnings,
            missing_data_rate=missing_data_rate,
        )

    candidates = [
        comp
        for comp in case.comparables
        if comp.pin != parcel.pin
        and (metric_value := _comparable_metric_value(comp, profile)) is not None
        and metric_value > 0
        and comp.building_sqft is not None
        and comp.building_sqft > 0
        and _passes_profile_requirements(parcel, comp, profile)
    ]
    selected: list[Comparable] = []
    scope = "township"
    for step in profile.similarity_steps:
        scoped = [
            comp
            for comp in candidates
            if comp.building_sqft is not None
            and parcel.building_sqft * (1 - step.sqft_tolerance)
            <= comp.building_sqft
            <= parcel.building_sqft * (1 + step.sqft_tolerance)
            and (
                parcel.year_built is None
                or comp.year_built is None
                or abs(comp.year_built - parcel.year_built) <= step.year_tolerance
            )
        ]
        neighborhood = [
            comp
            for comp in scoped
            if parcel.neighborhood is not None and comp.neighborhood == parcel.neighborhood
        ]
        if len(neighborhood) >= profile.prefer_same_neighborhood_minimum:
            selected = neighborhood
            scope = "neighborhood"
        else:
            selected = scoped
            scope = "township"
        if len(selected) >= profile.target_comparables:
            break

    if len(selected) < profile.minimum_comparables:
        return _profiled_analysis(
            status="insufficient_data",
            note=(
                f"Only {len(selected)} similar parcels found under the "
                f"{profile.venue_label} profile; too few for a reliable exhibit."
            ),
            profile=profile,
            warnings=warnings,
            missing_data_rate=missing_data_rate,
            scope=scope,
            pool_size=len(selected),
        )

    av_psf_values = [
        metric_value / comp.building_sqft
        for comp in selected
        if (metric_value := _comparable_metric_value(comp, profile)) is not None
        and comp.building_sqft is not None
        and comp.building_sqft > 0
    ]
    median_psf = median(av_psf_values)
    percentile = percentile_rank(subject_psf, av_psf_values)
    gap = gap_pct(subject_psf, av_psf_values)
    exhibits = []
    for comp in selected:
        comp_psf = safe_div(_comparable_metric_value(comp, profile), comp.building_sqft)
        if comp_psf is None or comp_psf >= subject_psf:
            continue
        exhibits.append(
            ComparableExhibit(
                comparable=comp,
                av_per_sqft=comp_psf,
                distance_km=_distance_km(parcel.lat, parcel.lon, comp.lat, comp.lon),
                similarity=_similarity(case, comp),
            )
        )
    exhibits = sorted(exhibits, key=lambda item: item.similarity)[:max_comps]
    return _profiled_analysis(
        status="ok",
        note=(
            f"Comparable analysis completed with the {profile.venue_label} profile "
            f"using {profile.metric_label} per square foot."
        ),
        profile=profile,
        warnings=warnings,
        missing_data_rate=missing_data_rate,
        scope=scope,
        pool_size=len(selected),
        subject_av_per_sqft=subject_psf,
        median_av_per_sqft=median_psf,
        percentile=percentile,
        gap=gap,
        exhibit=tuple(exhibits),
    )


def assessment_shock_pct(case: CaseFile) -> float | None:
    current = case.parcel.current_av
    prior = case.parcel.prior_final_av
    if current is None or prior is None or prior <= 0:
        return None
    return 100.0 * (current - prior) / prior


def build_evidence_summary(
    case: CaseFile,
    tax_rate: float,
    lien_date: date | None = None,
    venue: ResolvedVenue | None = None,
) -> EvidenceSummary:
    parcel = case.parcel
    profile = profile_for_venue(venue)
    comparable_analysis = analyze_comparables(case, profile=profile)
    implied_market = parcel.current_av / ASSESSMENT_LEVEL if parcel.current_av else None
    arguments: list[EvidenceArgument] = []
    tier_points = 0

    if comparable_analysis.status == "ok":
        percentile = comparable_analysis.percentile or 0.0
        gap = comparable_analysis.gap_pct or 0.0
        if percentile >= 75 and gap >= 10:
            strength: Strength = "strong"
            tier_points += 2
        elif percentile >= 60 or gap >= 5:
            strength = "supporting"
            tier_points += 1
        else:
            strength = "supporting"
        if gap > 0 and comparable_analysis.median_av_per_sqft and parcel.building_sqft:
            target_metric = comparable_analysis.median_av_per_sqft * parcel.building_sqft
            target_av = _target_total_av(parcel, profile, target_metric)
            _, point, _ = estimated_savings_range(
                (parcel.current_av or 0) - target_av, STATE_EQUALIZER, tax_rate
            )
            arguments.append(
                EvidenceArgument(
                    argument_type="uniformity",
                    strength=strength,
                    text=(
                        f"Your {profile.metric_label} per square foot is higher than "
                        f"{percentile:.0f}% "
                        f"of {comparable_analysis.pool_size} similar homes and {gap:.0f}% "
                        "above their median."
                    ),
                    target_av=target_av,
                    estimated_savings=point,
                )
            )

    evidence_value = None
    evidence_source = None
    if case.subject_sales:
        latest = sorted(case.subject_sales, key=lambda sale: sale.sale_date, reverse=True)[0]
        evidence_value = latest.sale_price
        evidence_source = f"recorded sale on {latest.sale_date.isoformat()}"
    if case.user_evidence.purchase_price:
        evidence_value = case.user_evidence.purchase_price
        when = (
            case.user_evidence.purchase_date.isoformat()
            if case.user_evidence.purchase_date
            else "date n/a"
        )
        evidence_source = f"reported purchase on {when}"
    if case.user_evidence.appraisal_value:
        evidence_value = case.user_evidence.appraisal_value
        when = (
            case.user_evidence.appraisal_date.isoformat()
            if case.user_evidence.appraisal_date
            else "date n/a"
        )
        evidence_source = f"reported appraisal on {when}"

    if evidence_value and implied_market and evidence_value > 0 and evidence_value < implied_market:
        over = 100.0 * (implied_market - evidence_value) / evidence_value
        tier_points += 2 if over >= 10 else 1
        target_av = evidence_value * ASSESSMENT_LEVEL
        _, point, _ = estimated_savings_range(
            (parcel.current_av or 0) - target_av, STATE_EQUALIZER, tax_rate
        )
        arguments.append(
            EvidenceArgument(
                argument_type="overvaluation",
                strength="strong" if over >= 10 else "supporting",
                text=(
                    f"The implied market value is {over:.0f}% above the {evidence_source} "
                    f"of ${evidence_value:,.0f}."
                ),
                target_av=target_av,
                estimated_savings=point,
            )
        )

    if case.user_evidence.actual_sqft and parcel.building_sqft:
        sqft_delta = parcel.building_sqft - case.user_evidence.actual_sqft
        if abs(sqft_delta) / parcel.building_sqft >= 0.05:
            tier_points += 2
            arguments.append(
                EvidenceArgument(
                    argument_type="property_description",
                    strength="strong",
                    text=(
                        f"The Assessor record shows {parcel.building_sqft:,.0f} sqft, "
                        f"but you reported {case.user_evidence.actual_sqft:,.0f} sqft. "
                        "A documented factual correction is strongest at the Assessor level."
                    ),
                )
            )

    shock = assessment_shock_pct(case)
    if shock is not None and shock >= 15:
        tier_points += 1
        arguments.append(
            EvidenceArgument(
                argument_type="assessment_shock",
                strength="supporting",
                text=f"Current assessed value increased {shock:.0f}% from the prior final value.",
            )
        )

    if case.user_evidence.condition_issues:
        arguments.append(
            EvidenceArgument(
                argument_type="condition",
                strength="supporting",
                text=(
                    "Reported condition issues: "
                    + "; ".join(case.user_evidence.condition_issues)
                    + ". Attach dated photos and repair estimates."
                ),
            )
        )

    if tier_points >= 3:
        tier: EvidenceTier = "STRONG"
        tier_message = "Multiple independent grounds support spending time on an appeal."
    elif tier_points >= 1:
        tier = "MODERATE"
        tier_message = "At least one credible ground supports an appeal."
    else:
        tier = "LIMITED"
        tier_message = (
            "Public data alone is limited. Appealing is free, but add sale, appraisal, "
            "condition, or factual-error evidence before investing significant time."
        )

    all_savings = [
        argument.estimated_savings for argument in arguments if argument.estimated_savings
    ]
    point_savings = max(all_savings) if all_savings else 0.0
    return EvidenceSummary(
        tier=tier,
        tier_message=tier_message,
        comparable_analysis=comparable_analysis,
        arguments=tuple(arguments),
        implied_market_value=implied_market,
        savings_assumptions=SavingsAssumption(
            tax_rate=tax_rate,
            state_equalizer=STATE_EQUALIZER,
            low=point_savings * 0.8,
            point=point_savings,
            high=point_savings * 1.2,
        ),
        disclaimers=(
            NOT_LEGAL_ADVICE,
            "Estimated savings are rough ranges, not promises. Taxes must still be paid on time.",
        ),
    )

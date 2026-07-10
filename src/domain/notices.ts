import type { DataNotice } from "./models";

function cleanWarning(message: string): string {
  return message
    .replace(/;?\s*documentation required\.?/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

function fallbackYear(messages: string[]): string | null {
  const years = messages.flatMap((message) => message.match(/\b20\d{2}\b/g) ?? []);
  const currentYear = years[0];
  return years.filter((year) => year !== currentYear).at(-1) ?? null;
}

export function buildDataNotices(inputWarnings: string[]): DataNotice[] {
  const warnings = [...new Set(inputWarnings.map(cleanWarning).filter(Boolean))];
  const used = new Set<string>();
  const notices: DataNotice[] = [];

  const take = (predicate: (warning: string) => boolean): string[] => {
    const matches = warnings.filter((warning) => !used.has(warning) && predicate(warning));
    for (const warning of matches) {
      used.add(warning);
    }
    return matches;
  };

  take((warning) => /configured calendar is past its session end/i.test(warning));

  const assessmentFallbacks = take(
    (warning) =>
      /assessment (row|rows|value|values)/i.test(warning) &&
      /(most recent|using|value-bearing)/i.test(warning),
  );
  if (assessmentFallbacks.length > 0) {
    const subject = assessmentFallbacks.filter((warning) => !/comparable/i.test(warning));
    const comparable = assessmentFallbacks.filter((warning) => /comparable/i.test(warning));
    const subjectYear = fallbackYear(subject);
    const comparableYear = fallbackYear(comparable);
    const appliesTo =
      subject.length > 0 && comparable.length > 0
        ? "the subject and comparable pool"
        : subject.length > 0
          ? "the subject property"
          : "the comparable pool";
    const yearText =
      subjectYear && comparableYear && subjectYear === comparableYear
        ? ` This review uses ${subjectYear} values.`
        : " This review uses the most recent rows with usable values.";
    notices.push({
      code: "assessment_year_fallback",
      severity: "caution",
      title: "Newer assessment rows were incomplete",
      summary: `The returned 2026 rows did not contain usable assessed values for ${appliesTo}.${yearText}`,
      details: [
        ...(subject.length > 0
          ? [`Subject assessment year used: ${subjectYear ?? "most recent available"}.`]
          : []),
        ...(comparable.length > 0
          ? [`Comparable assessment year used: ${comparableYear ?? "most recent available"}.`]
          : []),
        "Verify current assessed values at the official property source before filing.",
      ],
    });
  }

  const characteristicWarnings = take(
    (warning) =>
      !/user-supplied/i.test(warning) &&
      /residential characteristics|comparable characteristic rows|comparable characteristics|residential building square footage|public building square footage/i.test(
        warning,
      ),
  );
  if (characteristicWarnings.length > 0) {
    const subjectMissing = characteristicWarnings.some((warning) =>
      /^residential characteristics were unavailable|missing residential building square footage|public building square footage is missing/i.test(
        warning,
      ),
    );
    const comparableMissing = characteristicWarnings.some((warning) =>
      /no comparable characteristic rows/i.test(warning),
    );
    const characteristicYear = fallbackYear(characteristicWarnings);
    notices.push({
      code: "characteristics_limited",
      severity: "caution",
      title: "Building details are limited",
      summary:
        subjectMissing && comparableMissing
          ? "The public data did not return building characteristics for either the subject or comparable candidates, so area-based matching could not produce a reliable exhibit."
          : subjectMissing
            ? "The public data did not return the subject's building characteristics, so area-based comparison is limited."
            : comparableMissing
              ? "The public data did not return comparable building-characteristic rows for this township and class."
              : `The review uses ${characteristicYear ?? "older"} building characteristics because 2026 details were unavailable.`,
      details: [
        ...(subjectMissing ? ["Subject building characteristics: not returned."] : []),
        ...(comparableMissing
          ? ["Comparable building characteristics: no rows returned for the township and class."]
          : []),
        "Square-foot and characteristic-based comparisons may be unavailable or less reliable.",
      ],
    });
  }

  const parcelFallbacks = take((warning) => /parcel details/i.test(warning));
  if (parcelFallbacks.length > 0) {
    notices.push({
      code: "parcel_details_fallback",
      severity: "caution",
      title: "Using older parcel details",
      summary: `The 2026 parcel row was unavailable, so this review uses ${fallbackYear(parcelFallbacks) ?? "the most recent available"} parcel details.`,
      details: ["Verify the current class, township, and property details at the official source."],
    });
  }

  const valueWarnings = take((warning) => /current assessed value was unavailable/i.test(warning));
  if (valueWarnings.length > 0) {
    notices.push({
      code: "assessed_value_missing",
      severity: "caution",
      title: "Current assessed value is unavailable",
      summary: "Savings and implied-market-value estimates cannot be treated as complete.",
      details: ["Confirm the current assessed value at the official property source."],
    });
  }

  const improvementWarnings = take((warning) =>
    /public improvement AV is missing|little or no assessed improvement value/i.test(warning),
  );
  if (improvementWarnings.length > 0) {
    notices.push({
      code: "improvement_value_limited",
      severity: "caution",
      title: "Improvement assessment is unavailable or unusual",
      summary:
        "The public data does not provide a usable building Improvement AV, so residential uniformity analysis may need a fallback value or manual review.",
      details: [
        "Check whether the parcel is vacant, has minimal improvements, or has an incomplete assessment row.",
      ],
    });
  }

  const assessmentYearWarnings = take((warning) =>
    /public assessment year for the subject could not be confirmed/i.test(warning),
  );
  if (assessmentYearWarnings.length > 0) {
    notices.push({
      code: "assessment_year_unknown",
      severity: "caution",
      title: "Assessment year could not be confirmed",
      summary: "The subject and comparable values may not be from the same assessment year.",
      details: ["Confirm the year shown for each assessed value before relying on the comparison."],
    });
  }

  const multicardCombined = take((warning) =>
    /parcel has \d+ residential property cards.*combined across all cards/i.test(warning),
  );
  if (multicardCombined.length > 0) {
    notices.push({
      code: "multicard_aggregation",
      severity: "info",
      title: "Multiple property cards were combined",
      summary: multicardCombined[0] ?? "Building details were combined across property cards.",
      details: [
        "The parcel land area is counted once. Verify every card on the official property record before filing.",
      ],
    });
  }

  const excludedCardCandidates = take(
    (warning) =>
      /comparable candidate.*property-card or assessment components could not be reconciled/i.test(
        warning,
      ) || /comparable candidate.*property-card count did not match/i.test(warning),
  );
  if (excludedCardCandidates.length > 0) {
    notices.push({
      code: "comparable_card_exclusions",
      severity: "caution",
      title: "Some comparable candidates were excluded",
      summary:
        "Parcels with incomplete card or assessment details, or a different residential card count, were excluded before calculations.",
      details: excludedCardCandidates,
    });
  }

  const classWarnings = take((warning) => /this residential class can involve/i.test(warning));
  if (classWarnings.length > 0) {
    notices.push({
      code: "residential_class_caveat",
      severity: "caution",
      title: "This residential class needs extra review",
      summary:
        "Multi-unit, multi-building, mixed-use, or other improvement details may make the square-foot comparison less representative.",
      details: [
        "Check the property record and confirm each selected home is genuinely comparable.",
      ],
    });
  }

  const condoWarnings = take((warning) =>
    /condo comparable analysis is less reliable/i.test(warning),
  );
  if (condoWarnings.length > 0) {
    notices.push({
      code: "condo_data_coverage",
      severity: "caution",
      title: "Condo data coverage is limited",
      summary: condoWarnings[0] ?? "Public condo records are missing important comparison fields.",
      details: [
        "Unit condition, floor, view, parking, and association details are not evaluated by this public-data screen.",
      ],
    });
  }

  const distantComparableWarnings = take((warning) =>
    /every comparable driving the calculation is more than 3 km/i.test(warning),
  );
  if (distantComparableWarnings.length > 0) {
    notices.push({
      code: "distant_comparable_pool",
      severity: "caution",
      title: "Comparable locations need extra review",
      summary:
        "Every home driving the calculation is more than 3 km from the subject, so local neighborhood differences may matter.",
      details: [
        "Verify the location, neighborhood context, property cards, and physical similarity of every selected home before filing.",
      ],
    });
  }

  const largeSavingsWarnings = take((warning) =>
    /screening savings estimate is unusually large/i.test(warning),
  );
  if (largeSavingsWarnings.length > 0) {
    notices.push({
      code: "large_savings_estimate",
      severity: "caution",
      title: "Savings estimate needs extra review",
      summary:
        "The screening reduction is large relative to the tax attributable to the current assessed value.",
      details: [largeSavingsWarnings[0] ?? "Verify every input before relying on the estimate."],
    });
  }

  const userSupplied = take((warning) => /user-supplied/i.test(warning));
  if (userSupplied.length > 0) {
    notices.push({
      code: "user_supplied_values",
      severity: "info",
      title: "Using values you entered",
      summary: "Some calculations use fallback values entered in this assessment.",
      details: userSupplied,
    });
  }

  for (const warning of warnings) {
    if (used.has(warning)) {
      continue;
    }
    notices.push({
      code: `data_note_${notices.length + 1}`,
      severity: "caution",
      title: "Data limitation",
      summary: warning,
      details: [],
    });
  }

  return notices;
}

export function cleanWarnings(inputWarnings: string[]): string[] {
  return [...new Set(inputWarnings.map(cleanWarning).filter(Boolean))];
}

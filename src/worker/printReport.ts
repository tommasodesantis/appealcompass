import { ASSESSMENT_LEVEL, NOT_LEGAL_ADVICE } from "../domain/config";
import { medianValue, percentileRank } from "../domain/math";
import type {
  ComparableExhibit,
  EvidenceCandidate,
  EvidenceType,
  PacketSelection,
  Parcel,
  SubjectField,
} from "../domain/models";
import { formatPropertyClass } from "../domain/propertyClasses";
import { MAX_ACTIONABLE_SIMILARITY } from "../domain/similarityBands";
import { PROOF_TYPE_LABELS, SUBJECT_FIELD_LABELS } from "../domain/subjectCorrections";
import type { AnalysisPayload } from "./casePayload";

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function dollars(value: number | null): string {
  return value === null || Number.isNaN(value) ? "Not available" : money.format(value);
}

function numberText(value: number | null, digits = 0): string {
  return value === null || Number.isNaN(value)
    ? "Not available"
    : value.toLocaleString("en-US", { maximumFractionDigits: digits });
}

function parcelValue(parcel: Parcel, field: SubjectField): string {
  const value = parcel[field];
  if (field === "propertyClass") return formatPropertyClass(String(value));
  if (typeof value === "string") return value || "Not available";
  if (field === "currentAv" || field === "currentImprovementAv" || field === "currentLandAv") {
    return dollars(typeof value === "number" ? value : null);
  }
  return value === null ? "Not available" : numberText(typeof value === "number" ? value : null);
}

function subjectTable(payload: AnalysisPayload): string {
  const { publicParcel, effectiveParcel, provenance, corrections } = payload.analysis.subject;
  const correctionByField = new Map(
    corrections.map((correction) => [correction.field, correction]),
  );
  const fields: SubjectField[] = [
    "propertyClass",
    "townshipName",
    "neighborhood",
    "buildingSqft",
    "landSqft",
    "yearBuilt",
    "currentAv",
    "currentImprovementAv",
    "currentLandAv",
    "cardCount",
  ];
  return `<table class="subject-values">
    <thead><tr><th>Field</th><th>Original public value</th><th>Effective value</th><th>Provenance and proof</th></tr></thead>
    <tbody>${fields
      .map((field) => {
        const correction = correctionByField.get(field);
        const proof = correction?.proofType ? PROOF_TYPE_LABELS[correction.proofType] : "";
        const detail =
          provenance[field] === "public"
            ? "Public"
            : `${provenance[field].replaceAll("_", " ")}${proof ? `; ${proof}` : ""}${correction?.otherProofDescription ? ` — ${correction.otherProofDescription}` : ""}${correction?.derivation ? ` — ${correction.derivation}` : ""}`;
        return `<tr><th>${escapeHtml(SUBJECT_FIELD_LABELS[field])}</th><td>${escapeHtml(
          parcelValue(publicParcel, field),
        )}</td><td>${escapeHtml(parcelValue(effectiveParcel, field))}</td><td>${escapeHtml(detail)}</td></tr>`;
      })
      .join("")}</tbody>
  </table>`;
}

function cardBreakdown(payload: AnalysisPayload): string {
  const cards = payload.analysis.propertyCards;
  if (cards.length <= 1) return "";
  return `<h3>Residential property-card breakdown</h3>
    <p>Multiple property cards were combined for this parcel. Building area was added across cards; parcel land was counted once.</p>
    <table><thead><tr><th>Card number</th><th>Property class</th><th>Building sqft</th><th>Year built</th></tr></thead>
    <tbody>${cards
      .map(
        (card) =>
          `<tr><td>${escapeHtml(card.cardNumber)}</td><td>${escapeHtml(formatPropertyClass(card.propertyClass) || "Not available")}</td><td>${numberText(card.buildingSqft)}</td><td>${numberText(card.yearBuilt)}</td></tr>`,
      )
      .join("")}</tbody></table>`;
}

function comparableTable(rows: ComparableExhibit[]): string {
  if (rows.length === 0) return "<p>No comparable rows were selected by the owner.</p>";
  return `<table><caption>${rows.length} owner-selected comparable ${rows.length === 1 ? "row" : "rows"}</caption>
    <thead><tr><th>PIN</th><th>Distance km</th><th>Neighborhood</th><th>Class</th><th>Building sqft</th><th>Year built</th><th>Sale date</th><th>Sale price</th><th>Improvement AV/sqft</th><th>Similarity</th><th>Band</th><th>Land AV/sqft</th></tr></thead>
    <tbody>${rows
      .map(
        (row) => `<tr>
          <td>${escapeHtml(row.comparable.pinFormatted)}</td>
          <td>${numberText(row.distanceKm, 2)}</td>
          <td>${escapeHtml(row.comparable.neighborhood ?? "Not available")}</td>
          <td>${escapeHtml(formatPropertyClass(row.comparable.propertyClass) || "Not available")}</td>
          <td>${numberText(row.comparable.buildingSqft)}</td>
          <td>${numberText(row.comparable.yearBuilt)}</td>
          <td>${escapeHtml(row.comparable.saleDate ?? "Not available")}${row.comparable.saleDate && !row.recentSale ? " (older; context only)" : ""}</td>
          <td>${dollars(row.comparable.salePrice)}</td>
          <td>${dollars(row.improvementAvPerSqft)}</td>
          <td>${numberText(row.similarity, 3)}${row.similarity > MAX_ACTIONABLE_SIMILARITY ? " (context only)" : ""}</td>
          <td>${escapeHtml(row.band)}</td>
          <td>${dollars(row.landAvPerSqft)}</td>
        </tr>`,
      )
      .join("")}</tbody></table>`;
}

function evidenceDetails(
  candidate: EvidenceCandidate,
  selectedRows: ComparableExhibit[],
  payload: AnalysisPayload,
): string {
  const actionable = selectedRows.filter((row) => row.similarity <= MAX_ACTIONABLE_SIMILARITY);
  const subject = payload.analysis.subject.effectiveParcel;
  let calculation = "";
  if (candidate.type === "uniformity") {
    if (
      actionable.length >= 3 &&
      payload.analysis.comparableSummary.subjectImprovementAvPerSqft !== null
    ) {
      const values = actionable.map((row) => row.improvementAvPerSqft);
      const median = medianValue(values);
      const subjectPsf = payload.analysis.comparableSummary.subjectImprovementAvPerSqft;
      const percentile = percentileRank(subjectPsf, values);
      const gap = (100 * (subjectPsf - median)) / median;
      calculation = `Selected-row median Improvement AV/sqft: ${dollars(median)}. Subject percentile: ${numberText(percentile, 1)}%. Subject gap: ${numberText(gap, 1)}%.`;
    } else
      calculation =
        "Fewer than three owner-selected actionable comparables; no selected-row uniformity calculation is shown.";
  } else if (candidate.type === "comparable_sales") {
    const sales = actionable.filter((row) => row.recentSale && row.salePricePerSqft !== null);
    if (sales.length >= 3 && subject.buildingSqft) {
      const median = medianValue(sales.map((row) => row.salePricePerSqft ?? 0));
      calculation = `Selected-row median recent sale price/sqft: ${dollars(median)}. Preliminary comparable-supported subject market value: ${dollars(median * subject.buildingSqft)}. This is an unadjusted screening estimate, not an appraisal.`;
    } else
      calculation = "Insufficient recent sales among the owner-selected actionable comparables.";
  } else if (candidate.type === "land") {
    const landRows = actionable.filter((row) => row.landAvPerSqft !== null);
    if (landRows.length >= 3 && payload.analysis.comparableSummary.subjectLandAvPerSqft !== null) {
      const values = landRows.map((row) => row.landAvPerSqft ?? 0);
      const median = medianValue(values);
      const percentile = percentileRank(
        payload.analysis.comparableSummary.subjectLandAvPerSqft,
        values,
      );
      calculation = `Selected-row median Land AV/sqft: ${dollars(median)}. Subject land percentile: ${numberText(percentile, 1)}%.`;
    } else
      calculation = "Fewer than three owner-selected actionable comparables have usable land data.";
  } else if (candidate.type === "property_corrections") {
    calculation = payload.analysis.subject.corrections
      .map(
        (item) =>
          `${SUBJECT_FIELD_LABELS[item.field]}: ${item.value} (${item.provenance?.replaceAll("_", " ")})`,
      )
      .join("; ");
  } else {
    calculation = candidate.dataUsed.join("; ") || "No direct subject-value row was available.";
  }
  return `<article class="packet-evidence"><h3>${escapeHtml(candidate.name)}</h3>
    <p><strong>Status:</strong> ${escapeHtml(candidate.status.replaceAll("_", " "))}. ${escapeHtml(candidate.shortReason)}</p>
    <p>${escapeHtml(calculation)}</p>
    ${candidate.limitations.length ? `<p><strong>Limitations:</strong> ${escapeHtml(candidate.limitations.join(" "))}</p>` : ""}
  </article>`;
}

function selectedCandidates(payload: AnalysisPayload, types: EvidenceType[]): EvidenceCandidate[] {
  const selected = new Set(types);
  return payload.analysis.evidenceCandidates.filter((candidate) => selected.has(candidate.type));
}

export function buildPrintReport(payload: AnalysisPayload, selection: PacketSelection): string {
  const selectedPins = new Set(selection.comparablePins);
  const selectedRows = payload.analysis.comparableSummary.universe.filter((row) =>
    selectedPins.has(row.comparable.pin),
  );
  const candidates = selectedCandidates(payload, selection.evidenceTypes);
  return `<!doctype html><html lang="en"><head>
    <meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Appeal Compass evidence exhibit — ${escapeHtml(payload.analysis.subject.effectiveParcel.pinFormatted)}</title>
    <link rel="stylesheet" href="/styles.css"><link rel="icon" href="/favicon.svg" type="image/svg+xml">
  </head><body class="print-body"><main class="packet">
    <button class="no-print" type="button" onclick="window.print()">Print / Save as PDF</button>
    <section class="packet-section"><h1>Appeal Compass</h1>
      <p><strong>Evidence exhibit produced:</strong> ${escapeHtml(payload.generatedAt.slice(0, 10))}</p>
      <p><strong>Subject PIN:</strong> ${escapeHtml(payload.analysis.subject.effectiveParcel.pinFormatted)}</p>
      <p><strong>Selected venue:</strong> ${escapeHtml(payload.venue.name)}</p>
      <p><strong>${escapeHtml(NOT_LEGAL_ADVICE)}</strong></p>
    </section>
    <section class="packet-section"><h2>Subject values and documented corrections</h2>${subjectTable(payload)}${cardBreakdown(payload)}</section>
    <section class="packet-section"><h2>Methodology</h2>
      <p>Comparable candidates retain the selected venue's matching requirements before scoring. Similarity is weighted 50% for building-size difference, 30% for year-built difference, and 20% for distance; lower is more similar. The displayed universe ends at 0.50. Rows above 0.35 are context only and do not drive screening calculations.</p>
      <p>Subject implied market value is effective Total AV divided by the ${numberText(ASSESSMENT_LEVEL * 100)}% residential assessment level. Comparable-sales values are unadjusted screening estimates and are not appraisals.</p>
    </section>
    <section class="packet-section"><h2>Owner-selected evidence</h2>${candidates.length ? candidates.map((candidate) => evidenceDetails(candidate, selectedRows, payload)).join("") : "<p>No evidence type was selected.</p>"}</section>
    <section class="packet-section"><h2>Owner-selected comparable rows</h2>${comparableTable(selectedRows)}</section>
    <section class="packet-section"><h2>Relevant data limitations</h2>
      ${payload.analysis.notices.length ? `<ul>${payload.analysis.notices.map((notice) => `<li><strong>${escapeHtml(notice.title)}:</strong> ${escapeHtml(notice.summary)}</li>`).join("")}</ul>` : "<p>No additional public-data limitation was reported.</p>"}
      <p>Supporting documents identified by the owner, including proof for corrections, purchase, or appraisal evidence, must be included separately. Appeal Compass does not collect documents.</p>
      <p>This exhibit organizes screening evidence and does not itself prove entitlement to a reduction.</p>
    </section>
  </main></body></html>`;
}

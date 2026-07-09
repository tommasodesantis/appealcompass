import { assessmentTypeLabel } from "../domain/comparableDisplay";
import { ASSESSMENT_LEVEL, NOT_LEGAL_ADVICE } from "../domain/config";
import type { Parcel } from "../domain/models";
import { filterBySimilarity } from "../domain/similarityBands";
import type { CasePayload } from "./casePayload";

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
  if (value === null || Number.isNaN(value)) {
    return "Not available";
  }
  return value.toLocaleString("en-US", { maximumFractionDigits: digits });
}

function percentText(value: number | null, digits = 0): string {
  return value === null || Number.isNaN(value) ? "Not available" : `${numberText(value, digits)}%`;
}

function githubLogo(): string {
  return `<svg aria-hidden="true" class="github-mark" viewBox="0 0 16 16" width="20" height="20">
    <path fill="currentColor" d="M8 0C3.58 0 0 3.67 0 8.2c0 3.62 2.29 6.69 5.47 7.78.4.08.55-.18.55-.39 0-.19-.01-.84-.01-1.53-2.01.38-2.53-.5-2.69-.96-.09-.24-.48-.96-.82-1.16-.28-.16-.68-.55-.01-.56.63-.01 1.08.59 1.23.84.72 1.24 1.87.89 2.33.68.07-.53.28-.89.51-1.09-1.78-.21-3.64-.91-3.64-4.04 0-.89.31-1.62.82-2.19-.08-.21-.36-1.04.08-2.16 0 0 .67-.22 2.2.84A7.43 7.43 0 0 1 8 3.98c.68 0 1.36.09 2 .28 1.53-1.06 2.2-.84 2.2-.84.44 1.12.16 1.95.08 2.16.51.57.82 1.3.82 2.19 0 3.14-1.87 3.83-3.65 4.04.29.26.54.76.54 1.54 0 1.11-.01 2-.01 2.27 0 .21.15.47.55.39A8.08 8.08 0 0 0 16 8.2C16 3.67 12.42 0 8 0Z"/>
  </svg>`;
}

function githubHeaderLink(): string {
  return `<a class="header-icon-link no-print" href="https://github.com/tommasodesantis/appealcompass" target="_blank" rel="noreferrer">${githubLogo()}<span>View on GitHub</span><span class="sr-only"> (opens in new tab)</span></a>`;
}

function knownParcelAddress(parcel: Parcel): string | null {
  const cityZip = [parcel.city.trim(), parcel.zipCode.trim()].filter(Boolean).join(" ");
  const pieces = [parcel.address.trim(), cityZip].filter(Boolean);
  return pieces.length > 0 ? pieces.join(", ") : null;
}

function generatedDate(payload: CasePayload): string {
  const datePart = payload.generatedAt.slice(0, 10);
  const [yearText, monthText, dayText] = datePart.split("-");
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) {
    return datePart || "unknown date";
  }
  return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

function subjectValues(payload: CasePayload): string {
  const caseFile = payload.case;
  const parcel = caseFile.parcel;
  const effectiveAv = parcel.currentAv ?? caseFile.userEvidence.actualAv;
  const rows = [
    ["PIN", parcel.pinFormatted],
    ["Selected venue", payload.venue.name],
    ["Property class", parcel.propertyClass],
    ["Township", parcel.townshipName],
    ["Neighborhood", parcel.neighborhood ?? "Not available"],
    [
      "Building sqft",
      parcel.buildingSqft
        ? numberText(parcel.buildingSqft)
        : caseFile.userEvidence.actualSqft
          ? `${numberText(caseFile.userEvidence.actualSqft)} (user-supplied)`
          : "Missing",
    ],
    ["Land sqft", numberText(parcel.landSqft)],
    ["Year built", numberText(parcel.yearBuilt)],
    ["Assessment year", numberText(parcel.assessmentYear)],
    [
      "Current total assessed value",
      parcel.currentAv
        ? dollars(parcel.currentAv)
        : caseFile.userEvidence.actualAv
          ? `${dollars(caseFile.userEvidence.actualAv)} (user-supplied)`
          : "Not available",
    ],
    [
      "Current improvement assessed value",
      parcel.currentImprovementAv
        ? dollars(parcel.currentImprovementAv)
        : caseFile.userEvidence.actualImprovementAv
          ? `${dollars(caseFile.userEvidence.actualImprovementAv)} (user-supplied)`
          : "Not available",
    ],
    ["Current land assessed value", dollars(parcel.currentLandAv)],
  ];
  const address = knownParcelAddress(parcel);
  if (address) {
    rows.splice(1, 0, ["Address", address]);
  }
  if (effectiveAv) {
    rows.push(["Implied market value", dollars(effectiveAv / ASSESSMENT_LEVEL)]);
  }
  return `<dl class="packet-dl">${rows
    .map(([key, value]) => `<div><dt>${escapeHtml(key)}</dt><dd>${escapeHtml(value)}</dd></div>`)
    .join("")}</dl>`;
}

function comparablesTable(payload: CasePayload, maxSimilarity: number | null): string {
  const comps = payload.evidence.comparableAnalysis;
  const selectedPool = filterBySimilarity(comps.pool, maxSimilarity);
  if (selectedPool.length === 0) {
    return `<p>${escapeHtml(comps.note)}</p>`;
  }
  const assessmentType = assessmentTypeLabel(comps.profileKey);
  return `<table>
    <caption>${selectedPool.length} selected comparable ${selectedPool.length === 1 ? "home" : "homes"}; higher-assessed rows are included for transparency.</caption>
    <thead><tr><th>PIN</th><th>Distance km</th><th>Neighborhood</th><th>Property class</th><th>Building sqft</th><th>Year built</th><th>Sale date</th><th>Sale price</th><th>Assessment metric</th><th>Improvement AV/sqft</th><th>Compared with subject</th><th>Similarity score</th></tr></thead>
    <tbody>
      ${selectedPool
        .map((item) => {
          const difference =
            comps.subjectAvPerSqft && comps.subjectAvPerSqft > 0
              ? ((item.avPerSqft - comps.subjectAvPerSqft) / comps.subjectAvPerSqft) * 100
              : null;
          return `<tr>
            <td>${escapeHtml(item.comparable.pinFormatted)}</td>
            <td>${item.distanceKm === null ? "Not available" : numberText(item.distanceKm, 2)}</td>
            <td>${escapeHtml(item.comparable.neighborhood ?? "Not available")}</td>
            <td>${escapeHtml(item.comparable.propertyClass ?? "Not available")}</td>
            <td>${numberText(item.comparable.buildingSqft)}</td>
            <td>${escapeHtml(item.comparable.yearBuilt ?? "Not available")}</td>
            <td>${escapeHtml(item.comparable.saleDate ?? "Not available")}</td>
            <td>${dollars(item.comparable.salePrice)}</td>
            <td>${escapeHtml(assessmentType)}</td>
            <td>${dollars(item.avPerSqft)}</td>
            <td>${difference === null ? "Not available" : `${percentText(Math.abs(difference), 1)} ${difference < 0 ? "lower" : "higher"}`}</td>
            <td>${numberText(item.similarity, 3)}</td>
          </tr>`;
        })
        .join("")}
    </tbody>
  </table>`;
}

function methodDescription(payload: CasePayload): string {
  const comps = payload.evidence.comparableAnalysis;
  return `<p>Appeal Compass used the ${escapeHtml(
    comps.profileLabel,
  )} comparable profile and compared ${escapeHtml(
    comps.metricLabel,
  )} per square foot. The method starts from same-class, same-township public records, applies the active profile's building-size and year-built matching rules, prefers same-neighborhood rows when enough are available, and uses the ${escapeHtml(
    comps.scope ?? "available",
  )} scope for this case. The table shows all selected rows, including homes assessed above the subject, and sorts them by similarity score, where lower means more similar.</p>`;
}

function analysisResults(payload: CasePayload): string {
  const comps = payload.evidence.comparableAnalysis;
  const land = payload.evidence.landAssessment;
  const savings = payload.evidence.savingsAssumptions;
  return `<dl class="packet-dl">
    <div><dt>Comparable pool size</dt><dd>${numberText(comps.poolSize)}</dd></div>
    <div><dt>Subject ${escapeHtml(comps.metricLabel)}/sqft</dt><dd>${dollars(comps.subjectAvPerSqft)}</dd></div>
    <div><dt>Median comparable ${escapeHtml(comps.metricLabel)}/sqft</dt><dd>${dollars(comps.medianAvPerSqft)}</dd></div>
    <div><dt>Subject percentile</dt><dd>${percentText(comps.percentile)}</dd></div>
    <div><dt>Subject vs median gap</dt><dd>${percentText(comps.gapPct, 1)}</dd></div>
    <div><dt>Land-component check</dt><dd>${escapeHtml(land.note)}</dd></div>
    <div><dt>Subject Land AV/sqft</dt><dd>${dollars(land.subjectLandAvPerSqft)}</dd></div>
    <div><dt>Median comparable Land AV/sqft</dt><dd>${dollars(land.medianLandAvPerSqft)}</dd></div>
    <div><dt>Estimated savings range</dt><dd>${dollars(savings.low)} to ${dollars(savings.high)} (point estimate ${dollars(savings.point)})</dd></div>
    <div><dt>Equalizer assumption</dt><dd>${escapeHtml(savings.stateEqualizer)}</dd></div>
    <div><dt>Tax-rate assumption</dt><dd>${escapeHtml(savings.taxRateSource)}</dd></div>
  </dl>`;
}

function deadlineSummary(payload: CasePayload): string {
  const route = payload.routing;
  const dates = route.deadlines.length
    ? `<dl class="packet-dl">${route.deadlines
        .map(
          (item) =>
            `<div><dt>${escapeHtml(item.label)}</dt><dd>${escapeHtml(item.date)}</dd></div>`,
        )
        .join("")}</dl>`
    : `<p><strong>${escapeHtml(route.deadlineLabel)}</strong></p>`;
  return `<p>${escapeHtml(route.headline)}</p>${dates}<p>Verify dates at <a href="${escapeHtml(route.officialUrl ?? payload.venue.rulesUrl)}">the official source</a>.</p>`;
}

function dataNotes(payload: CasePayload): string {
  if (payload.notices.length === 0) {
    return "<p>No public-data limitations were reported for this review.</p>";
  }
  return `<ul>${payload.notices
    .map(
      (notice) =>
        `<li><strong>${escapeHtml(notice.title)}:</strong> ${escapeHtml(notice.summary)}${
          notice.details.length > 0 ? ` ${escapeHtml(notice.details.join(" "))}` : ""
        }</li>`,
    )
    .join("")}</ul>`;
}

export function buildPrintReport(
  payload: CasePayload,
  maxSimilarity: number | null = null,
): string {
  const comps = payload.evidence.comparableAnalysis;
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Appeal Compass - ${escapeHtml(payload.venue.name)} - ${escapeHtml(payload.case.parcel.pinFormatted)}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,650;12..96,800&display=swap" rel="stylesheet">
    <link rel="icon" href="/favicon.svg" type="image/svg+xml">
    <link rel="stylesheet" href="/styles.css">
  </head>
  <body class="print-body">
    <main class="packet">
      <a class="button-link no-print" href="/">Back to Appeal Compass</a>
      <button class="no-print" type="button" onclick="window.print()">Print / Save as PDF</button>

      <section class="packet-section">
        <div class="packet-title-row">
          <h1>Appeal Compass</h1>
          ${githubHeaderLink()}
        </div>
        <p><strong>${escapeHtml(NOT_LEGAL_ADVICE)}</strong></p>
        <p><strong>Packet produced:</strong> ${escapeHtml(generatedDate(payload))}</p>
      </section>

      <section class="packet-section">
        <h2>Subject property specifications</h2>
        ${subjectValues(payload)}
      </section>

      <section class="packet-section">
        <h2>Deadline status</h2>
        ${deadlineSummary(payload)}
      </section>

      <section class="packet-section">
        <h2>Data notes</h2>
        ${dataNotes(payload)}
      </section>

      <section class="packet-section">
        <h2>Comparable method</h2>
        ${methodDescription(payload)}
      </section>

      <section class="packet-section">
        <h2>Comparable table</h2>
        ${comparablesTable(payload, maxSimilarity)}
      </section>

      <section class="packet-section">
        <h2>Comparable analysis results</h2>
        <p>${escapeHtml(comps.note)}</p>
        ${analysisResults(payload)}
      </section>
    </main>
  </body>
</html>`;
}

import { assessmentTypeLabel } from "../domain/comparableDisplay";
import {
  BOR_DATES_URL,
  CCAO_OFFICIAL_URL,
  CCAO_WINDOWS,
  type FilingWindow,
  PTAB_OFFICIAL_URL,
} from "../domain/config";
import { TURNSTILE_SITE_KEY } from "../domain/publicConfig";
import {
  SIMILARITY_BANDS,
  filterBySimilarity,
  parseSimilarityMax,
  similarityFilterValue,
} from "../domain/similarityBands";
import { loadAssessmentSnapshot, saveAssessmentSnapshot } from "./sessionState";
import { buildComparableWorkbook, comparableWorkbookFilename } from "./xlsx";

interface ApiError {
  ok: false;
  error: {
    kind: string;
    message: string;
  };
}

interface QueueStatus {
  ok: true;
  busy: boolean;
  message: string | null;
}

interface CasePayload {
  ok: true;
  generatedAt: string;
  today: string;
  case: {
    parcel: {
      pin: string;
      pinFormatted: string;
      propertyClass: string;
      townshipName: string;
      address: string;
      city: string;
      zipCode: string;
      buildingSqft: number | null;
      landSqft: number | null;
      assessmentYear: number | null;
      currentAv: number | null;
      currentImprovementAv: number | null;
      currentLandAv: number | null;
    };
    userEvidence: {
      actualSqft: number | null;
      actualAv: number | null;
      actualImprovementAv: number | null;
      purchasePrice: number | null;
      appraisalValue: number | null;
      borDecisionDate: string | null;
      borNoticeDate: string | null;
    };
    dataWarnings: string[];
  };
  routing: {
    venue: string;
    headline: string;
    reasoning: string[];
    actionStatus: string;
    deadline: string | null;
    daysRemaining: number | null;
    deadlineState: string;
    deadlineLabel: string;
    deadlines: Array<{
      kind: string;
      label: string;
      date: string;
      daysRemaining: number | null;
    }>;
    warnings: string[];
    officialUrl: string | null;
  };
  evidence: {
    tier: string;
    tierMessage: string;
    impliedMarketValue: number | null;
    savingsAssumptions: {
      taxRate: number;
      taxRateSource: string;
      stateEqualizer: number;
      low: number;
      point: number;
      high: number;
    };
    disclaimers: string[];
    arguments: Array<{
      argumentType: string;
      strength: string;
      text: string;
      targetAv: number | null;
      estimatedSavings: number | null;
    }>;
    comparableAnalysis: {
      status: string;
      note: string;
      profileKey: string;
      profileLabel: string;
      metricLabel: string;
      missingFields: Array<{
        name: "actualSqft" | "actualImprovementAv";
        label: string;
        helpText: string;
      }>;
      warnings: string[];
      missingDataRate: number | null;
      scope: string | null;
      poolSize: number;
      subjectAvPerSqft: number | null;
      medianAvPerSqft: number | null;
      percentile: number | null;
      gapPct: number | null;
      pool: Array<{
        avPerSqft: number;
        distanceKm: number | null;
        similarity: number;
        comparable: {
          pinFormatted: string;
          propertyClass: string | null;
          neighborhood: string | null;
          buildingSqft: number | null;
          yearBuilt: number | null;
          saleDate: string | null;
          salePrice: number | null;
          assessmentYear: number | null;
          av: number | null;
          improvementAv: number | null;
          landAv: number | null;
          landSqft: number | null;
        };
      }>;
      exhibit: Array<{
        avPerSqft: number;
        distanceKm: number | null;
        similarity: number;
        comparable: {
          pinFormatted: string;
          propertyClass: string | null;
          neighborhood: string | null;
          buildingSqft: number | null;
          yearBuilt: number | null;
          saleDate: string | null;
          salePrice: number | null;
          assessmentYear: number | null;
          av: number | null;
          improvementAv: number | null;
          landAv: number | null;
          landSqft: number | null;
        };
      }>;
    };
    landAssessment: {
      status: string;
      note: string;
      subjectLandAvPerSqft: number | null;
      medianLandAvPerSqft: number | null;
      percentile: number | null;
      gapPct: number | null;
      medianComparableLandSqft: number | null;
      poolSize: number;
      flagged: boolean;
    };
  };
  venue: {
    key: string;
    name: string;
    officialUrl: string;
    submissionUrl: string;
    rulesUrl: string;
    checklist: string[];
    sections: Array<{ title: string; lines: string[] }>;
  };
  warnings: string[];
  notices?: Array<{
    code: string;
    severity: "caution" | "info";
    title: string;
    summary: string;
    details: string[];
  }>;
}

const app = document.querySelector<HTMLDivElement>("#app");
if (!app) {
  throw new Error("Missing app root.");
}
const appRoot = app;

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const ENTITY_REFUSAL_MESSAGE =
  "Appeal Compass is designed only for individual residential homeowners appealing their own home; if interested in a similar tool for commercial properties please reach out here.";
const QUEUED_MESSAGE =
  "Appeal Compass is busy helping other homeowners right now. You're in line — keep this page open and your assessment will start automatically.";
const CCAO_EXEMPTIONS_URL = "https://www.cookcountyassessoril.gov/exemptions";
const COOK_PROPERTY_TAX_PORTAL_URL = "https://www.cookcountypropertyinfo.com/";
const TURNSTILE_ENABLED = TURNSTILE_SITE_KEY.length > 0;
const REPORTING_ENABLED = TURNSTILE_ENABLED;
const CONTACT_ENABLED = TURNSTILE_ENABLED;
let tooltipCounter = 0;
let lastCasePayload: CasePayload | null = null;
let lastCaseQuery: URLSearchParams | null = null;
let selectedSimilarityMax: number | null = null;
const IS_METHODOLOGY_PAGE = window.location.pathname === "/methodology";

function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function externalLink(url: string, label: string): string {
  return `<a href="${escapeHtml(url)}" target="_blank" rel="noreferrer">${escapeHtml(label)}<span class="sr-only"> (opens in new tab)</span></a>`;
}

function tooltip(label: string, text: string, marker = "?", extraClass = ""): string {
  tooltipCounter += 1;
  const id = `tooltip-${tooltipCounter}`;
  const className = extraClass ? `tooltip ${extraClass}` : "tooltip";
  return `<span class="${className}">
    <button class="tooltip-toggle" type="button" aria-label="${escapeHtml(label)}" aria-expanded="false" aria-describedby="${id}">${escapeHtml(marker)}</button>
    <span class="tooltip-bubble" id="${id}" role="tooltip">${escapeHtml(text)}</span>
  </span>`;
}

function infoTooltip(label: string, text: string): string {
  return tooltip(label, text);
}

function warningTooltip(label: string, text: string): string {
  return tooltip(label, text, "!", "warning-tooltip");
}

function linkedText(value: unknown): string {
  const text = String(value ?? "");
  const pattern = /https?:\/\/[^\s<>"']+/g;
  let rendered = "";
  let lastIndex = 0;
  for (const match of text.matchAll(pattern)) {
    const rawUrl = match[0];
    const start = match.index ?? 0;
    const trailing = rawUrl.match(/[.,;:)]+$/)?.[0] ?? "";
    const url = rawUrl.slice(0, rawUrl.length - trailing.length);
    rendered += escapeHtml(text.slice(lastIndex, start));
    rendered += `<a href="${escapeHtml(url)}" target="_blank" rel="noreferrer">${escapeHtml(url)}<span class="sr-only"> (opens in new tab)</span></a>${escapeHtml(trailing)}`;
    lastIndex = start + rawUrl.length;
  }
  return rendered + escapeHtml(text.slice(lastIndex));
}

function dollars(value: number | null): string {
  return value === null ? "Not available" : money.format(value);
}

function numberText(value: number | null, digits = 0): string {
  return value === null
    ? "Not available"
    : value.toLocaleString("en-US", { maximumFractionDigits: digits });
}

function evidenceLevelLabel(level: string): string {
  if (level === "LIMITED") {
    return "Limited public-data evidence";
  }
  if (level === "STRONG") {
    return "Strong";
  }
  if (level === "MODERATE") {
    return "Moderate";
  }
  return level;
}

function argumentTypeLabel(argumentType: string): string {
  return argumentType
    .split("_")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function clientTodayIso(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function dateLabel(isoDate: string): string {
  const [yearText, monthText, dayText] = isoDate.split("-");
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) {
    return isoDate;
  }
  return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

function allWindowsClosed(windows: FilingWindow[], today: string): boolean {
  return windows.length > 0 && windows.every((window) => today > window.closes);
}

function filingWindowLabel(window: FilingWindow): string {
  const evidence = window.evidenceDeadline
    ? `; evidence due ${dateLabel(window.evidenceDeadline)}`
    : "";
  return `${dateLabel(window.opens)} to ${dateLabel(window.closes)}${evidence}`;
}

function assessorDeadlineList(): string {
  const rows = Object.entries(CCAO_WINDOWS)
    .flatMap(([township, windows]) =>
      windows.map(
        (window) => `<li>${escapeHtml(township)}: ${escapeHtml(filingWindowLabel(window))}</li>`,
      ),
    )
    .join("");
  return (
    rows || "<li>No configured Assessor filing windows are available in the current data.</li>"
  );
}

function assessorDeadlineWarning(today: string): string {
  const windows = Object.values(CCAO_WINDOWS).flat();
  if (!allWindowsClosed(windows, today)) {
    return "";
  }
  return warningTooltip(
    "Assessor calendar warning",
    `All configured deadlines for this venue appear to be past as of ${today}. The data may be stale; verify at the official source before filing. You can still select this venue to prepare for the next session.`,
  );
}

function venueOptionHtml(input: {
  value: "assessor" | "bor" | "ptab";
  label: string;
  warning?: string;
  details: string;
}): string {
  return `<div class="venue-option">
    <div class="venue-choice-row">
      <label class="venue-choice">
        <input type="radio" name="venue" value="${input.value}" required>
        <span>${escapeHtml(input.label)}</span>
      </label>
      ${input.warning ?? ""}
    </div>
    ${input.details}
  </div>`;
}

function venuePickerHtml(): string {
  const today = clientTodayIso();
  return `<fieldset class="question-group venue-picker">
    <legend>Where do you want to appeal?</legend>
    <div class="venue-options">
      ${venueOptionHtml({
        value: "assessor",
        label: "Cook County Assessor",
        warning: assessorDeadlineWarning(today),
        details: `<details class="venue-details">
          <summary>About the Assessor path</summary>
          <p>The Assessor is the first-level Cook County appeal venue. Start here for current-year assessment challenges and documented property-description errors.</p>
          <p>Use this path if you are within the township filing window or preparing for the next Assessor session.</p>
          <p>Official source: ${externalLink(CCAO_OFFICIAL_URL, "Cook County Assessor calendar")}. Verify at the official source before filing.</p>
          <ul class="deadline-list">${assessorDeadlineList()}</ul>
        </details>`,
      })}
      ${venueOptionHtml({
        value: "bor",
        label: "Cook County Board of Review",
        warning: warningTooltip(
          "Board of Review schedule status",
          "Tax Year 2026 township filing dates have not been published. The official page still lists the prior 2025 schedule.",
        ),
        details: `<details class="venue-details">
          <summary>About the BOR path</summary>
          <p>The Board of Review is the second-level Cook County appeal venue and has its own township filing and evidence deadlines.</p>
          <p>Use this path if you are filing at BOR, preparing after an Assessor appeal, or checking BOR-specific comparable evidence.</p>
          <p>Tax Year 2026 township dates are not published yet. Do not use the expired 2025 schedule as a current deadline.</p>
          <p>Official source: ${externalLink(BOR_DATES_URL, "Cook County BOR dates and deadlines")}. Check the official page before filing.</p>
        </details>`,
      })}
      ${venueOptionHtml({
        value: "ptab",
        label: "Illinois PTAB",
        details: `<details class="venue-details">
          <summary>About the PTAB path</summary>
          <p>PTAB is the Illinois state appeal board available after a written BOR decision for the same tax year.</p>
          <p>Use this path only when you have, or are preparing for, a BOR decision notice. The deadline is generally 30 days from the date on the written notice; Appeal Compass will not guess that date.</p>
          <p>Official source: ${externalLink(PTAB_OFFICIAL_URL, "Illinois PTAB")}. Verify at the official source before filing.</p>
        </details>`,
      })}
    </div>
  </fieldset>`;
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { headers: { accept: "application/json" } });
  const data = (await response.json()) as T | ApiError;
  if (!response.ok || (typeof data === "object" && data && "ok" in data && data.ok === false)) {
    const message = (data as ApiError).error?.message ?? "The request failed.";
    throw new Error(message);
  }
  return data as T;
}

function formValue(form: HTMLFormElement, name: string): string {
  const value = new FormData(form).get(name);
  return typeof value === "string" ? value.trim() : "";
}

function addOptionalParams(params: URLSearchParams, form: HTMLFormElement): void {
  const names = [
    "jurisdiction",
    "venue",
    "ownershipType",
    "borNoticeReceived",
    "borNoticeDate",
    "purchasePrice",
    "purchaseDate",
    "appraisalValue",
    "appraisalDate",
    "actualSqft",
    "actualAv",
    "actualImprovementAv",
  ];
  for (const name of names) {
    const value = formValue(form, name);
    if (value) {
      params.set(name, value);
    }
  }
}

function progressHtml(message: string): string {
  return `<section class="progress" aria-live="polite"><p>${escapeHtml(message)}</p></section>`;
}

function githubLogo(): string {
  return `<svg aria-hidden="true" class="github-mark" viewBox="0 0 16 16" width="20" height="20">
    <path fill="currentColor" d="M8 0C3.58 0 0 3.67 0 8.2c0 3.62 2.29 6.69 5.47 7.78.4.08.55-.18.55-.39 0-.19-.01-.84-.01-1.53-2.01.38-2.53-.5-2.69-.96-.09-.24-.48-.96-.82-1.16-.28-.16-.68-.55-.01-.56.63-.01 1.08.59 1.23.84.72 1.24 1.87.89 2.33.68.07-.53.28-.89.51-1.09-1.78-.21-3.64-.91-3.64-4.04 0-.89.31-1.62.82-2.19-.08-.21-.36-1.04.08-2.16 0 0 .67-.22 2.2.84A7.43 7.43 0 0 1 8 3.98c.68 0 1.36.09 2 .28 1.53-1.06 2.2-.84 2.2-.84.44 1.12.16 1.95.08 2.16.51.57.82 1.3.82 2.19 0 3.14-1.87 3.83-3.65 4.04.29.26.54.76.54 1.54 0 1.11-.01 2-.01 2.27 0 .21.15.47.55.39A8.08 8.08 0 0 0 16 8.2C16 3.67 12.42 0 8 0Z"/>
  </svg>`;
}

function siteFooter(): string {
  return `<footer class="site-footer">
    <div class="footer-project">
      <strong>Appeal Compass</strong>
      <p class="project-credit">An open-source GPLv3 project developed by <a href="https://github.com/tommasodesantis" target="_blank" rel="noreferrer">Tommaso De Santis<span class="sr-only"> (opens in new tab)</span></a></p>
    </div>
    <nav class="footer-links" aria-label="Project links">
      <a class="footer-icon-link" href="https://github.com/tommasodesantis/appealcompass" target="_blank" rel="noreferrer">${githubLogo()}<span>GitHub</span><span class="sr-only"> (opens in new tab)</span></a>
      <a href="https://ko-fi.com/tomdesantis" target="_blank" rel="noreferrer">Support the project<span class="sr-only"> (opens in new tab)</span></a>
      <button type="button" id="suggest-feature" class="link-button">Suggest a feature</button>
      <button type="button" id="report-problem" class="link-button">Report a problem</button>
    </nav>
  </footer>`;
}

function githubHeaderLink(): string {
  return `<a class="header-icon-link" href="https://github.com/tommasodesantis/appealcompass" target="_blank" rel="noreferrer">${githubLogo()}<span>View on GitHub</span><span class="sr-only"> (opens in new tab)</span></a>`;
}

function reportPanel(): string {
  const disabled = REPORTING_ENABLED ? "" : " disabled";
  const turnstile = REPORTING_ENABLED
    ? `<div class="cf-turnstile" data-sitekey="${escapeHtml(TURNSTILE_SITE_KEY)}"></div>`
    : '<p class="hint">Problem reporting is disabled until the Turnstile site key is configured.</p>';
  return `<section id="report-panel" class="report-panel" hidden>
    <div class="report-card" role="dialog" aria-modal="true" aria-labelledby="report-title">
      <button type="button" id="close-report" class="secondary close-button">Close</button>
      <h2 id="report-title">Report a problem</h2>
      <form id="report-form" class="stack">
        <label>
          <span>Category</span>
          <select name="category" required${disabled}>
            <option value="">Choose a category</option>
            <option value="wrong_deadline">Wrong deadline</option>
            <option value="wrong_jurisdiction">Wrong jurisdiction info</option>
            <option value="wrong_comparables">Wrong comparables</option>
            <option value="wrong_assessment_data">Wrong assessment data</option>
            <option value="feature_request">Feature request</option>
          </select>
        </label>
        <label>
          <span>Description</span>
          <textarea name="description" rows="5" maxlength="4000" required${disabled}></textarea>
        </label>
        <label>
          <span>Optional PIN/context</span>
          <input name="context" id="report-context" maxlength="2000"${disabled}>
        </label>
        ${turnstile}
        <div id="report-status" aria-live="polite"></div>
        <button type="submit"${disabled}>Submit report</button>
      </form>
    </div>
  </section>`;
}

function entityRefusalPanel(): string {
  const linkedMessage = escapeHtml(ENTITY_REFUSAL_MESSAGE).replace(
    "here.",
    '<a href="#contact-panel" id="open-contact-from-refusal">here</a>.',
  );
  return `<section id="entity-refusal-panel" class="modal-panel" hidden>
    <div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="entity-refusal-title">
      <button type="button" id="close-entity-refusal" class="secondary close-button">Close</button>
      <h2 id="entity-refusal-title">Residential homeowners only</h2>
      <p>${linkedMessage}</p>
    </div>
  </section>`;
}

function contactPanel(): string {
  const disabled = CONTACT_ENABLED ? "" : " disabled";
  const turnstile = CONTACT_ENABLED
    ? `<div class="cf-turnstile" data-sitekey="${escapeHtml(TURNSTILE_SITE_KEY)}"></div>`
    : '<p class="hint">Contact is disabled until the Turnstile site key is configured.</p>';
  return `<section id="contact-panel" class="modal-panel" hidden>
    <div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="contact-title">
      <button type="button" id="close-contact" class="secondary close-button">Close</button>
      <h2 id="contact-title">Commercial-property interest</h2>
      <form id="contact-form" class="stack">
        <input type="hidden" name="topic" id="contact-topic" value="commercial_interest">
        <label>
          <span>Name (optional)</span>
          <input name="name" maxlength="120"${disabled}>
        </label>
        <label>
          <span>Email (optional)</span>
          <input name="email" type="email" maxlength="254"${disabled}>
        </label>
        <label>
          <span>Message</span>
          <textarea name="message" rows="5" maxlength="4000" required${disabled}></textarea>
        </label>
        ${turnstile}
        <div id="contact-status" aria-live="polite"></div>
        <button type="submit"${disabled}>Send message</button>
      </form>
    </div>
  </section>`;
}

function startProgress(initialMessage: string | null = null): () => void {
  const steps = initialMessage
    ? [initialMessage]
    : [
        "Looking up your property...",
        "Fetching assessment history...",
        "Finding similar homes...",
        "Building the evidence summary...",
      ];
  let index = 0;
  const firstStep = steps[0] ?? "";
  const progress = document.querySelector<HTMLElement>("#progress");
  if (progress) {
    progress.innerHTML = progressHtml(steps[index] ?? firstStep);
  }
  const timer = window.setInterval(() => {
    index = (index + 1) % steps.length;
    const target = document.querySelector<HTMLElement>("#progress");
    if (target) {
      target.innerHTML = progressHtml(steps[index] ?? firstStep);
    }
  }, 650);
  return () => window.clearInterval(timer);
}

async function queuedProgressMessage(): Promise<string | null> {
  try {
    const status = await fetchJson<QueueStatus>("/api/queue");
    return status.busy ? (status.message ?? QUEUED_MESSAGE) : null;
  } catch {
    return null;
  }
}

function shell(): void {
  appRoot.innerHTML = `
    <header class="topline">
      <div class="topline-head">
        <h1>Appeal Compass</h1>
        ${githubHeaderLink()}
      </div>
      <p class="tool-description">Appeal Compass screens public data for residential property-tax appeal evidence. It is open-source and currently runs on donations. <a href="https://ko-fi.com/tomdesantis" target="_blank" rel="noreferrer">Support it on Ko-fi<span class="sr-only"> (opens in new tab)</span></a>. If interested in a similar tool for commercial properties <a href="#contact-panel" id="open-commercial-interest">reach out here</a>.</p>
    </header>

    <section class="panel" aria-labelledby="step-one">
      <h2 id="step-one">Find the property</h2>
      <form id="case-form" class="stack">
        <div id="form-error" aria-live="polite"></div>
        <label>
          <span>Jurisdiction</span>
          <select name="jurisdiction" required>
            <option value="cook_county_il" selected>Cook County, Illinois</option>
          </select>
        </label>
        <p class="hint">More jurisdictions will be added.</p>
        <div class="lookup-grid">
          <div class="lookup-field">
            <div class="field-label-row">
              <label for="pin-input">PIN</label>
              ${infoTooltip(
                "What is a PIN?",
                "A PIN is the 14-digit parcel number on your assessment notice, tax bill, or property record card.",
              )}
            </div>
            <input id="pin-input" name="pin" autocomplete="off" inputmode="numeric" placeholder="03-00-000-000-0001" required>
          </div>
        </div>
        <p class="hint pin-help">Don't know your PIN? You can recover it from the ${externalLink(COOK_PROPERTY_TAX_PORTAL_URL, "Cook County Property Tax Portal")}.</p>

        ${venuePickerHtml()}

        <fieldset class="question-group">
          <legend>Ownership type</legend>
          <label>
            <span>Who owns the property?</span>
            <select name="ownershipType" required>
              <option value="">Choose ownership type</option>
              <option value="individual">Individual</option>
              <option value="llc">LLC</option>
              <option value="corporation">Corporation</option>
              <option value="other">Other entity</option>
            </select>
          </label>
        </fieldset>

        <fieldset class="question-group conditional" data-conditional="ptabNotice" hidden>
          <legend>PTAB timing</legend>
          <p>Have you received the written Board of Review decision notice?</p>
          <div class="choice-row">
            <label><input type="radio" name="borNoticeReceived" value="yes"><span>Yes</span></label>
            <label><input type="radio" name="borNoticeReceived" value="no"><span>No</span></label>
          </div>
          <div class="conditional" data-conditional="ptabNoticeDate" hidden>
            <label>
              <span>Date on the written BOR decision notice</span>
              <input name="borNoticeDate" type="date">
            </label>
          </div>
        </fieldset>

        <div class="actions">
          <button type="submit">Review my case</button>
        </div>
      </form>
    </section>

    <div id="progress"></div>
    <div id="results"></div>
    ${siteFooter()}
    ${reportPanel()}
    ${entityRefusalPanel()}
    ${contactPanel()}
  `;
}

function methodologyPage(): void {
  appRoot.innerHTML = `
    <header class="topline">
      <div class="topline-head">
        <h1>Methodology</h1>
        ${githubHeaderLink()}
      </div>
      <p class="lede">How Appeal Compass screens public data for residential property-tax appeal evidence.</p>
      <p><a href="/">Back to Appeal Compass</a></p>
    </header>

    <nav class="methodology-nav panel" aria-label="Methodology sections">
      <a href="#scope">Scope</a>
      <a href="#data-years">Data and years</a>
      <a href="#comparables">Comparables</a>
      <a href="#edge-cases">Edge cases</a>
      <a href="#deadlines">Deadlines</a>
      <a href="#savings">Savings</a>
    </nav>

    <section class="panel stack" id="scope">
      <p class="eyebrow">01 / Scope</p>
      <h2>What Appeal Compass does</h2>
      <p>Appeal Compass is a screening tool for individual Cook County homeowners. It uses a parcel PIN, the selected appeal venue, public property records, assessment values, sales, and residential characteristics to identify evidence worth reviewing.</p>
      <p>It does not file an appeal, decide legal eligibility, inspect the property, verify every reduction factor, or predict an official result. Every property fact, comparable, value, and deadline must be checked against the official source before filing.</p>
    </section>

    <section class="panel stack" id="data-years">
      <p class="eyebrow">02 / Data and years</p>
      <h2>How public rows are selected</h2>
      <p>The tool first requests the current assessment-year parcel, characteristic, and assessed-value rows. If a current row exists but has no usable assessed value, it uses the most recent value-bearing year and labels that limitation. Subject and comparable assessment years remain visible in the results and exports.</p>
      <p>If residential characteristics are missing, the tool may ask for only the field needed to continue, such as building area or Improvement AV. Values entered by a user are fallback inputs and are labeled user-supplied.</p>
      <p>Data notes combine related limitations, such as missing characteristics and older assessed values, so the same issue is not repeated several times.</p>
    </section>

    <section class="panel stack" id="comparables">
      <p class="eyebrow">03 / Comparable evidence</p>
      <h2>Selection, metrics, and interpretation</h2>
      <p>Residential uniformity evidence uses Improvement AV per building square foot. Total AV is shown for context, overvaluation checks, value breakdowns, and savings estimates, but Total AV alone does not generate a residential uniformity argument.</p>
      <p>The candidate pool starts with the same public property class and township. Venue-specific profiles apply building-size and year-built rules, prefer same-neighborhood homes when enough records exist, and compare known assessment years consistently. The selected-comparables table shows the full filtered pool, including rows assessed above the subject; a higher-assessed row is context, not support for a reduction.</p>
      <p>A lower similarity score means closer observable characteristics. Scores 0.00-0.10 are excellent, 0.10-0.20 are good, 0.20-0.35 are usable, 0.35-0.50 are broad matches that require careful review, and scores above 0.50 are questionable unless alternatives are sparse.</p>
      <p>The evidence level summarizes the available public-data support. It is a screening label, not a legal conclusion. A pool can contain several homes while producing no reduction argument when the subject is already assessed below the pool median.</p>
    </section>

    <section class="panel stack" id="edge-cases">
      <p class="eyebrow">04 / Property edge cases</p>
      <h2>What is included, limited, or blocked</h2>
      <dl class="methodology-cases">
        <div><dt>Residential condominiums</dt><dd>Class 299 is supported and compared with other Class 299 records. Condominium analysis is limited to public parcel-level fields and cannot evaluate unit condition, floor, view, parking, association finances, or other private attributes unless those appear in the source data.</dd></div>
        <div><dt>Small mixed-use homes</dt><dd>Supported Class 2 dwelling records, including Class 212, may be reviewed, but mixed residential and commercial use can make residential comparables less reliable. The result carries a caveat and should be checked manually.</dd></div>
        <div><dt>Multi-family and commercial</dt><dd>Class 3 multi-family property, Class 5 commercial or industrial property, and other non-Class-2 major classes are blocked before comparable analysis.</dd></div>
        <div><dt>Non-dwelling Class 2 records</dt><dd>Vacant land, cooperatives, buildings with more than six units, non-residential improvements, and special or atypical Class 2 codes are blocked. Current excluded codes are 200, 201, 213, 218, 219, 224, 225, 236, 239, 240, 241, 288, 290, 297, and 298.</dd></div>
        <div><dt>Unknown class</dt><dd>If the parcel class is missing or malformed, the tool stops rather than guessing that the property is a supported home.</dd></div>
        <div><dt>Missing or sparse comparables</dt><dd>The tool explains which data is missing. It does not create a favorable argument from a small pool or from higher-assessed homes. If selected rows exist, they remain visible for transparent review.</dd></div>
      </dl>
    </section>

    <section class="panel stack">
      <p class="eyebrow">05 / Land and arguments</p>
      <h2>Separate checks prevent misleading comparisons</h2>
      <p>The land-component check compares Land AV per land square foot. This helps distinguish lot-size differences from building uniformity evidence. A large lot or unusual land assessment may explain a Total AV difference without supporting a building-assessment reduction.</p>
      <p>Potential arguments are generated only when their underlying checks pass. These may include uniformity, overvaluation, description error, or assessment shock. “No strong public-data argument” means only that this screen did not find one; condition, vacancy, demolition, exemptions, appraisal evidence, and other facts may still matter.</p>
    </section>

    <section class="panel stack" id="deadlines">
      <p class="eyebrow">06 / Deadlines</p>
      <h2>How dates and unavailable schedules are handled</h2>
      <p>Assessor dates come from the official Tax Year 2026 township calendar. Townships without published dates are labeled “dates not published yet”; the tool does not invent a date.</p>
      <p>The official Board of Review dates page currently shows the prior Tax Year 2025 schedule, not a Tax Year 2026 township schedule. Appeal Compass therefore shows “2026 BOR dates not published yet” and links to the ${externalLink(BOR_DATES_URL, "official BOR dates page")} rather than reusing expired dates.</p>
      <p>PTAB generally requires filing within 30 days after the written BOR decision notice. The notice day is excluded and the last day is included. If the last day is a Saturday, Sunday, or Illinois legal holiday, the date moves to the next business day. For Cook County, a later statutory date tied to the township's final-action transmission may apply; that transmission is not observable in the public inputs, so the displayed date is conservative and must be verified with ${externalLink(PTAB_OFFICIAL_URL, "PTAB")}.</p>
      <p>Official pages control. Check the ${externalLink(CCAO_OFFICIAL_URL, "Assessor calendar")}, ${externalLink(BOR_DATES_URL, "BOR dates page")}, or ${externalLink(PTAB_OFFICIAL_URL, "PTAB site")} immediately before filing.</p>
    </section>

    <section class="panel stack" id="savings">
      <p class="eyebrow">07 / Savings and exports</p>
      <h2>Rough estimates, not promises</h2>
      <p>The point estimate applies the possible assessed-value reduction, state equalizer, and displayed tax-rate source. The range is shown around that point estimate. Missing current values or a default county tax-rate assumption reduces confidence.</p>
      <p>The print report and spreadsheet use the same selected comparable pool and similarity threshold as the screen. User-entered fallback values are labeled user-supplied. Taxes must still be paid on time while an appeal is pending.</p>
    </section>

    ${siteFooter()}
    ${reportPanel()}
    ${contactPanel()}
  `;
}

function setFormError(message: string): void {
  const target = document.querySelector<HTMLElement>("#form-error");
  if (!target) {
    return;
  }
  target.innerHTML = message
    ? `<section class="error inline-error" role="alert">${escapeHtml(message)}</section>`
    : "";
}

function setReportStatus(message: string, error = false): void {
  const target = document.querySelector<HTMLElement>("#report-status");
  if (!target) {
    return;
  }
  target.innerHTML = message
    ? `<p class="${error ? "error inline-error" : "notice inline-error"}">${escapeHtml(message)}</p>`
    : "";
}

function setContactStatus(message: string, error = false): void {
  const target = document.querySelector<HTMLElement>("#contact-status");
  if (!target) {
    return;
  }
  target.innerHTML = message
    ? `<p class="${error ? "error inline-error" : "notice inline-error"}">${escapeHtml(message)}</p>`
    : "";
}

function openReportPanel(): void {
  const panel = document.querySelector<HTMLElement>("#report-panel");
  const context = document.querySelector<HTMLInputElement>("#report-context");
  if (!panel) {
    return;
  }
  if (context && lastCasePayload) {
    context.value = `PIN ${lastCasePayload.case.parcel.pinFormatted}; venue ${lastCasePayload.routing.venue}; generated ${lastCasePayload.generatedAt}`;
  }
  setReportStatus(
    REPORTING_ENABLED
      ? ""
      : "Problem reporting is disabled until the Turnstile site key is configured.",
    true,
  );
  panel.hidden = false;
  const firstField = panel.querySelector<HTMLElement>("select, textarea, input, button");
  firstField?.focus();
}

function closeReportPanel(): void {
  const panel = document.querySelector<HTMLElement>("#report-panel");
  if (panel) {
    panel.hidden = true;
  }
}

function openEntityRefusalPanel(): void {
  const panel = document.querySelector<HTMLElement>("#entity-refusal-panel");
  if (!panel) {
    return;
  }
  panel.hidden = false;
  const firstField = panel.querySelector<HTMLElement>("a, button");
  firstField?.focus();
}

function closeEntityRefusalPanel(): void {
  const panel = document.querySelector<HTMLElement>("#entity-refusal-panel");
  if (panel) {
    panel.hidden = true;
  }
}

function openContactPanel(
  topic: "commercial_interest" | "feature_suggestion" = "commercial_interest",
): void {
  const panel = document.querySelector<HTMLElement>("#contact-panel");
  if (!panel) {
    return;
  }
  const title = document.querySelector<HTMLElement>("#contact-title");
  const topicInput = document.querySelector<HTMLInputElement>("#contact-topic");
  if (title) {
    title.textContent =
      topic === "feature_suggestion" ? "Suggest a feature" : "Commercial-property interest";
  }
  if (topicInput) {
    topicInput.value = topic;
  }
  setContactStatus(
    CONTACT_ENABLED ? "" : "Contact is disabled until the Turnstile site key is configured.",
    true,
  );
  panel.hidden = false;
  const firstField = panel.querySelector<HTMLElement>("input, textarea, button");
  firstField?.focus();
}

function closeContactPanel(): void {
  const panel = document.querySelector<HTMLElement>("#contact-panel");
  if (panel) {
    panel.hidden = true;
  }
}

function checkedValue(form: HTMLFormElement, name: string): string {
  const value = new FormData(form).get(name);
  return typeof value === "string" ? value : "";
}

function setConditional(form: HTMLFormElement, name: string, show: boolean): void {
  const section = form.querySelector<HTMLElement>(`[data-conditional="${name}"]`);
  if (!section) {
    return;
  }
  section.hidden = !show;
  for (const element of Array.from(section.querySelectorAll("input, select, textarea"))) {
    if (
      !(
        element instanceof HTMLInputElement ||
        element instanceof HTMLSelectElement ||
        element instanceof HTMLTextAreaElement
      )
    ) {
      continue;
    }
    if (element.closest<HTMLElement>("[data-conditional]") !== section) {
      continue;
    }
    const input = element;
    input.disabled = !show;
    input.required = show;
    if (!show) {
      if (input instanceof HTMLInputElement && input.type === "radio") {
        input.checked = false;
      } else {
        input.value = "";
      }
    }
  }
}

function updateConditionalFields(form: HTMLFormElement): void {
  const isPtab = checkedValue(form, "venue") === "ptab";
  setConditional(form, "ptabNotice", isPtab);
  const noticeReceived = isPtab && checkedValue(form, "borNoticeReceived") === "yes";
  setConditional(form, "ptabNoticeDate", noticeReceived);
}

function validateStepOne(form: HTMLFormElement): boolean {
  setFormError("");
  updateConditionalFields(form);
  if (!form.reportValidity()) {
    return false;
  }
  if (formValue(form, "ownershipType") !== "individual") {
    openEntityRefusalPanel();
    return false;
  }
  return true;
}

function noticeList(payload: CasePayload): string {
  const notices =
    payload.notices ??
    payload.warnings.map((warning, index) => ({
      code: `legacy_${index}`,
      severity: "caution" as const,
      title: "Data limitation",
      summary: warning,
      details: [],
    }));
  if (notices.length === 0) {
    return "";
  }
  return `<section class="data-notices" aria-labelledby="data-notes-heading">
    <div class="section-heading-row">
      <h2 id="data-notes-heading">Data notes</h2>
      <span class="notice-count">${notices.length}</span>
    </div>
    <div class="notice-grid">${notices
      .map(
        (notice) => `<article class="data-note ${escapeHtml(notice.severity)}">
          <h3>${escapeHtml(notice.title)}</h3>
          <p>${linkedText(notice.summary)}</p>
          ${
            notice.details.length > 0
              ? `<details><summary>Details and next check</summary><ul>${notice.details
                  .map((detail) => `<li>${linkedText(detail)}</li>`)
                  .join("")}</ul></details>`
              : ""
          }
        </article>`,
      )
      .join("")}</div>
  </section>`;
}

function renderDeadlineInfo(payload: CasePayload): string {
  const route = payload.routing;
  const subject = payload.case.parcel;
  const noticeDate =
    payload.case.userEvidence.borNoticeDate ?? payload.case.userEvidence.borDecisionDate;
  const location =
    route.venue === "ptab" && noticeDate
      ? `Written BOR notice dated ${dateLabel(noticeDate)}`
      : `${subject.townshipName} township`;
  const timingText = (daysRemaining: number | null): string => {
    if (daysRemaining === null) {
      return "";
    }
    if (daysRemaining === 0) {
      return "Today";
    }
    return daysRemaining > 0 ? `${daysRemaining} days away` : `${Math.abs(daysRemaining)} days ago`;
  };
  const deadlineRows = (route.deadlines ?? [])
    .map(
      (item) => `<div class="deadline-card">
        <span>${escapeHtml(item.label)}</span>
        <strong>${escapeHtml(dateLabel(item.date))}</strong>
        ${item.daysRemaining === null ? "" : `<small>${escapeHtml(timingText(item.daysRemaining))}</small>`}
      </div>`,
    )
    .join("");
  return `<section class="panel deadline-panel" aria-labelledby="deadline-info">
    <div class="section-heading-row">
      <div>
        <p class="eyebrow">Timing</p>
        <h2 id="deadline-info">Deadline status</h2>
      </div>
      <span class="status-pill status-${escapeHtml(route.actionStatus)}">${escapeHtml(route.deadlineLabel ?? route.actionStatus)}</span>
    </div>
    <p class="deadline-headline">${escapeHtml(route.headline)}</p>
    ${
      deadlineRows
        ? `<div class="deadline-cards">${deadlineRows}</div>`
        : `<div class="deadline-unavailable"><strong>${escapeHtml(route.deadlineLabel ?? "Deadline unavailable")}</strong><span>Use the official source below for updates.</span></div>`
    }
    <dl class="compact-facts">
      <div><dt>Venue</dt><dd>${escapeHtml(payload.venue.name)}</dd></div>
      <div><dt>Basis</dt><dd>${escapeHtml(location)}</dd></div>
      <div><dt>Official deadline source</dt><dd>${route.officialUrl ? externalLink(route.officialUrl, "Check official dates") : "Not available"}</dd></div>
      <div><dt>Filing rules</dt><dd>${externalLink(payload.venue.rulesUrl, "Review what to submit")}</dd></div>
    </dl>
    <details class="reasoning-details"><summary>How this status was determined</summary><ul>${route.reasoning
      .map((reason) => `<li>${linkedText(reason)}</li>`)
      .join("")}</ul></details>
  </section>`;
}

function renderMissingEvidenceForm(payload: CasePayload): string {
  const fields = payload.evidence.comparableAnalysis.missingFields;
  if (fields.length === 0) {
    return "";
  }
  return `<section class="panel" aria-labelledby="missing-public-data">
    <h2 id="missing-public-data">Missing public data</h2>
    <p>Some public fields needed for the comparable analysis were missing. If you have reliable values, add only those missing fields and rerun the review.</p>
    <form id="missing-evidence-form" class="stack">
      <div class="evidence-grid">
        ${fields
          .map(
            (field) => `<label>
              <span>${escapeHtml(field.label)}</span>
              <input name="${escapeHtml(field.name)}" inputmode="decimal" required>
              <span class="hint field-help-line">${escapeHtml(field.helpText)}</span>
            </label>`,
          )
          .join("")}
      </div>
      <p class="hint">These values are used only as fallback inputs and will be labeled user-supplied.</p>
      <button type="submit">Rerun with fallback values</button>
    </form>
  </section>`;
}

function renderComparables(payload: CasePayload): string {
  const comps = payload.evidence.comparableAnalysis;
  const land = payload.evidence.landAssessment;
  const officialRules = externalLink(payload.venue.rulesUrl, "See official rules");
  const profileTooltip = infoTooltip(
    "What comparable profile means",
    'A "profile" is the set of matching rules this tool uses to pick similar homes for the specific venue: size, age, neighborhood, and which assessment number is compared, because each venue weighs comparables differently.',
  );
  const similarityTooltip = infoTooltip(
    "What similarity score means",
    "Lower similarity scores mean the comparable is more similar to the subject based on size, age, and distance.",
  );
  const assessmentType = assessmentTypeLabel(comps.profileKey);
  const filteredPool = filterBySimilarity(comps.pool, selectedSimilarityMax);
  const filterValue = similarityFilterValue(selectedSimilarityMax);
  const filterControls =
    comps.pool.length > 0
      ? `<div class="filter-row">
        <label>
          <span>Similarity score threshold</span>
          <select id="similarity-filter">
            ${SIMILARITY_BANDS.map(
              (band) =>
                `<option value="${escapeHtml(band.value)}"${band.value === filterValue ? " selected" : ""}>${escapeHtml(band.label)}</option>`,
            ).join("")}
          </select>
        </label>
        <p class="hint">0.00-0.10 excellent; 0.10-0.20 good; 0.20-0.35 usable; 0.35-0.50 broad match; above 0.50 questionable unless alternatives are sparse. Check every row before using it.</p>
      </div>`
      : "";
  const comparisonToSubject = (avPerSqft: number): string => {
    if (comps.subjectAvPerSqft === null || comps.subjectAvPerSqft <= 0) {
      return '<span class="comparison neutral">Subject unavailable</span>';
    }
    const difference = ((avPerSqft - comps.subjectAvPerSqft) / comps.subjectAvPerSqft) * 100;
    if (Math.abs(difference) < 0.5) {
      return '<span class="comparison neutral">About the same</span>';
    }
    return difference < 0
      ? `<span class="comparison lower">${numberText(Math.abs(difference), 1)}% lower</span>`
      : `<span class="comparison higher">${numberText(difference, 1)}% higher</span>`;
  };
  const rows = filteredPool
    .map(
      (exhibit) => `<tr>
        <td>${escapeHtml(exhibit.comparable.pinFormatted)}</td>
        <td>${exhibit.distanceKm === null ? "Not available" : numberText(exhibit.distanceKm, 2)}</td>
        <td>${escapeHtml(exhibit.comparable.neighborhood ?? "Not available")}</td>
        <td>${escapeHtml(exhibit.comparable.propertyClass ?? "Not available")}</td>
        <td>${numberText(exhibit.comparable.buildingSqft)}</td>
        <td>${escapeHtml(exhibit.comparable.yearBuilt ?? "Not available")}</td>
        <td>${exhibit.comparable.saleDate ? escapeHtml(dateLabel(exhibit.comparable.saleDate)) : "Not available"}</td>
        <td>${dollars(exhibit.comparable.salePrice)}</td>
        <td>${escapeHtml(assessmentType)}</td>
        <td>${dollars(exhibit.avPerSqft)}</td>
        <td>${comparisonToSubject(exhibit.avPerSqft)}</td>
        <td>${numberText(exhibit.similarity, 3)}</td>
      </tr>`,
    )
    .join("");
  const table =
    rows.length === 0
      ? `<p class="empty-state">${comps.pool.length > 0 ? "No selected homes meet the current similarity filter." : "No comparable rows could be selected from the available public data."}</p>`
      : `<div class="table-wrap"><table>
          <caption>${filteredPool.length} selected comparable ${filteredPool.length === 1 ? "home" : "homes"}; rows assessed above the subject are included for transparency.</caption>
          <thead><tr><th>PIN</th><th>Distance km</th><th>Neighborhood</th><th>Property class</th><th>Building sqft</th><th>Year built</th><th>Sale date</th><th>Sale price</th><th>Assessment metric</th><th>${escapeHtml(comps.metricLabel)}/sqft</th><th>Compared with subject</th><th>Similarity score ${similarityTooltip}</th></tr></thead>
          <tbody>${rows}</tbody>
        </table></div>`;
  const evidenceMessage =
    payload.evidence.tier === "LIMITED"
      ? `${escapeHtml(payload.evidence.tierMessage)} ${officialRules}.`
      : escapeHtml(payload.evidence.tierMessage);
  const interpretation =
    comps.poolSize === 0 || comps.gapPct === null
      ? "The available public data is not sufficient to compare the subject with a selected residential pool."
      : comps.gapPct > 0
        ? `The subject is assessed ${numberText(comps.gapPct, 1)}% above the selected-pool median on ${comps.metricLabel}/sqft. That difference may support a closer uniformity review, but each row still needs verification.`
        : comps.gapPct < 0
          ? `The subject is assessed ${numberText(Math.abs(comps.gapPct), 1)}% below the selected-pool median on ${comps.metricLabel}/sqft. These public comparables do not support a lower residential uniformity assessment.`
          : `The subject is aligned with the selected-pool median on ${comps.metricLabel}/sqft, so this screen does not show a residential uniformity gap.`;
  const argumentCards = payload.evidence.arguments.length
    ? payload.evidence.arguments
        .map(
          (argument) => `<article class="argument-card">
            <span class="argument-strength">${escapeHtml(argument.strength)}</span>
            <h4>${escapeHtml(argumentTypeLabel(argument.argumentType))}</h4>
            <p>${escapeHtml(argument.text)}</p>
          </article>`,
        )
        .join("")
    : `<div class="empty-state"><strong>No strong public-data argument was found.</strong><span>This does not rule out condition, appraisal, exemption, or factual-error evidence that is not present in the public data.</span></div>`;
  return `<section class="panel evidence-panel" aria-labelledby="evidence-summary">
    <div class="section-heading-row evidence-heading">
      <div>
        <p class="eyebrow">Public-data screen</p>
        <h2 id="evidence-summary">Evidence summary</h2>
      </div>
      <span class="evidence-level level-${escapeHtml(payload.evidence.tier.toLowerCase())}">${escapeHtml(
        evidenceLevelLabel(payload.evidence.tier),
      )}</span>
    </div>

    <div class="evidence-verdict">
      <h3>What the numbers say</h3>
      <p>${escapeHtml(interpretation)}</p>
      <p class="hint">${evidenceMessage} ${infoTooltip(
        "What evidence level means",
        "The evidence level is a rough screen of how much public data supports spending time on an appeal.",
      )}</p>
    </div>

    <div class="metric-grid" aria-label="Comparable analysis key figures">
      <div><span>Selected homes</span><strong>${numberText(comps.poolSize)}</strong><small>${escapeHtml(comps.scope ?? "Scope unavailable")}</small></div>
      <div><span>Subject ${escapeHtml(comps.metricLabel)}/sqft</span><strong>${dollars(comps.subjectAvPerSqft)}</strong></div>
      <div><span>Pool median</span><strong>${dollars(comps.medianAvPerSqft)}</strong></div>
      <div><span>Subject vs median</span><strong>${comps.gapPct === null ? "Not available" : `${numberText(comps.gapPct, 1)}%`}</strong></div>
    </div>

    <details class="analysis-details">
      <summary>Analysis method and value context</summary>
      <p>${
        comps.status === "ok"
          ? `Comparable analysis completed with the ${escapeHtml(comps.profileLabel)} profile using ${escapeHtml(comps.metricLabel)}/sqft. ${profileTooltip}`
          : escapeHtml(comps.note)
      }</p>
      <p><strong>Total AV:</strong> Shown for value context, overvaluation checks, and savings estimates. It is not used by itself to generate residential uniformity evidence.</p>
      <p><strong>Land check:</strong> ${escapeHtml(land.note)} Subject Land AV/sqft ${dollars(
        land.subjectLandAvPerSqft,
      )}; selected-pool median ${dollars(land.medianLandAvPerSqft)}.</p>
    </details>

    <div class="subsection-heading">
      <div><p class="eyebrow">Comparable detail</p><h3>Selected comparable homes</h3></div>
      <p>All selected rows are shown, not only homes assessed below the subject.</p>
    </div>
    ${filterControls}
    ${table}

    <div class="subsection-heading"><div><p class="eyebrow">Assessment screen</p><h3 class="heading-with-tooltip">Potential appeal arguments ${infoTooltip(
      "What arguments mean",
      "An argument is a distinct reason the assessment may be too high: uniformity, overvaluation, description error, or assessment shock. Strength labels are rough screens, not legal conclusions.",
    )}</h3></div></div>
    <div class="argument-grid">${argumentCards}</div>

    <div class="savings-card">
      <div><p class="eyebrow">If a reduction is supported</p><h3 class="heading-with-tooltip">Rough savings estimate ${infoTooltip(
        "How rough savings are estimated",
        "Estimated savings = ΔAV × E × r, where ΔAV is the assessed-value reduction, E is the state equalizer, and r is the assumed tax rate. The range is shown as ±20% and is not a promise.",
      )}</h3></div>
      <strong>${dollars(payload.evidence.savingsAssumptions.low)} to ${dollars(
        payload.evidence.savingsAssumptions.high,
      )}</strong>
      <span>Point estimate ${dollars(payload.evidence.savingsAssumptions.point)}</span>
    </div>
    <p class="hint">Assumes equalizer ${payload.evidence.savingsAssumptions.stateEqualizer} and ${escapeHtml(
      payload.evidence.savingsAssumptions.taxRateSource,
    )}; this is a rough range, not a promise.</p>
    <p><a href="/methodology">Read the methodology</a></p>
  </section>`;
}

function renderWhatsNext(payload: CasePayload, printQuery: URLSearchParams): string {
  const officialSubmission = externalLink(payload.venue.submissionUrl, "official submission page");
  const officialRules = externalLink(payload.venue.rulesUrl, "official rules and requirements");
  return `<section class="panel" aria-labelledby="whats-next">
    <h2 id="whats-next">What's Next?</h2>
    <p>You can download a PDF summary of the comparative analysis shown above. If you decide to appeal at ${escapeHtml(
      payload.venue.name,
    )}, you can submit that PDF with the other documents the venue requires as part of your evidence.</p>
    <p>Double-check every Appeal Compass finding before filing. This evidence is not a guarantee that an appeal will succeed.</p>
    <p>Other documented factors may also support a property-tax reduction, including condition issues, vacancy, demolition, incorrect property characteristics, recent sale or appraisal evidence, and other factual errors.</p>
    <p>Some homeowners may qualify for exemptions, including homeowner, senior, senior freeze, disability, disabled veteran, returning veteran, home improvement, and long-time occupant exemptions. Verify eligibility on the ${externalLink(
      CCAO_EXEMPTIONS_URL,
      "Cook County Assessor exemptions page",
    )}.</p>
    <p>Before filing, review the ${officialSubmission} and ${officialRules} for exactly what to submit.</p>
    <div class="actions">
      <a class="button-link" href="/print?${printQuery.toString()}">Print / Save as PDF</a>
      <button type="button" id="download-comps" class="secondary">Download comps (.xlsx)</button>
    </div>
  </section>`;
}

function renderResults(payload: CasePayload, query: URLSearchParams): void {
  lastCasePayload = payload;
  lastCaseQuery = new URLSearchParams(query);
  selectedSimilarityMax = parseSimilarityMax(lastCaseQuery.get("maxSimilarity"));
  const storage = browserSessionStorage();
  if (storage) {
    saveAssessmentSnapshot(storage, query, payload);
  }
  const subject = payload.case.parcel;
  const subjectAddress = [subject.address, subject.city, subject.zipCode]
    .filter(Boolean)
    .join(", ");
  const userValues = [
    payload.case.userEvidence.actualSqft
      ? `Actual sqft ${numberText(payload.case.userEvidence.actualSqft)}`
      : "",
    payload.case.userEvidence.actualAv
      ? `Actual AV ${dollars(payload.case.userEvidence.actualAv)}`
      : "",
    payload.case.userEvidence.actualImprovementAv
      ? `Actual improvement AV ${dollars(payload.case.userEvidence.actualImprovementAv)}`
      : "",
  ].filter(Boolean);
  const printQuery = new URLSearchParams(query);
  printQuery.set("pin", subject.pin);

  const results = document.querySelector<HTMLElement>("#results");
  if (!results) {
    return;
  }
  results.innerHTML = `
    <section class="notice"><strong>${escapeHtml(payload.evidence.disclaimers[0])}</strong></section>
    ${renderDeadlineInfo(payload)}

    <section class="subject panel">
      <h2>Subject property</h2>
      <dl>
        <div><dt>PIN</dt><dd>${escapeHtml(subject.pinFormatted)}</dd></div>
        ${subjectAddress ? `<div><dt>Address</dt><dd>${escapeHtml(subjectAddress)}</dd></div>` : ""}
        <div><dt>Class / township</dt><dd>${escapeHtml(subject.propertyClass)} / ${escapeHtml(subject.townshipName)}</dd></div>
        <div><dt>Building sqft</dt><dd>${numberText(subject.buildingSqft)}</dd></div>
        <div><dt>Land sqft</dt><dd>${numberText(subject.landSqft)}</dd></div>
        <div><dt>Assessment year</dt><dd>${numberText(subject.assessmentYear)}</dd></div>
        <div><dt>Total AV</dt><dd>${dollars(subject.currentAv)}</dd></div>
        <div><dt>Improvement AV</dt><dd>${dollars(subject.currentImprovementAv)}</dd></div>
        <div><dt>Land AV</dt><dd>${dollars(subject.currentLandAv)}</dd></div>
      </dl>
      <p class="hint">Total AV is context for value checks and savings estimates. Residential comparable evidence uses Improvement AV/sqft.</p>
      ${
        userValues.length
          ? `<p class="tagline">${escapeHtml(userValues.join("; "))} - user-supplied.</p>`
          : ""
      }
    </section>

    ${noticeList(payload)}

    ${renderMissingEvidenceForm(payload)}

    ${renderComparables(payload)}

    ${renderWhatsNext(payload, printQuery)}
  `;
}

function clearAssessmentSurfaces(): void {
  lastCasePayload = null;
  setFormError("");
  for (const selector of ["#results", "#address-results"]) {
    const target = document.querySelector<HTMLElement>(selector);
    if (target) {
      target.innerHTML = "";
    }
  }
}

async function loadCase(params: URLSearchParams): Promise<void> {
  clearAssessmentSurfaces();
  const stop = startProgress(await queuedProgressMessage());
  try {
    const payload = await fetchJson<CasePayload>(`/api/case?${params.toString()}`);
    clearAssessmentSurfaces();
    renderResults(payload, params);
  } catch (error) {
    const target = document.querySelector<HTMLElement>("#results");
    if (target) {
      target.innerHTML = `<section class="error" role="alert">${escapeHtml(
        error instanceof Error ? error.message : "The case could not be loaded.",
      )}</section>`;
    }
  } finally {
    stop();
    const progress = document.querySelector<HTMLElement>("#progress");
    if (progress) {
      progress.innerHTML = "";
    }
  }
}

async function submitCase(form: HTMLFormElement): Promise<void> {
  if (!validateStepOne(form)) {
    return;
  }
  const params = new URLSearchParams();
  const pin = formValue(form, "pin");
  addOptionalParams(params, form);
  if (pin) {
    params.set("pin", pin);
    await loadCase(params);
    return;
  }
  const target = document.querySelector<HTMLElement>("#results");
  if (target) {
    target.innerHTML = `<section class="error" role="alert">Enter a PIN.</section>`;
  }
}

function setCaseFormFromParams(form: HTMLFormElement, params: URLSearchParams): void {
  for (const element of Array.from(form.elements)) {
    if (
      !(
        element instanceof HTMLInputElement ||
        element instanceof HTMLSelectElement ||
        element instanceof HTMLTextAreaElement
      )
    ) {
      continue;
    }
    if (!element.name) {
      continue;
    }
    const value = params.get(element.name);
    if (element instanceof HTMLInputElement && element.type === "radio") {
      element.checked = value === element.value;
      continue;
    }
    element.value = value ?? "";
  }
  updateConditionalFields(form);
}

function restoreLastAssessment(): void {
  const storage = browserSessionStorage();
  if (!storage) {
    return;
  }
  const snapshot = loadAssessmentSnapshot<CasePayload>(storage);
  if (!snapshot) {
    return;
  }
  const form = document.querySelector<HTMLFormElement>("#case-form");
  if (form) {
    setCaseFormFromParams(form, snapshot.query);
  }
  renderResults(snapshot.payload, snapshot.query);
}

function browserSessionStorage(): Storage | null {
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

async function submitReport(form: HTMLFormElement): Promise<void> {
  if (!REPORTING_ENABLED) {
    setReportStatus(
      "Problem reporting is disabled until the Turnstile site key is configured.",
      true,
    );
    return;
  }
  if (!form.reportValidity()) {
    return;
  }
  const data = new FormData(form);
  const turnstileToken = data.get("cf-turnstile-response");
  setReportStatus("Submitting report...");
  const response = await fetch("/api/report", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      category: data.get("category"),
      description: data.get("description"),
      context: data.get("context"),
      turnstileToken: typeof turnstileToken === "string" ? turnstileToken : "",
    }),
  });
  const result = (await response.json()) as
    | { ok: true; issueUrl: string }
    | { ok: false; error?: { message?: string } };
  if (!response.ok || !result.ok) {
    setReportStatus(
      result.ok
        ? "The report could not be submitted."
        : (result.error?.message ?? "The report could not be submitted."),
      true,
    );
    return;
  }
  setReportStatus(`Report submitted: ${result.issueUrl}`);
  form.reset();
}

async function submitContact(form: HTMLFormElement): Promise<void> {
  if (!CONTACT_ENABLED) {
    setContactStatus("Contact is disabled until the Turnstile site key is configured.", true);
    return;
  }
  if (!form.reportValidity()) {
    return;
  }
  const data = new FormData(form);
  const topic = data.get("topic");
  const turnstileToken = data.get("cf-turnstile-response");
  setContactStatus("Sending message...");
  const response = await fetch("/api/contact", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      topic: data.get("topic"),
      name: data.get("name"),
      email: data.get("email"),
      message: data.get("message"),
      turnstileToken: typeof turnstileToken === "string" ? turnstileToken : "",
    }),
  });
  const result = (await response.json()) as
    | { ok: true; message?: string }
    | { ok: false; error?: { message?: string } };
  if (!response.ok || !result.ok) {
    setContactStatus(
      result.ok
        ? "The message could not be sent."
        : (result.error?.message ?? "The message could not be sent."),
      true,
    );
    return;
  }
  setContactStatus(result.message ?? "Message sent.");
  form.reset();
  const topicInput = form.querySelector<HTMLInputElement>("#contact-topic");
  if (topicInput && typeof topic === "string") {
    topicInput.value = topic;
  }
}

function updateSimilarityFilter(value: string): void {
  if (!lastCasePayload || !lastCaseQuery) {
    return;
  }
  const max = parseSimilarityMax(value);
  if (max === null) {
    lastCaseQuery.delete("maxSimilarity");
  } else {
    lastCaseQuery.set("maxSimilarity", similarityFilterValue(max));
  }
  renderResults(lastCasePayload, lastCaseQuery);
}

function submitMissingEvidence(form: HTMLFormElement): void {
  if (!lastCaseQuery || !form.reportValidity()) {
    return;
  }
  const params = new URLSearchParams(lastCaseQuery);
  for (const element of Array.from(form.elements)) {
    if (!(element instanceof HTMLInputElement) || !element.name) {
      continue;
    }
    const value = element.value.trim();
    if (value) {
      params.set(element.name, value);
    }
  }
  void loadCase(params);
}

function closeTooltips(except: HTMLButtonElement | null = null): void {
  for (const button of Array.from(
    document.querySelectorAll<HTMLButtonElement>(".tooltip-toggle"),
  )) {
    if (button === except) {
      continue;
    }
    const bubbleId = button.getAttribute("aria-describedby");
    const bubble = bubbleId ? document.getElementById(bubbleId) : null;
    button.setAttribute("aria-expanded", "false");
    if (bubble) {
      bubble.removeAttribute("style");
    }
  }
}

function positionTooltip(button: HTMLButtonElement, bubble: HTMLElement): void {
  bubble.removeAttribute("style");
  const rect = button.getBoundingClientRect();
  const viewportPadding = 16;
  const maxWidth = Math.min(304, window.innerWidth - viewportPadding * 2);
  bubble.style.position = "fixed";
  bubble.style.width = `${maxWidth}px`;
  bubble.style.transform = "none";
  const bubbleHeight = bubble.offsetHeight;
  const preferredTop = rect.top - bubbleHeight - 8;
  const fallbackTop = rect.bottom + 8;
  const top =
    preferredTop >= viewportPadding
      ? preferredTop
      : Math.min(fallbackTop, window.innerHeight - bubbleHeight - viewportPadding);
  const centeredLeft = rect.left + rect.width / 2 - maxWidth / 2;
  const left = Math.max(
    viewportPadding,
    Math.min(centeredLeft, window.innerWidth - maxWidth - viewportPadding),
  );
  bubble.style.position = "fixed";
  bubble.style.inset = `${Math.max(viewportPadding, top)}px auto auto ${left}px`;
}

function toggleTooltip(button: HTMLButtonElement): void {
  const bubbleId = button.getAttribute("aria-describedby");
  const bubble = bubbleId ? document.getElementById(bubbleId) : null;
  if (!bubble) {
    return;
  }
  const willOpen = button.getAttribute("aria-expanded") !== "true";
  closeTooltips(willOpen ? button : null);
  button.setAttribute("aria-expanded", String(willOpen));
  if (willOpen) {
    positionTooltip(button, bubble);
  } else {
    bubble.removeAttribute("style");
  }
}

function downloadComparableWorkbook(): void {
  if (!lastCasePayload) {
    return;
  }
  const workbook = buildComparableWorkbook(lastCasePayload, selectedSimilarityMax);
  const workbookBuffer = new ArrayBuffer(workbook.byteLength);
  new Uint8Array(workbookBuffer).set(workbook);
  const blob = new Blob([workbookBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = comparableWorkbookFilename(lastCasePayload);
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

if (IS_METHODOLOGY_PAGE) {
  methodologyPage();
} else {
  shell();
}

const form = document.querySelector<HTMLFormElement>("#case-form");
if (form) {
  updateConditionalFields(form);
}

document.addEventListener("submit", (event) => {
  const form = event.target;
  if (form instanceof HTMLFormElement && form.id === "case-form") {
    event.preventDefault();
    void submitCase(form);
  }
  if (form instanceof HTMLFormElement && form.id === "report-form") {
    event.preventDefault();
    void submitReport(form);
  }
  if (form instanceof HTMLFormElement && form.id === "contact-form") {
    event.preventDefault();
    void submitContact(form);
  }
  if (form instanceof HTMLFormElement && form.id === "missing-evidence-form") {
    event.preventDefault();
    submitMissingEvidence(form);
  }
});

document.addEventListener("change", (event) => {
  const target = event.target;
  if (
    target instanceof HTMLInputElement ||
    target instanceof HTMLSelectElement ||
    target instanceof HTMLTextAreaElement
  ) {
    const activeForm = target.form;
    if (activeForm?.id === "case-form") {
      setFormError("");
      updateConditionalFields(activeForm);
    }
    if (target instanceof HTMLSelectElement && target.id === "similarity-filter") {
      updateSimilarityFilter(target.value);
    }
  }
});

document.addEventListener("click", (event) => {
  const target = event.target;
  if (target instanceof HTMLElement) {
    const tooltipButton = target.closest<HTMLButtonElement>(".tooltip-toggle");
    if (tooltipButton) {
      toggleTooltip(tooltipButton);
      return;
    }
    closeTooltips();
  }
  if (target instanceof HTMLElement && target.id === "download-comps") {
    downloadComparableWorkbook();
  }
  if (target instanceof HTMLElement && target.id === "report-problem") {
    openReportPanel();
  }
  if (
    target instanceof HTMLElement &&
    (target.id === "close-report" || target.id === "report-panel")
  ) {
    closeReportPanel();
  }
  if (target instanceof HTMLElement && target.id === "open-contact-from-refusal") {
    event.preventDefault();
    closeEntityRefusalPanel();
    openContactPanel("commercial_interest");
  }
  if (target instanceof HTMLElement && target.id === "open-commercial-interest") {
    event.preventDefault();
    openContactPanel("commercial_interest");
  }
  if (target instanceof HTMLElement && target.id === "suggest-feature") {
    openContactPanel("feature_suggestion");
  }
  if (
    target instanceof HTMLElement &&
    (target.id === "close-entity-refusal" || target.id === "entity-refusal-panel")
  ) {
    closeEntityRefusalPanel();
  }
  if (
    target instanceof HTMLElement &&
    (target.id === "close-contact" || target.id === "contact-panel")
  ) {
    closeContactPanel();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeTooltips();
    closeReportPanel();
    closeEntityRefusalPanel();
    closeContactPanel();
  }
});

window.addEventListener("pageshow", (event) => {
  if (event.persisted && !IS_METHODOLOGY_PAGE) {
    restoreLastAssessment();
  }
});

if (!IS_METHODOLOGY_PAGE) {
  restoreLastAssessment();
}

document.documentElement.dataset.enhanced = "true";

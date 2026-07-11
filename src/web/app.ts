import {
  BOR_DATES_URL,
  CCAO_OFFICIAL_URL,
  CCAO_WINDOWS,
  type FilingWindow,
  PTAB_OFFICIAL_URL,
} from "../domain/config";
import type {
  ComparableExhibit,
  EvidenceCandidate,
  EvidenceStatus,
  EvidenceType,
  FieldProvenance,
  Parcel,
  ProofType,
  SavingsCalculation,
  SavingsMethod,
  SimilarityBandName,
  SimilarityGroupSummary,
  SubjectCorrection,
  SubjectField,
  SubjectValueEvidence,
} from "../domain/models";
import { formatPropertyClass } from "../domain/propertyClasses";
import { TURNSTILE_SITE_KEY } from "../domain/publicConfig";
import { SIMILARITY_BANDS } from "../domain/similarityBands";
import { PROOF_TYPES, PROOF_TYPE_LABELS, SUBJECT_FIELD_LABELS } from "../domain/subjectCorrections";
import type { AnalysisPayload, AnalysisRequest, SubjectPayload } from "../worker/casePayload";
import { paginateComparables } from "./comparablePagination";
import { fastSelectComparablePins, filterAndSortComparables } from "./comparableTable";
import {
  type AppSessionState,
  type ComparableTableState,
  loadSessionState,
  saveSessionState,
} from "./sessionState";
import { buildComparableWorkbook, comparableWorkbookFilename } from "./xlsx";

interface ApiError {
  ok: false;
  error: { kind: string; message: string };
}

class ApiRequestError extends Error {
  constructor(readonly detail: ApiError["error"]) {
    super(detail.message);
  }
}

const app = document.querySelector<HTMLDivElement>("#app");
if (!app) throw new Error("Missing app root.");
const root = app;
const IS_METHODOLOGY_PAGE = window.location.pathname === "/methodology";
const COOK_PROPERTY_TAX_PORTAL_URL = "https://www.cookcountypropertyinfo.com/";
const ENTITY_REFUSAL_MESSAGE =
  "Appeal Compass is designed only for individual residential homeowners appealing their own home; if interested in a similar tool for commercial properties please reach out here.";
const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const DEFAULT_TABLE: ComparableTableState = {
  bands: ["excellent", "good", "decent", "broad"],
  saleFilter: "all",
  propertyClass: "",
  neighborhood: "",
  maxDistanceKm: null,
  yearBuiltTolerance: null,
  sortKey: "similarity",
  sortDirection: "asc",
  page: 1,
  pageSize: 10,
};

type State = Omit<AppSessionState<SubjectPayload, AnalysisPayload>, "schemaVersion" | "savedAt">;
let state: State = {
  stepOneQuery: "",
  screen: "step_one",
  subjectPayload: null,
  corrections: [],
  valueEvidence: null,
  analysisPayload: null,
  analysisRevision: 0,
  table: { ...DEFAULT_TABLE, bands: [...DEFAULT_TABLE.bands] },
  selectedComparablePins: [],
  savingsMethods: [],
  packetEvidenceTypes: [],
};
let showCorrectionForm = false;
let savingsCalculated = false;
let packetFormOpen = false;
let correctionRowCounter = 0;

function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
function dollars(value: number | null): string {
  return value === null || Number.isNaN(value) ? "Unavailable" : money.format(value);
}
function numberText(value: number | null, digits = 0): string {
  return value === null || Number.isNaN(value)
    ? "Unavailable"
    : value.toLocaleString("en-US", { maximumFractionDigits: digits });
}
function dateLabel(value: string): string {
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        timeZone: "UTC",
      });
}
function externalLink(url: string, label: string): string {
  return `<a href="${escapeHtml(url)}" target="_blank" rel="noreferrer">${escapeHtml(label)}<span class="sr-only"> (opens in new tab)</span></a>`;
}
function currentStorage(): Storage | null {
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}
function persist(): void {
  const storage = currentStorage();
  if (storage) saveSessionState(storage, state);
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: { accept: "application/json", ...(init?.headers ?? {}) },
  });
  const data = (await response.json()) as T | ApiError;
  if (!response.ok || (data && typeof data === "object" && "ok" in data && data.ok === false)) {
    throw new ApiRequestError(
      (data as ApiError).error ?? { kind: "request", message: "The request failed." },
    );
  }
  return data as T;
}

function formValue(form: HTMLFormElement, name: string): string {
  const value = new FormData(form).get(name);
  return typeof value === "string" ? value.trim() : "";
}

function githubLogo(): string {
  return `<svg aria-hidden="true" class="github-mark" viewBox="0 0 16 16" width="20" height="20"><path fill="currentColor" d="M8 0C3.58 0 0 3.67 0 8.2c0 3.62 2.29 6.69 5.47 7.78.4.08.55-.18.55-.39 0-.19-.01-.84-.01-1.53-2.01.38-2.53-.5-2.69-.96-.09-.24-.48-.96-.82-1.16-.28-.16-.68-.55-.01-.56.63-.01 1.08.59 1.23.84.72 1.24 1.87.89 2.33.68.07-.53.28-.89.51-1.09-1.78-.21-3.64-.91-3.64-4.04 0-.89.31-1.62.82-2.19-.08-.21-.36-1.04.08-2.16 0 0 .67-.22 2.2.84A7.43 7.43 0 0 1 8 3.98c.68 0 1.36.09 2 .28 1.53-1.06 2.2-.84 2.2-.84.44 1.12.16 1.95.08 2.16.51.57.82 1.3.82 2.19 0 3.14-1.87 3.83-3.65 4.04.29.26.54.76.54 1.54 0 1.11-.01 2-.01 2.27 0 .21.15.47.55.39A8.08 8.08 0 0 0 16 8.2C16 3.67 12.42 0 8 0Z"/></svg>`;
}
function header(): string {
  return `<header class="topline"><div class="topline-head"><h1>Appeal Compass</h1><a class="header-icon-link" href="https://github.com/tommasodesantis/appealcompass" target="_blank" rel="noreferrer">${githubLogo()}<span>View on GitHub</span></a></div><p class="tool-description">Explore residential property-tax appeal evidence with public data and documented corrections. Every result is a screening result, not a guarantee.</p></header>`;
}

function allWindowsClosed(windows: FilingWindow[], today: string): boolean {
  return windows.length > 0 && windows.every((window) => today > window.closes);
}
function clientTodayIso(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}
function venuePicker(): string {
  const stale = allWindowsClosed(Object.values(CCAO_WINDOWS).flat(), clientTodayIso());
  return `<fieldset class="question-group venue-picker"><legend>Where do you want to appeal?</legend>
    <div class="venue-options">
      <div class="venue-option"><label class="venue-choice"><input type="radio" name="venue" value="assessor" required><span>Cook County Assessor${stale ? " — verify current dates" : ""}</span></label><details><summary>About the Assessor path</summary><p>First-level Cook County appeal. Official source: ${externalLink(CCAO_OFFICIAL_URL, "Assessor calendar")}.</p></details></div>
      <div class="venue-option"><label class="venue-choice"><input type="radio" name="venue" value="bor" required><span>Cook County Board of Review</span></label><details><summary>About the BOR path</summary><p>Second-level Cook County appeal. Tax Year 2026 dates are not published yet. Official source: ${externalLink(BOR_DATES_URL, "BOR dates")}</p></details></div>
      <div class="venue-option"><label class="venue-choice"><input type="radio" name="venue" value="ptab" required><span>Illinois PTAB</span></label><details><summary>About the PTAB path</summary><p>State appeal after a written BOR decision. Official source: ${externalLink(PTAB_OFFICIAL_URL, "Illinois PTAB")}</p></details></div>
    </div></fieldset>`;
}

function stepOnePanel(): string {
  return `<section id="step-one-panel" class="panel" aria-labelledby="step-one"><h2 id="step-one">Find the property</h2>
    <form id="case-form" class="stack"><div id="form-error" aria-live="polite"></div>
      <label><span>Jurisdiction</span><select name="jurisdiction" required><option value="cook_county_il" selected>Cook County, Illinois</option></select></label>
      <p class="hint">More jurisdictions will be added.</p>
      <label><span>PIN</span><input name="pin" autocomplete="off" inputmode="numeric" placeholder="03-00-000-000-0001" required></label>
      <p class="hint">Don't know your PIN? Use the ${externalLink(COOK_PROPERTY_TAX_PORTAL_URL, "Cook County Property Tax Portal")}.</p>
      ${venuePicker()}
      <fieldset class="question-group"><legend>Who owns the property?</legend><label><span class="sr-only">Who owns the property?</span><select name="ownershipType" required><option value="">Choose ownership type</option><option value="individual">Individual</option><option value="llc">LLC</option><option value="corporation">Corporation</option><option value="other">Other entity</option></select></label></fieldset>
      <fieldset class="question-group" id="ptab-notice" hidden><legend>PTAB timing</legend><p>Have you received the written Board of Review decision notice?</p><div class="choice-row"><label><input type="radio" name="borNoticeReceived" value="yes"><span>Yes</span></label><label><input type="radio" name="borNoticeReceived" value="no"><span>No</span></label></div><label id="ptab-date" hidden><span>Date on the written BOR decision notice</span><input name="borNoticeDate" type="date"></label></fieldset>
      <div class="actions"><button type="submit">Review my case</button></div>
    </form></section>`;
}

function footerAndModals(): string {
  const feedbackDisabled = TURNSTILE_SITE_KEY ? "" : " disabled";
  return `<footer class="site-footer"><strong>Appeal Compass</strong><nav class="footer-links"><a href="/methodology">Read the methodology</a><button type="button" class="link-button" id="open-feedback">Suggest a feature or report a problem</button></nav></footer>
    <section id="entity-modal" class="modal-panel" hidden><div class="modal-card" role="dialog" aria-modal="true"><button type="button" class="secondary close-button" data-close="entity-modal">Close</button><h2>Residential homeowners only</h2><p>${escapeHtml(ENTITY_REFUSAL_MESSAGE)}</p></div></section>
    <section id="feedback-modal" class="modal-panel" hidden><div class="modal-card" role="dialog" aria-modal="true"><button type="button" class="secondary close-button" data-close="feedback-modal">Close</button><h2>Report a problem or request a feature</h2><form id="report-form" class="stack"><label><span>Category</span><select name="category" required${feedbackDisabled}><option value="">Choose</option><option value="wrong_deadline">Wrong deadline</option><option value="wrong_jurisdiction">Wrong jurisdiction info</option><option value="wrong_comparables">Wrong comparables</option><option value="wrong_assessment_data">Wrong assessment data</option><option value="feature_request">Feature request</option></select></label><label><span>Description</span><textarea name="description" required maxlength="4000"${feedbackDisabled}></textarea></label>${TURNSTILE_SITE_KEY ? `<div class="cf-turnstile" data-sitekey="${escapeHtml(TURNSTILE_SITE_KEY)}" data-action="feedback"></div>` : `<p class="hint">Feedback is not configured.</p>`}<div id="report-status" aria-live="polite"></div><button type="submit"${feedbackDisabled}>Submit feedback</button></form></div></section>`;
}

function shell(): void {
  root.innerHTML = `${header()}${stepOnePanel()}<div id="progress" aria-live="polite"></div><div id="workspace"></div>${footerAndModals()}`;
}

function showProgress(message: string): void {
  const target = document.querySelector<HTMLElement>("#progress");
  if (target)
    target.innerHTML = message
      ? `<section class="progress"><p>${escapeHtml(message)}</p></section>`
      : "";
}
function setFormError(message: string): void {
  const target = document.querySelector<HTMLElement>("#form-error");
  if (target)
    target.innerHTML = message
      ? `<section class="error inline-error" role="alert">${escapeHtml(message)}</section>`
      : "";
}
function updateStepOneConditional(form: HTMLFormElement): void {
  const venue = new FormData(form).get("venue");
  const ptab = document.querySelector<HTMLElement>("#ptab-notice");
  if (ptab) ptab.hidden = venue !== "ptab";
  const received = new FormData(form).get("borNoticeReceived") === "yes";
  const date = document.querySelector<HTMLElement>("#ptab-date");
  if (date) date.hidden = venue !== "ptab" || !received;
  const noticeInputs = ptab ? Array.from(ptab.querySelectorAll<HTMLInputElement>("input")) : [];
  for (const input of noticeInputs)
    input.required = venue === "ptab" && (input.name !== "borNoticeDate" || received);
}

function proofOptions(selected: ProofType | null = null): string {
  return `<option value="">Choose proof type</option>${PROOF_TYPES.map((proof) => `<option value="${proof}"${proof === selected ? " selected" : ""}>${escapeHtml(PROOF_TYPE_LABELS[proof])}</option>`).join("")}`;
}
function fieldOptions(selected: SubjectField | null): string {
  return `<option value="">Choose field</option>${(Object.keys(SUBJECT_FIELD_LABELS) as SubjectField[]).map((field) => `<option value="${field}"${field === selected ? " selected" : ""}>${escapeHtml(SUBJECT_FIELD_LABELS[field])}</option>`).join("")}`;
}
function manualCorrections(): SubjectCorrection[] {
  return state.corrections.filter((correction) => correction.provenance !== "derived");
}
function correctionRow(correction?: SubjectCorrection): string {
  correctionRowCounter += 1;
  const id = correctionRowCounter;
  return `<fieldset class="correction-row" data-row="${id}"><legend>Correction</legend><div class="correction-grid">
    <label><span>Field</span><select name="correctionField" required>${fieldOptions(correction?.field ?? null)}</select></label>
    <label><span>Corrected value</span><input name="correctionValue" value="${escapeHtml(correction?.value ?? "")}" required></label>
    <label><span>Proof type</span><select name="correctionProof" required>${proofOptions(correction?.proofType ?? null)}</select></label>
    <label><span>Other proof description</span><input name="correctionOther" maxlength="160" value="${escapeHtml(correction?.otherProofDescription ?? "")}"></label>
    <label><span>If changing one AV component</span><select name="reconciliation"><option value="manual"${correction?.reconciliation !== "automatic" ? " selected" : ""}>Enter the other component manually</option><option value="automatic"${correction?.reconciliation === "automatic" ? " selected" : ""}>Automatically recalculate the other component</option></select></label>
  </div><button type="button" class="secondary remove-correction">Remove</button></fieldset>`;
}

function displayValue(parcel: Parcel, field: SubjectField): string {
  const value = parcel[field];
  if (field === "propertyClass") return formatPropertyClass(String(value)) || "Missing";
  if (field === "currentAv" || field === "currentImprovementAv" || field === "currentLandAv")
    return dollars(typeof value === "number" ? value : null);
  return value === null || value === ""
    ? "Missing"
    : typeof value === "number"
      ? numberText(value)
      : String(value);
}
function provenanceLabel(value: FieldProvenance): string {
  return value === "user_corrected"
    ? "corrected"
    : value === "user_added"
      ? "added"
      : value === "derived"
        ? "derived"
        : "";
}

function effectiveSubject(): { parcel: Parcel; provenance: Record<SubjectField, FieldProvenance> } {
  if (state.analysisPayload) {
    return {
      parcel: state.analysisPayload.analysis.subject.effectiveParcel,
      provenance: state.analysisPayload.analysis.subject.provenance,
    };
  }
  const parcel = state.subjectPayload?.subject.publicParcel;
  if (!parcel) throw new Error("Subject is unavailable.");
  return {
    parcel,
    provenance: Object.fromEntries(
      (Object.keys(SUBJECT_FIELD_LABELS) as SubjectField[]).map((field) => [field, "public"]),
    ) as Record<SubjectField, FieldProvenance>,
  };
}

function renderSubjectReview(): void {
  const payload = state.subjectPayload;
  if (!payload) return;
  const { parcel, provenance } = effectiveSubject();
  const blocking =
    state.analysisPayload?.analysis.subject.blockingMissingFields ??
    payload.subject.blockingMissingFields;
  const optional =
    state.analysisPayload?.analysis.subject.optionalMissingFields ??
    payload.subject.optionalMissingFields;
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
  const cards = payload.subject.propertyCards;
  const changeRows = manualCorrections();
  const correctionHtml = changeRows.length
    ? changeRows.map((correction) => correctionRow(correction)).join("")
    : blocking
        .map((field) => correctionRow({ field, value: "", proofType: null } as SubjectCorrection))
        .join("");
  const workspace = document.querySelector<HTMLElement>("#workspace");
  const step = document.querySelector<HTMLElement>("#step-one-panel");
  if (step) step.hidden = true;
  if (!workspace) return;
  workspace.innerHTML = `<section class="panel subject-review" aria-labelledby="subject-review-heading">
    <h2 id="subject-review-heading">Subject property: review found data</h2>
    <dl class="subject-review-grid">${fields.map((field) => `<div><dt>${escapeHtml(SUBJECT_FIELD_LABELS[field])}</dt><dd>${escapeHtml(displayValue(parcel, field))}${provenance[field] !== "public" ? `<small class="provenance-label">${escapeHtml(provenanceLabel(provenance[field]))}</small>` : ""}</dd></div>`).join("")}</dl>
    ${cards.length > 1 ? `<div class="multicard-note"><p>Multiple property cards were combined for this parcel. Building area was added across cards; parcel land was counted once.</p><div class="table-wrap"><table><thead><tr><th>Card number</th><th>Property class</th><th>Building sqft</th><th>Year built</th></tr></thead><tbody>${cards.map((card) => `<tr><td>${escapeHtml(card.cardNumber)}</td><td>${escapeHtml(formatPropertyClass(card.propertyClass) || "Unavailable")}</td><td>${numberText(card.buildingSqft)}</td><td>${numberText(card.yearBuilt)}</td></tr>`).join("")}</tbody></table></div></div>` : ""}
    ${blocking.length || optional.length ? `<div class="missing-summary">${blocking.length ? `<p><strong>Needed to continue:</strong> ${blocking.map((field) => SUBJECT_FIELD_LABELS[field]).join(", ")}.</p>` : ""}${optional.length ? `<p><strong>Optional or needed only for some calculations:</strong> ${optional.map((field) => SUBJECT_FIELD_LABELS[field]).join(", ")}.</p>` : ""}</div>` : ""}
    <details class="value-evidence-details"${state.valueEvidence ? " open" : ""}><summary>Add a recent purchase or appraisal</summary><form id="value-evidence-form" class="stack"><div class="correction-grid"><label><span>Evidence type</span><select name="valueType"><option value="">None</option><option value="purchase"${state.valueEvidence?.type === "purchase" ? " selected" : ""}>Purchase</option><option value="appraisal"${state.valueEvidence?.type === "appraisal" ? " selected" : ""}>Appraisal</option></select></label><label><span>Purchase price or appraisal value</span><input name="valueAmount" type="number" min="1" value="${escapeHtml(state.valueEvidence?.value ?? "")}"></label><label><span>Purchase date or appraisal effective date</span><input name="valueDate" type="date" value="${escapeHtml(state.valueEvidence?.date ?? "")}"></label><label><span>Proof type</span><select name="valueProof">${proofOptions(state.valueEvidence?.proofType ?? null)}</select></label><label><span>Other proof description</span><input name="valueOther" maxlength="160" value="${escapeHtml(state.valueEvidence?.otherProofDescription ?? "")}"></label></div></form></details>
    <div id="subject-error" aria-live="polite"></div>
    <div class="actions">${blocking.length ? `<button type="button" id="open-corrections">Provide missing data</button>` : `<button type="button" id="confirm-subject">All correct. Continue</button><button type="button" id="open-corrections" class="secondary">I want to correct something</button>`}</div>
    <form id="correction-form" class="stack"${showCorrectionForm ? "" : " hidden"}><h3>Correct or add subject data</h3><div id="correction-rows">${correctionHtml}</div><button type="button" class="secondary" id="add-correction">Add another correction</button><p class="notice">You will need to provide the selected proof with your appeal package. Appeal Compass does not collect documents.</p><button type="submit">Confirm subject data and continue</button></form>
  </section>`;
}

function collectValueEvidence(): SubjectValueEvidence | null {
  const form = document.querySelector<HTMLFormElement>("#value-evidence-form");
  if (!form) return state.valueEvidence;
  const type = formValue(form, "valueType");
  const value = formValue(form, "valueAmount");
  const date = formValue(form, "valueDate");
  const proof = formValue(form, "valueProof") as ProofType;
  if (!type && !value && !date && !proof) return null;
  if ((type !== "purchase" && type !== "appraisal") || !value || !date || !proof) {
    throw new Error("Enter the evidence type, value, date, and proof type together.");
  }
  const otherProofDescription = formValue(form, "valueOther") || null;
  if (proof === "other_documented_proof" && !otherProofDescription)
    throw new Error("Describe the other documented proof.");
  return { type, value: Number(value), date, proofType: proof, otherProofDescription };
}

function collectCorrections(): SubjectCorrection[] {
  const rows = Array.from(document.querySelectorAll<HTMLElement>(".correction-row"));
  return rows.map((row) => {
    const select = (name: string) =>
      (
        row.querySelector(`[name="${name}"]`) as HTMLInputElement | HTMLSelectElement | null
      )?.value.trim() ?? "";
    const field = select("correctionField") as SubjectField;
    const proofType = select("correctionProof") as ProofType;
    if (!field || !select("correctionValue") || !proofType)
      throw new Error("Complete every correction field, value, and proof type.");
    const otherProofDescription = select("correctionOther") || null;
    if (proofType === "other_documented_proof" && !otherProofDescription)
      throw new Error("Describe each Other documented proof selection.");
    return {
      field,
      value: select("correctionValue"),
      proofType,
      otherProofDescription,
      reconciliation: select("reconciliation") === "automatic" ? "automatic" : "manual",
    };
  });
}

function analysisRequest(): AnalysisRequest {
  const subject = state.subjectPayload;
  if (!subject) throw new Error("Start with a subject lookup.");
  return {
    pin: subject.subject.publicParcel.pin,
    stepOne: subject.stepOne,
    corrections: state.corrections,
    valueEvidence: state.valueEvidence,
    revision: state.analysisRevision + 1,
  };
}

async function confirmSubject(useForm: boolean): Promise<void> {
  const errorTarget = document.querySelector<HTMLElement>("#subject-error");
  try {
    state.valueEvidence = collectValueEvidence();
    if (useForm) state.corrections = collectCorrections();
    const hadAnalysis = state.analysisPayload !== null;
    showProgress("Refreshing comparables and calculations with the confirmed subject data...");
    const request = analysisRequest();
    const demo = state.subjectPayload?.demo ? "?demo=1" : "";
    const payload = await fetchJson<AnalysisPayload>(`/api/analysis${demo}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(request),
    });
    state.analysisPayload = payload;
    state.analysisRevision = payload.analysis.revision;
    state.corrections = payload.analysis.subject.corrections;
    state.screen = "analysis";
    state.table = { ...DEFAULT_TABLE, bands: [...DEFAULT_TABLE.bands] };
    state.selectedComparablePins = [];
    state.savingsMethods = [];
    state.packetEvidenceTypes = [];
    savingsCalculated = false;
    packetFormOpen = false;
    persist();
    renderAnalysis(
      hadAnalysis ? "Downstream results were refreshed because the subject data changed." : "",
    );
  } catch (error) {
    if (errorTarget)
      errorTarget.innerHTML = `<section class="error" role="alert">${escapeHtml(error instanceof Error ? error.message : "The subject could not be confirmed.")}</section>`;
  } finally {
    showProgress("");
  }
}

function relation(value: number | null): string {
  if (value === null) return "Unavailable";
  if (Math.abs(value) < 0.05) return "Equal to comparison median";
  return `${numberText(Math.abs(value), 1)}% ${value > 0 ? "above" : "below"}`;
}
function groupRows(
  groups: Record<string, SimilarityGroupSummary>,
  metric: keyof SimilarityGroupSummary,
  formatter: (value: number | null) => string,
): string {
  return (["top25", "top50", "top75"] as const)
    .map(
      (key) =>
        `<li>${formatter(groups[key]?.[metric] as number | null)} — ${escapeHtml(groups[key]?.label ?? key)}</li>`,
    )
    .join("");
}
function summaryCards(payload: AnalysisPayload): string {
  const summary = payload.analysis.comparableSummary;
  const groups = summary.groups;
  const corrected = (Object.keys(payload.analysis.subject.provenance) as SubjectField[]).filter(
    (field) => payload.analysis.subject.provenance[field] !== "public",
  );
  const correctedList = corrected.length
    ? `<ul>${corrected.map((field) => `<li>${escapeHtml(SUBJECT_FIELD_LABELS[field])}: ${escapeHtml(displayValue(payload.analysis.subject.effectiveParcel, field))} — ${escapeHtml(provenanceLabel(payload.analysis.subject.provenance[field]))}</li>`).join("")}</ul>`
    : "<p>No subject property data was added or corrected.</p>";
  const recent = (key: "top25" | "top50" | "top75") =>
    `${groups[key].recentSaleCount} of ${groups[key].label}`;
  return `<div class="summary-grid">
    <article class="summary-card"><strong>${summary.universe.length} comparable homes found</strong><ul><li>${summary.bandCounts.excellent} excellent comps</li><li>${summary.bandCounts.good} good comps</li><li>${summary.bandCounts.decent} decent comps</li><li>${summary.bandCounts.broad} broad comps</li></ul><details><summary>See how comps similarity is calculated</summary><p>Lower means more similar. The score weights building-size difference 50%, year-built difference 30%, and distance 20%. Missing size receives the full size penalty; missing year receives half the age penalty; missing distance uses a neutral 1 km fallback. Excellent is 0.00–0.10, Good is >0.10–0.20, Decent is >0.20–0.35, and Broad is >0.35–0.50. Broad rows do not drive savings calculations.</p></details></article>
    <article class="summary-card"><strong>${dollars(groups.all.medianImprovementAvPerSqft)} median Improvement AV/sqft</strong><ul>${groupRows(groups, "medianImprovementAvPerSqft", dollars)}</ul></article>
    <article class="summary-card"><strong>${dollars(summary.subjectImprovementAvPerSqft)} subject Improvement AV/sqft</strong><ul>${groupRows(groups, "subjectImprovementComparisonPct", relation)}</ul></article>
    <article class="summary-card"><strong>${groups.all.recentSaleCount} comps have sales within 3 years of the assessment date</strong><ul><li>${recent("top25")}</li><li>${recent("top50")}</li><li>${recent("top75")}</li></ul></article>
    <article class="summary-card"><strong>${groups.all.medianRecentSalePricePerSqft === null ? "Insufficient recent sales" : `${dollars(groups.all.medianRecentSalePricePerSqft)} median recent sale price/sqft`}</strong><p class="hint">Unadjusted screening measure.</p><ul>${groupRows(groups, "medianRecentSalePricePerSqft", (value) => (value === null ? "Insufficient recent sales" : dollars(value)))}</ul></article>
    <article class="summary-card"><strong>${dollars(summary.subjectImpliedMarketValue)} subject implied market value</strong><ul>${groupRows(groups, "impliedMarketValueComparisonPct", (value) => (value === null ? "Insufficient recent sales" : `${relation(value)} preliminary value`))}</ul><p class="hint">Comparable-sales values are unadjusted screening estimates, not appraisals.</p></article>
    <article class="summary-card"><strong>${groups.all.medianLandAvPerSqft === null ? "Insufficient land data" : `${dollars(groups.all.medianLandAvPerSqft)} median Land AV/sqft`}</strong><ul>${groupRows(groups, "medianLandAvPerSqft", (value) => (value === null ? "Insufficient land data" : dollars(value)))}</ul></article>
    <article class="summary-card"><strong>${dollars(summary.subjectLandAvPerSqft)} subject Land AV/sqft</strong><ul>${groupRows(groups, "subjectLandComparisonPct", (value) => (value === null ? "Unavailable" : relation(value)))}</ul></article>
    <article class="summary-card"><strong>${corrected.length} subject property fields added or corrected</strong>${correctedList}</article>
  </div>`;
}

function filterControls(
  payload: AnalysisPayload,
  filtered: ComparableExhibit[],
  totalPages: number,
): string {
  const classes = [
    ...new Set(
      payload.analysis.comparableSummary.universe
        .map((row) => row.comparable.propertyClass)
        .filter(Boolean),
    ),
  ] as string[];
  const neighborhoods = [
    ...new Set(
      payload.analysis.comparableSummary.universe
        .map((row) => row.comparable.neighborhood)
        .filter(Boolean),
    ),
  ] as string[];
  return `<div class="table-controls"><fieldset><legend>Similarity bands</legend><div class="checks">${SIMILARITY_BANDS.map((band) => `<label><input type="checkbox" name="bandFilter" value="${band.value}"${state.table.bands.includes(band.value) ? " checked" : ""}><span>${escapeHtml(band.label)}</span></label>`).join("")}</div></fieldset>
    <div class="filter-grid"><label><span>Sale filter</span><select id="sale-filter"><option value="all">All comparables</option><option value="recorded"${state.table.saleFilter === "recorded" ? " selected" : ""}>Comparables with any usable recorded sale</option><option value="recent"${state.table.saleFilter === "recent" ? " selected" : ""}>Comparables with a recent sale</option></select></label>
    <label><span>Property class</span><select id="class-filter"><option value="">All</option>${classes.map((value) => `<option value="${escapeHtml(value)}"${state.table.propertyClass === value ? " selected" : ""}>${escapeHtml(formatPropertyClass(value))}</option>`).join("")}</select></label>
    <label><span>Neighborhood</span><select id="neighborhood-filter"><option value="">All</option>${neighborhoods.map((value) => `<option value="${escapeHtml(value)}"${state.table.neighborhood === value ? " selected" : ""}>${escapeHtml(value)}</option>`).join("")}</select></label>
    <label><span>Maximum distance</span><select id="distance-filter"><option value="">All distances</option>${[0.5, 1, 2, 3, 5].map((value) => `<option value="${value}"${state.table.maxDistanceKm === value ? " selected" : ""}>${value} km</option>`).join("")}</select></label>
    <label><span>Year-built similarity</span><select id="year-filter"><option value="">All</option>${[5, 10, 15, 25, 40].map((value) => `<option value="${value}"${state.table.yearBuiltTolerance === value ? " selected" : ""}>Within ${value} years of subject</option>`).join("")}</select></label></div>
    <div class="selection-actions"><button type="button" class="secondary fast-select" data-action="all_filtered">Select all currently filtered</button><button type="button" class="secondary fast-select" data-action="top3">Select top 3 most similar</button><button type="button" class="secondary fast-select" data-action="top5">Select top 5 most similar</button><button type="button" class="secondary fast-select" data-action="top10">Select top 10 most similar</button><button type="button" class="secondary fast-select" data-action="clear">Clear selection</button><strong>${state.selectedComparablePins.length} selected</strong></div>
    <div class="table-pagination"><label><span>Rows per page</span><select id="page-size">${[5, 10, 25, 50].map((value) => `<option value="${value}"${state.table.pageSize === value ? " selected" : ""}>${value}</option>`).join("")}</select></label><p>Page ${state.table.page} of ${totalPages}; ${filtered.length} filtered rows</p><div><button type="button" class="secondary" id="page-prev"${state.table.page <= 1 ? " disabled" : ""}>Previous</button><button type="button" class="secondary" id="page-next"${state.table.page >= totalPages ? " disabled" : ""}>Next</button></div></div>
  </div>`;
}

const SORT_COLUMNS: Array<[string, string]> = [
  ["distance", "Distance"],
  ["buildingSqft", "Building sqft"],
  ["yearBuilt", "Year built"],
  ["saleDate", "Sale date"],
  ["salePrice", "Sale price"],
  ["improvementAvPerSqft", "Improvement AV/sqft"],
  ["subjectComparison", "Compared with subject"],
  ["similarity", "Similarity score"],
  ["landAvPerSqft", "Land AV/sqft"],
];
function sortHeader(key: string, label: string): string {
  const active = state.table.sortKey === key;
  return `<button type="button" class="sort-button" data-sort="${key}" aria-label="Sort by ${escapeHtml(label)} ${active && state.table.sortDirection === "asc" ? "descending" : "ascending"}">${escapeHtml(label)}${active ? ` ${state.table.sortDirection === "asc" ? "▲" : "▼"}` : ""}</button>`;
}
function comparableTable(payload: AnalysisPayload): string {
  const summary = payload.analysis.comparableSummary;
  const filtered = filterAndSortComparables(
    summary.universe,
    state.table,
    payload.analysis.subject.effectiveParcel.yearBuilt,
    summary.subjectImprovementAvPerSqft,
  );
  const paged = paginateComparables(filtered, state.table.page, state.table.pageSize);
  state.table.page = paged.currentPage;
  const selected = new Set(state.selectedComparablePins);
  const h = Object.fromEntries(SORT_COLUMNS.map(([key, label]) => [key, sortHeader(key, label)]));
  return `${filterControls(payload, filtered, paged.totalPages)}<div class="table-wrap"><table class="comparable-table"><caption>${summary.universe.length} comparable homes; filters affect only this table.</caption><thead><tr><th><span class="sr-only">Select</span></th><th>PIN</th><th>${h.distance}</th><th>Neighborhood</th><th>Property class</th><th>${h.buildingSqft}</th><th>${h.yearBuilt}</th><th>${h.saleDate}</th><th>${h.salePrice}</th><th>${h.improvementAvPerSqft}</th><th>${h.subjectComparison}</th><th>${h.similarity}</th><th>Similarity band</th><th>${h.landAvPerSqft}</th></tr></thead><tbody>${paged.pageRows
    .map((row) => {
      const comparison =
        summary.subjectImprovementAvPerSqft === null
          ? null
          : ((row.improvementAvPerSqft - summary.subjectImprovementAvPerSqft) /
              summary.subjectImprovementAvPerSqft) *
            100;
      return `<tr><td><input class="comp-select" type="checkbox" value="${row.comparable.pin}" aria-label="Select comparable ${row.comparable.pinFormatted}"${selected.has(row.comparable.pin) ? " checked" : ""}></td><td>${escapeHtml(row.comparable.pinFormatted)}</td><td>${numberText(row.distanceKm, 2)}</td><td>${escapeHtml(row.comparable.neighborhood ?? "Unavailable")}</td><td>${escapeHtml(formatPropertyClass(row.comparable.propertyClass) || "Unavailable")}</td><td>${numberText(row.comparable.buildingSqft)}</td><td>${numberText(row.comparable.yearBuilt)}</td><td>${escapeHtml(row.comparable.saleDate ? dateLabel(row.comparable.saleDate) : "Unavailable")}${row.comparable.saleDate && !row.recentSale ? "<small>Stale sale — context only</small>" : ""}</td><td>${dollars(row.comparable.salePrice)}</td><td>${dollars(row.improvementAvPerSqft)}</td><td>${relation(comparison)}</td><td>${numberText(row.similarity, 3)}${row.band === "broad" ? "<small>Broad — context only</small>" : ""}</td><td>${escapeHtml(row.band)}</td><td>${dollars(row.landAvPerSqft)}</td></tr>`;
    })
    .join("")}</tbody></table></div>`;
}

function dataNotes(payload: AnalysisPayload): string {
  const notices = payload.analysis.notices;
  return `<section class="data-notices" aria-labelledby="data-notes"><h2 id="data-notes">Data Notes</h2>${notices.length ? `<div class="notice-grid">${notices.map((notice) => `<article class="data-note ${notice.severity}"><h3>${escapeHtml(notice.title)}</h3><p>${escapeHtml(notice.summary)}</p>${notice.details.length ? `<details><summary>Details</summary><ul>${notice.details.map((detail) => `<li>${escapeHtml(detail)}</li>`).join("")}</ul></details>` : ""}</article>`).join("")}</div>` : "<p>No additional public-data limitations were reported.</p>"}</section>`;
}

function statusLabel(status: EvidenceStatus): string {
  return status.replaceAll("_", " ");
}
function evidenceOption(candidate: EvidenceCandidate, checked: boolean, packet = false): string {
  const selectable = packet
    ? candidate.selectable || candidate.available
    : candidate.type !== "property_corrections" && candidate.selectable;
  return `<label class="evidence-option"><input type="checkbox" name="${packet ? "packetEvidence" : "savingsMethod"}" value="${candidate.type}"${checked ? " checked" : ""}${selectable ? "" : " disabled"}><span><strong>${escapeHtml(candidate.name)}</strong> <span class="status-badge status-${candidate.status}">${escapeHtml(statusLabel(candidate.status))}</span><small>${escapeHtml(candidate.shortReason)}</small><small><strong>Appeal Compass screening threshold:</strong> ${escapeHtml(candidate.screeningRule.replace(/^Appeal Compass screening threshold:\s*/i, ""))}</small><small><strong>Official venue rule:</strong> ${escapeHtml(candidate.officialRuleSummary.replace(/^Official venue rule:\s*/i, ""))} ${externalLink(candidate.officialRuleUrl, "Official source")}</small>${candidate.limitations.length ? `<small>${escapeHtml(candidate.limitations.join(" "))}</small>` : ""}</span></label>`;
}

function deadlinePanel(payload: AnalysisPayload): string {
  const route = payload.routing;
  return `<section class="panel deadline-panel"><h2>Deadline status</h2><p><strong>${escapeHtml(route.headline)}</strong></p><dl class="compact-facts"><div><dt>Selected venue</dt><dd>${escapeHtml(payload.venue.name)}</dd></div><div><dt>Current filing status</dt><dd>${escapeHtml(route.actionStatus)}</dd></div>${route.deadlines.map((item) => `<div><dt>${escapeHtml(item.label)}</dt><dd>${escapeHtml(dateLabel(item.date))}${item.daysRemaining === null ? "" : ` — ${item.daysRemaining} days remaining`}</dd></div>`).join("")}<div><dt>Official source</dt><dd>${route.officialUrl ? externalLink(route.officialUrl, "Verify official dates") : "Unavailable"}</dd></div></dl><p class="hint">Verify every date at the official source before filing. Closed, unpublished, and awaiting-notice states remain preparation states.</p></section>`;
}

function calculationCard(calculation: SavingsCalculation): string {
  return `<article class="calculation-card"><h3>${escapeHtml(calculation.evidenceName)}</h3><span class="status-badge status-${calculation.status}">${escapeHtml(statusLabel(calculation.status))}</span>${calculation.limitation ? `<p>${escapeHtml(calculation.limitation)}</p>` : ""}<p><strong>Formula:</strong> ${escapeHtml(calculation.formula)}</p><dl><div><dt>Comparable group</dt><dd>${escapeHtml(calculation.groupLabel ?? "Not applicable")}</dd></div><div><dt>Comparables used</dt><dd>${calculation.comparableCount}</dd></div><div><dt>Current Total AV</dt><dd>${dollars(calculation.currentTotalAv)}</dd></div><div><dt>Target Total AV</dt><dd>${dollars(calculation.targetTotalAv)}</dd></div><div><dt>AV reduction</dt><dd>${dollars(calculation.avReduction)}</dd></div><div><dt>Current implied market value</dt><dd>${dollars(calculation.currentImpliedMarketValue)}</dd></div><div><dt>Direct evidence or preliminary supported value</dt><dd>${dollars(calculation.evidenceMarketValue)}</dd></div><div><dt>Target AV market-value equivalent</dt><dd>${dollars(calculation.targetMarketValueEquivalent)}</dd></div><div><dt>Estimated current tax</dt><dd>${dollars(calculation.estimatedCurrentTax)}</dd></div><div><dt>Estimated target tax</dt><dd>${dollars(calculation.estimatedTargetTax)}</dd></div><div><dt>Annual savings low / point / high</dt><dd>${dollars(calculation.annualSavingsLow)} / ${dollars(calculation.annualSavingsPoint)} / ${dollars(calculation.annualSavingsHigh)}</dd></div><div><dt>Equalizer</dt><dd>${calculation.stateEqualizer}</dd></div><div><dt>Tax rate</dt><dd>${numberText(calculation.taxRate * 100, 4)}% — ${escapeHtml(calculation.taxRateSource)}</dd></div><div><dt>Assessment level</dt><dd>${numberText(calculation.assessmentLevel * 100)}%</dd></div></dl>${calculation.warnings.map((warning) => `<p class="notice">${escapeHtml(warning)}</p>`).join("")}<p class="hint">${escapeHtml(calculation.disclaimer)}</p></article>`;
}

function savingsSection(payload: AnalysisPayload): string {
  const candidates = payload.analysis.evidenceCandidates.filter(
    (candidate) => candidate.type !== "property_corrections",
  );
  const selected = new Set(state.savingsMethods);
  const calculations = payload.analysis.savingsCalculations.filter((calculation) =>
    selected.has(calculation.method),
  );
  return `<section class="panel savings-section"><details${savingsCalculated || state.savingsMethods.length ? " open" : ""}><summary>Estimate tax savings</summary><form id="savings-form" class="evidence-options"><fieldset><legend>Choose one or more evidence methods</legend>${candidates.map((candidate) => evidenceOption(candidate, selected.has(candidate.type as SavingsMethod))).join("")}</fieldset><button type="submit">Calculate</button></form></details>${savingsCalculated && calculations.length ? `${deadlinePanel(payload)}<div class="calculation-grid">${calculations.map(calculationCard).join("")}</div>` : ""}</section>`;
}

function packetSection(payload: AnalysisPayload): string {
  const selected = new Set(state.packetEvidenceTypes);
  return `<section class="panel packet-builder"><button type="button" id="open-packet"${packetFormOpen ? " hidden" : ""}>Generate evidence packet</button>${packetFormOpen ? `<form id="packet-form" class="evidence-options"><fieldset><legend>Which evidence should the packet include?</legend>${payload.analysis.evidenceCandidates.map((candidate) => evidenceOption(candidate, selected.has(candidate.type), true)).join("")}</fieldset><p class="hint">The PDF and XLSX use the same evidence selection and ${state.selectedComparablePins.length} individually selected comparable rows. The XLSX also always includes all comparables.</p><div id="packet-warning" aria-live="polite">${state.selectedComparablePins.length < 3 ? `<p class="notice">Some evidence methods normally need at least three selected actionable comparables.</p>` : ""}</div><div class="actions"><button type="button" id="print-packet">Print/Save PDF</button><button type="button" class="secondary" id="download-xlsx">Download comps .xlsx</button></div></form>` : ""}</section>`;
}

function renderAnalysis(message = ""): void {
  const payload = state.analysisPayload;
  if (!payload) return;
  const step = document.querySelector<HTMLElement>("#step-one-panel");
  if (step) step.hidden = true;
  const workspace = document.querySelector<HTMLElement>("#workspace");
  if (!workspace) return;
  workspace.innerHTML = `${message ? `<section class="notice" role="status">${escapeHtml(message)}</section>` : ""}<section class="analysis-view"><div class="analysis-actions"><button type="button" class="secondary" id="edit-subject">Edit subject property</button></div><section class="panel"><h2>Comparable analysis</h2>${summaryCards(payload)}</section><section class="panel"><h2>Comparable table</h2>${comparableTable(payload)}</section>${dataNotes(payload)}${savingsSection(payload)}${packetSection(payload)}</section>`;
  persist();
}

function updateTableFromControls(): void {
  state.table.bands = Array.from(
    document.querySelectorAll<HTMLInputElement>('input[name="bandFilter"]:checked'),
  ).map((input) => input.value as SimilarityBandName);
  const value = (id: string) =>
    (document.querySelector(`#${id}`) as HTMLSelectElement | null)?.value ?? "";
  state.table.saleFilter = value("sale-filter") as ComparableTableState["saleFilter"];
  state.table.propertyClass = value("class-filter");
  state.table.neighborhood = value("neighborhood-filter");
  state.table.maxDistanceKm = value("distance-filter") ? Number(value("distance-filter")) : null;
  state.table.yearBuiltTolerance = value("year-filter") ? Number(value("year-filter")) : null;
  state.table.page = 1;
  renderAnalysis();
}

async function submitCase(form: HTMLFormElement): Promise<void> {
  updateStepOneConditional(form);
  setFormError("");
  if (!form.reportValidity()) return;
  if (formValue(form, "ownershipType") !== "individual") {
    const modal = document.querySelector<HTMLElement>("#entity-modal");
    if (modal) modal.hidden = false;
    return;
  }
  const params = new URLSearchParams();
  for (const name of [
    "jurisdiction",
    "venue",
    "ownershipType",
    "borNoticeReceived",
    "borNoticeDate",
    "pin",
  ]) {
    const value = formValue(form, name);
    if (value) params.set(name, value);
  }
  showProgress("Looking up the subject property...");
  try {
    const payload = await fetchJson<SubjectPayload>(`/api/subject?${params.toString()}`);
    state = {
      ...state,
      stepOneQuery: params.toString(),
      screen: "subject_review",
      subjectPayload: payload,
      corrections: [],
      valueEvidence: null,
      analysisPayload: null,
      analysisRevision: 0,
      selectedComparablePins: [],
      savingsMethods: [],
      packetEvidenceTypes: [],
      table: { ...DEFAULT_TABLE, bands: [...DEFAULT_TABLE.bands] },
    };
    showCorrectionForm = payload.subject.blockingMissingFields.length > 0;
    persist();
    renderSubjectReview();
  } catch (error) {
    setFormError(error instanceof Error ? error.message : "The subject could not be loaded.");
  } finally {
    showProgress("");
  }
}

async function generatePacket(): Promise<void> {
  if (!state.analysisPayload || !state.subjectPayload) return;
  const popup = window.open("", "_blank");
  if (!popup) {
    const warning = document.querySelector<HTMLElement>("#packet-warning");
    if (warning) warning.innerHTML = `<p class="error">Allow popups to open the print packet.</p>`;
    return;
  }
  popup.document.write("<p>Preparing evidence packet…</p>");
  try {
    const request = analysisRequest();
    request.revision = state.analysisRevision;
    const response = await fetch(`/api/packet${state.subjectPayload.demo ? "?demo=1" : ""}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        ...request,
        selection: {
          evidenceTypes: state.packetEvidenceTypes,
          comparablePins: state.selectedComparablePins,
        },
      }),
    });
    if (!response.ok)
      throw new Error(
        ((await response.json()) as ApiError).error?.message ?? "Packet generation failed.",
      );
    const html = await response.text();
    popup.document.open();
    popup.document.write(html);
    popup.document.close();
  } catch (error) {
    popup.document.body.innerHTML = `<p>${escapeHtml(error instanceof Error ? error.message : "Packet generation failed.")}</p>`;
  }
}

function downloadWorkbook(): void {
  const payload = state.analysisPayload;
  if (!payload) return;
  const workbook = buildComparableWorkbook(payload, {
    selectedComparablePins: state.selectedComparablePins,
    packetEvidenceTypes: state.packetEvidenceTypes,
    savingsMethods: state.savingsMethods,
  });
  const blob = new Blob(
    [
      workbook.buffer.slice(
        workbook.byteOffset,
        workbook.byteOffset + workbook.byteLength,
      ) as ArrayBuffer,
    ],
    { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" },
  );
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = comparableWorkbookFilename(payload);
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function methodologyPage(): void {
  root.innerHTML = `${header()}<main class="methodology"><p><a href="/">Back to Appeal Compass</a></p><section class="panel"><h2>Two-phase review</h2><p>Appeal Compass first returns public subject facts and individual property-card details. Comparable analysis begins only after the homeowner confirms the facts or supplies documented corrections. Public and effective values remain separately auditable.</p></section><section class="panel"><h2>Corrections and AV reconciliation</h2><p>Confirmed corrections override public values for analysis while original public values remain in the payload and exports. Every manual correction requires a proof type. Total AV must equal Improvement AV plus Land AV; a derived counterpart is labeled and explained.</p></section><section class="panel"><h2>Comparables and summary groups</h2><p>Venue matching is applied before the 50% size, 30% age, and 20% distance similarity score. The displayed universe ends at 0.50. Excellent is 0.00–0.10, Good is >0.10–0.20, Decent is >0.20–0.35, and Broad is >0.35–0.50. Broad rows are context only. Top 25%, 50%, and 75% always mean the first ceil(N × share) rows ordered by ascending similarity and never change with table filters.</p></section><section class="panel"><h2>Evidence and savings are separate</h2><p>Uniformity, recorded sale, reported purchase, appraisal, comparable sales, and land are independent evidence candidates. Product screening thresholds are labeled separately from official venue rules. Comparable-sales screening uses median recent sale price per sqft times subject building sqft. Land screening uses median Land AV per sqft times subject land sqft. Each selected savings method gets a separate exploratory calculation.</p></section><section class="panel"><h2>Exports</h2><p>The evidence packet uses only owner-selected evidence and comparable rows and excludes tax savings, deadlines, and homeowner filing instructions. The XLSX includes public/effective subject values, selected and all comparables, selected evidence, and one sheet for each selected savings method.</p></section>${footerAndModals()}`;
}

if (IS_METHODOLOGY_PAGE) methodologyPage();
else {
  shell();
  const storage = currentStorage();
  const restored = storage ? loadSessionState<SubjectPayload, AnalysisPayload>(storage) : null;
  if (restored) {
    const { schemaVersion: _schemaVersion, savedAt: _savedAt, ...restoredState } = restored;
    state = restoredState;
    const form = document.querySelector<HTMLFormElement>("#case-form");
    if (form) {
      const params = new URLSearchParams(state.stepOneQuery);
      for (const element of Array.from(form.elements)) {
        if (
          !(element instanceof HTMLInputElement || element instanceof HTMLSelectElement) ||
          !element.name
        )
          continue;
        const value = params.get(element.name);
        if (element instanceof HTMLInputElement && element.type === "radio")
          element.checked = element.value === value;
        else element.value = value ?? "";
      }
      updateStepOneConditional(form);
    }
    if (state.screen === "analysis" && state.analysisPayload) renderAnalysis();
    else if (state.screen === "subject_review" && state.subjectPayload) renderSubjectReview();
  }
}

document.addEventListener("submit", (event) => {
  const form = event.target;
  if (!(form instanceof HTMLFormElement)) return;
  if (form.id === "case-form") {
    event.preventDefault();
    void submitCase(form);
  }
  if (form.id === "correction-form") {
    event.preventDefault();
    void confirmSubject(true);
  }
  if (form.id === "savings-form") {
    event.preventDefault();
    state.savingsMethods = Array.from(
      form.querySelectorAll<HTMLInputElement>('input[name="savingsMethod"]:checked'),
    ).map((input) => input.value as SavingsMethod);
    savingsCalculated = true;
    persist();
    renderAnalysis();
  }
  if (form.id === "packet-form") event.preventDefault();
  if (form.id === "report-form") {
    event.preventDefault();
    const data = new FormData(form);
    const target = document.querySelector<HTMLElement>("#report-status");
    void fetch("/api/report", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        category: data.get("category"),
        description: data.get("description"),
        context: state.subjectPayload?.subject.publicParcel.pinFormatted ?? "",
        turnstileToken: data.get("cf-turnstile-response"),
      }),
    }).then(async (response) => {
      if (target)
        target.textContent = response.ok
          ? "Feedback submitted."
          : (((await response.json()) as ApiError).error?.message ?? "Submission failed.");
    });
  }
});

document.addEventListener("change", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLInputElement || target instanceof HTMLSelectElement)) return;
  if (target.form?.id === "case-form") updateStepOneConditional(target.form);
  if (
    [
      "sale-filter",
      "class-filter",
      "neighborhood-filter",
      "distance-filter",
      "year-filter",
    ].includes(target.id) ||
    target.name === "bandFilter"
  )
    updateTableFromControls();
  if (target.id === "page-size") {
    state.table.pageSize = Number(target.value) as ComparableTableState["pageSize"];
    state.table.page = 1;
    renderAnalysis();
  }
  if (target instanceof HTMLInputElement && target.classList.contains("comp-select")) {
    const selected = new Set(state.selectedComparablePins);
    target.checked ? selected.add(target.value) : selected.delete(target.value);
    state.selectedComparablePins = [...selected];
    persist();
    renderAnalysis();
  }
  if (target.name === "packetEvidence") {
    state.packetEvidenceTypes = Array.from(
      document.querySelectorAll<HTMLInputElement>('input[name="packetEvidence"]:checked'),
    ).map((input) => input.value as EvidenceType);
    persist();
  }
});

document.addEventListener("click", (event) => {
  const target = event.target instanceof HTMLElement ? event.target : null;
  if (!target) return;
  if (target.id === "confirm-subject") void confirmSubject(false);
  if (target.id === "open-corrections") {
    showCorrectionForm = true;
    renderSubjectReview();
  }
  if (target.id === "add-correction")
    document
      .querySelector<HTMLElement>("#correction-rows")
      ?.insertAdjacentHTML("beforeend", correctionRow());
  if (target.classList.contains("remove-correction")) target.closest(".correction-row")?.remove();
  if (target.id === "edit-subject") {
    state.screen = "subject_review";
    showCorrectionForm = manualCorrections().length > 0;
    persist();
    renderSubjectReview();
  }
  if (target.classList.contains("sort-button")) {
    const key = target.dataset.sort ?? "similarity";
    if (state.table.sortKey === key)
      state.table.sortDirection = state.table.sortDirection === "asc" ? "desc" : "asc";
    else {
      state.table.sortKey = key;
      state.table.sortDirection = "asc";
    }
    state.table.page = 1;
    renderAnalysis();
  }
  if (target.id === "page-prev") {
    state.table.page -= 1;
    renderAnalysis();
  }
  if (target.id === "page-next") {
    state.table.page += 1;
    renderAnalysis();
  }
  if (target.classList.contains("fast-select") && state.analysisPayload) {
    const filtered = filterAndSortComparables(
      state.analysisPayload.analysis.comparableSummary.universe,
      state.table,
      state.analysisPayload.analysis.subject.effectiveParcel.yearBuilt,
      state.analysisPayload.analysis.comparableSummary.subjectImprovementAvPerSqft,
    );
    state.selectedComparablePins = fastSelectComparablePins(
      filtered,
      target.dataset.action as "all_filtered" | "top3" | "top5" | "top10" | "clear",
    );
    persist();
    renderAnalysis();
  }
  if (target.id === "open-packet") {
    packetFormOpen = true;
    renderAnalysis();
  }
  if (target.id === "print-packet") void generatePacket();
  if (target.id === "download-xlsx") downloadWorkbook();
  if (target.id === "open-feedback") {
    const modal = document.querySelector<HTMLElement>("#feedback-modal");
    if (modal) modal.hidden = false;
  }
  if (target.dataset.close) {
    const modal = document.querySelector<HTMLElement>(`#${target.dataset.close}`);
    if (modal) modal.hidden = true;
  }
});

document.documentElement.dataset.enhanced = "true";

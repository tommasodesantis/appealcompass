# Appeal Compass Development Learnings

This document preserves the durable findings from the Python CLI development cycle before the
repository was refactored into a server-rendered webapp. The webapp keeps these constraints in code,
tests, and user-facing copy.

## Source Access And Calendar Authority

- Cook County Assessor calendar automation remains blocked in direct shell fetches. The official
  page redirects to `https://www.cookcountyassessoril.gov/assessment-calendar-and-deadlines`, but
  command-line retrieval returned CloudFront 403 during the 2026-07-06 retest.
- Browser access to the official Assessor calendar worked, and the manual authority PDF
  `Assessment & Appeal Calendar _ Cook County Assessor's Office.pdf` was extracted locally on
  2026-07-06. The authority file reported `Last updated: 6/29/26`.
- Assessor constants are therefore maintained manually from the authority PDF until direct
  automation is available. Runtime output must warn users when today's date is past the configured
  Assessor session end and must point to the official source URL.
- The Assessor PDF does not contain BOR open dates, close dates, or evidence deadlines. It shows
  only pass markers and a repeated BOR-related label. As of 2026-07-09, the official BOR dates page
  still linked only the Tax Year 2025 schedule, so the product labels Tax Year 2026 dates as not
  published and never reuses the expired PDF as a current schedule.

## Comparable Evidence Feasibility

- The Assessor comparable profile is feasible with caveats. It uses same class, township or
  neighborhood preference, building square footage, lenient year filtering when data exists, and
  Improvement AV per square foot. Total AV is retained only for context, overvaluation checks,
  total-value breakdowns, and savings estimates.
- The Board of Review comparable profile is feasible with caveats. Public BOR rules do not publish
  a PTAB-style grid, so the implementation uses a conservative building/improvement assessment per
  square foot profile with same-class and similarity filters.
- The PTAB full comparable grid is not feasible from public Socrata data alone. In the 18-property
  Phase 2 sample, only 8 of 18 parcels met the three-comparable floor after strict PTAB-style
  location, square footage, age, land, style, and amenity filters. The median final survivor count
  was 2.
- PTAB output must therefore expose public-data limits and require the homeowner to supply
  property record cards, listing sheets, condition details, photos, and any missing grid fields.
  It must not present a generated PTAB grid as complete from public data.
- Step 12 comparable-realism audit checked fixture cases and live Socrata PIN `07203040190000`
  through the local Worker. Passing invariants covered subject/comparable class matching, configured
  building-size/year tolerances, neighborhood scope when selected, selected-pool rows, sane
  distances, independently recomputed median/percentile/gap values, plausible residential assessed
  dollars per square foot, and monotonic similarity ordering. Higher-assessed selected rows remain
  visible and are labeled relative to the subject.
- The audit did not find fixture or live-payload realism failures. It did identify that the pure
  domain analysis should enforce same-class filtering itself rather than relying only on the
  repository query, so mismatched-class candidates are now excluded before similarity selection.

## Condo And Missing Data Gates

- Condo public-data pools were data-limited in the measured Phase 2 run. Four condominium samples
  produced only the subject row in same-township and same-class candidate pools, with no usable
  unit square-foot availability.
- Condo comparable analysis is no longer skipped blindly. Runtime analysis measures the active
  comparable pool's missing-data rate for unit square footage and the active assessment metric.
- If the missing-data rate is below 30%, condo analysis can run normally. From 30% through 50%, it
  can run with a measured-rate warning. Above 50%, the analysis is skipped with the measured rate
  and guidance to use sale, appraisal, building-level equity, or factual-error evidence.

## Socrata Data Quirks

- The Cook County parcel-universe rows used for subject and comparable pools do not expose street
  address fields. Comparable exhibits identify properties by formatted PIN, not by an unavailable
  address placeholder.
- Live address search was removed on 2026-07-07 after a temporary probe against live Socrata
  metadata and query endpoints. The probe checked `nj4t-kc8j`, `uzyt-m557`, `x54s-btds`, and
  `wvhk-k5uv` metadata via `/api/views/{id}`, tried `prop_address_full`, `property_address`, and
  `address` with raw and normalized searches for `1906 W Huron St, Chicago, IL 60622, United
  States`, and confirmed that `nj4t-kc8j` has no address-like fields and returns Socrata
  `query.soql.no-such-column` for those fields. Two address-bearing candidates,
  `5pge-nu6u` and `bcnq-qi2z`, found `1906 W HURON ST`, but both are archived 2022 Assessor
  datasets, so they are not reliable enough for current address search or current comparable
  addresses.
- Configured-year assessed-value rows often exist without value fields. The data layer must select
  the latest value-bearing row and warn when it falls back from the configured assessment year.
- Residential characteristics can be missing for a subject parcel. The app must degrade without a
  crash, explain which reliable fallback value can unblock analysis, and label entered values as
  user-supplied.
- Land assessed value is available from the assessed-values dataset and is used only for a separate
  Land AV/land sqft diagnostic. It should explain lot-size-driven total-assessment differences or
  flag possible land/factual-error issues without replacing Improvement AV/sqft uniformity.
- Warnings must be de-duplicated before they reach the user.

## Socrata Concurrency And Architecture

- The 2026-07-06 concurrency probe measured a practical ceiling of 2 simultaneous users without an
  app token and 4 simultaneous users with a Socrata app token.
- No HTTP 429 responses were observed in that probe, but p95 latency degraded sharply at 8
  simulated users. The no-token 8-user run stopped after 4 of 8 simulated users failed.
- The webapp architecture must be cache-first, coalesce identical in-flight upstream requests,
  limit per-case outbound Socrata fetch concurrency to at most 2, keep comparable pool queries
  bounded, and honor `Retry-After` for 429 responses.
- The Socrata app token must remain server-side only. It belongs in `.dev.vars` for local
  Wrangler development and in a production server secret, never in committed files, browser code,
  logs, or reports.

## Datasets And Fields

| Logical source | Dataset ID | Important fields and quirks |
| --- | --- | --- |
| Parcel universe | `nj4t-kc8j` | PIN, class, township, township code, neighborhood, tax code, coordinates, ZIP, geography. Comparable pool rows may not include street addresses. |
| Assessed values | `uzyt-m557` | `mailed_tot`, `certified_tot`, `board_tot`, `mailed_bldg`, `certified_bldg`, `board_bldg`, `mailed_land`, `certified_land`, `board_land`, `year` or `tax_year`. Configured-year rows may lack value fields. |
| Residential characteristics | `x54s-btds` | Building square footage, land square footage, year built, residential type, exterior wall, construction quality, beds, baths, amenities. Condo unit data can be sparse. |
| Parcel sales | `wvhk-k5uv` | Sale date and sale price for the subject and comparable display. Ignore unusable or nominal prices. Comparable sales must be fetched with one bounded `pin in (...)` query for the comparable pool, not one request per comparable. |
| Clerk tax-code rates | manual Clerk XLSX | `Code24` and composite `CodeRate24` from the Cook County Clerk 2024 Tax Code Agency Rate file, retrieved 2026-07-08 from `https://www.cookcountyclerkil.gov/sites/default/files/2026-04/2024-tax-code-agency-rate-file.xlsx`. A current Socrata tax-rate mapping API was not verified during the Step 6 research pass. |

## Tax Rate Assumptions

- The parcel universe exposes `tax_code`, which allows a parcel to be mapped to a committed Clerk
  tax-code rate lookup when the code is present.
- The Clerk tax-code rate lookup is sourced from the Cook County Clerk 2024 Tax Code Agency Rate
  file and uses the composite `CodeRate24` value converted to a decimal tax rate. It is labeled
  approximate wherever it appears.
- A full-row audit on 2026-07-10 compared all 4,508 committed tax-code rates with the official Clerk
  workbook and found no differences. Tax code `35011` is `0.09585675`, displayed as `9.5857%`.
- If the parcel tax code is missing or absent from the lookup, estimated savings fall back to
  `DEFAULT_TAX_RATE` and must label the fallback as a county default assumption.
- The UI, print packet, and workbook must show the equalizer and the tax-rate source next to the
  estimated savings range.
- The print packet is intentionally narrow: tool name, disclaimer, produced date, subject
  specifications, consolidated data notes, plain-language comparable method, a user-capped
  comparable table, and analysis/savings results. Homeowner-facing deadline status, filing
  checklists, and exemption guidance stay out of the jurisdiction-facing packet.
- The XLSX workbook has two comparable worksheets: the similarity-filtered selected pool and the
  full selected similar-home pool, both using the same comparable column set and subject comparison.
- The browser stores only the last successful in-tab assessment query and payload in
  `sessionStorage` so returning from `/print` can rehydrate the form and results without a refetch.

## Constants To Refresh Annually

- `ASSESSMENT_YEAR`
- `STATE_EQUALIZER`
- `DEFAULT_TAX_RATE`
- Clerk tax-code composite-rate lookup in `src/domain/taxRates.ts`
- Assessor township windows and Assessor `session_end`
- BOR township-window publication status, evidence deadlines, and BOR `session_end`; never reuse a
  prior tax-year schedule as the current schedule
- Official source URLs and source notes
- Any public-data dataset IDs or field mappings that changed upstream

## Product Honesty Requirements

- Evidence precedence is documented in `docs/EVIDENCE_PRECEDENCE.md`: positive public values win
  when present, user values are fallback-only, and user-supplied values remain clearly labeled.
- Show `NOT LEGAL ADVICE. Users are responsible to verify that the evidence collected via Appeal
  Compass is correct.` in every results view and printable packet.
- Every deadline must carry a link to the official venue source and the instruction to verify at
  the official source before filing.
- Users explicitly choose Assessor, BOR, or PTAB. The app must not silently switch venues. When a
  selected window is closed or a current schedule is not published, keep preparation guidance
  available while preserving the selected venue's comparable profile and checklist.
- PTAB deadlines are computed only from the date on a written BOR decision notice. Exclude the
  notice date, include day 30, and move a weekend or Illinois legal-holiday expiration to the next
  business day. The result must explain that Cook County's later township-transmission date may
  control and cannot be observed by this tool.
- Estimated savings are ranges, not promises. Display the equalizer and tax-rate assumptions next
  to the range, and show an explicit unavailable state when no actionable reduction amount exists.
- User-supplied values must be labeled as user-supplied, never as official county data.

## Sale and Appraisal Recency Rules

- Value evidence is anchored to January 1 of the subject's selected assessment year, not a global
  hard-coded date. The Assessor screen uses a two-year purchase/appraisal window. The BOR screen
  uses its published three-year purchase window and the same conservative screen for appraisals.
- Cook County Board of Review Rule 18 requires disclosure and sale documents when a purchase took
  place within three years of the lien date:
  https://www.cookcountyboardofreview.com/board-review-official-rules
- PTAB asks for sale or appraisal evidence as close as possible to January 1 rather than publishing
  the same fixed cutoff. The app uses a conservative three-year PTAB screen and labels it as a
  screening rule, not a PTAB deadline or guarantee of admissibility.
- Implementation note: stale sales may be shown as informational context, but must not create an
  overvaluation argument or estimated savings. PTAB deadlines remain unrelated and are computed
  only from the user-supplied date on the written BOR decision notice, with the Cook County
  township-transmission caveat shown separately.
- `buildEvidenceSummary` applies the assessment-year and venue policy to subject recorded sales,
  user-reported purchases, and user-reported appraisals before assigning an overvaluation target or
  estimated savings. A qualifying user entry takes precedence over a qualifying recorded sale.
- Comparable sale fields are display context rather than the basis of the Improvement AV/sqft
  uniformity analysis. The UI can show all assessment comparables, recent three-year sales, or all
  rows with a recorded sale. Older sales are labeled context only.
- A positive implied-value gap must be at least 5% to create an overvaluation argument, affect the
  evidence level, or produce a savings estimate. Smaller gaps remain visible with the formula and
  are labeled context only.

## Assessment Queueing

- Per-case outbound Socrata fetch concurrency stays capped at 2; this remains the measured safe
  ceiling for a single case build.
- Case and print builds now share an assessment-level limiter capped at 4 concurrent builds per
  server instance. This matches the measured token-backed Socrata ceiling while allowing several
  homeowners to proceed at once.
- Requests above that limit wait in FIFO order. They time out after 60 seconds with friendly retry
  guidance instead of failing immediately or increasing upstream pressure.
- `/api/queue` reports active and queued counts so the browser can tell a user when Appeal Compass
  is busy and the assessment is in line.

## Reporting

- Problem reports and feature requests share one feedback form. Commercial-property interest keeps
  a separate contact form. Both have a configured public Turnstile site key but remain unavailable
  until their deployment secrets are configured. Server-side secrets are
  `TURNSTILE_SECRET_KEY`, `GITHUB_ISSUES_TOKEN`, and `RESEND_API_KEY`; the public
  `TURNSTILE_SITE_KEY` is in `src/domain/publicConfig.ts`.
- The Turnstile secret, GitHub token, and Resend API key must never be committed or sent to the
  browser. The reporting and contact endpoints strip HTML from submitted text and exclude
  Turnstile tokens from outbound GitHub issue bodies or Resend emails.
- Server validation requires the Turnstile action to match `feedback` or `commercial_interest`.
  Feedback issue creation verifies that `GITHUB_ISSUES_TOKEN` belongs to `tdsdesa-bot` and refuses
  to post under another account.
- Cloudflare Rate Limiting bindings enforce a shared per-IP 10-per-minute case/print limit and a
  shared per-IP 2-per-minute feedback/contact limit. The in-process assessment concurrency and
  queue controls remain separate safeguards for upstream Socrata pressure.

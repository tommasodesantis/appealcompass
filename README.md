# Appeal Compass

Appeal Compass is an open-source screening tool for individual residential homeowners exploring
property-tax appeal evidence. Cook County, Illinois is the first supported jurisdiction.

The application keeps official public values, confirmed homeowner corrections, comparable
evidence, savings calculations, and export selections separate. It does not file an appeal,
collect documents, recommend a result, or guarantee a reduction.

## User flow

1. The homeowner chooses Cook County, Assessor/BOR/PTAB, ownership type, any required PTAB notice
   answers, and a PIN.
2. `GET /api/subject` returns only the public subject facts, assessment values, recorded subject
   sales, raw residential property-card rows, reconciliation notes, and routing metadata.
3. The homeowner confirms the facts or enters one or more documented corrections. A recent subject
   purchase or appraisal may be entered at this stage; purchase and appraisal cannot be combined.
4. `POST /api/analysis` reloads the public subject, validates corrections, builds a distinct
   effective subject, re-queries comparables using effective class and township, and recomputes all
   summaries, evidence candidates, and method-specific savings calculations.
5. The homeowner can filter and sort the table without changing the fixed summary groups, select
   comparables, explore separate savings methods, and independently choose evidence for the packet.

Editing and reconfirming subject data increments the analysis revision and clears every stale table
selection, savings result, and packet selection.

## Corrections and provenance

The payload and exports retain both `publicParcel` and `effectiveParcel`. Confirmed corrections
override public values for downstream calculations while the original public values remain
auditable. Each displayed subject field has one provenance value:

- `public`
- `user_corrected`
- `user_added`
- `derived`

Every manual correction requires a proof type. Appeal Compass does not accept uploads; the owner
must include the selected proof separately with the appeal package. If “Other documented proof” is
selected, a description is required.

Total AV must equal Improvement AV plus Land AV. Total AV cannot be corrected alone. When one AV
component changes, the owner either enters the other component or authorizes an automatic
recalculation that is stored and exported as a derived value.

## Comparable analysis

Venue-specific matching requirements run before similarity scoring. The score remains:

- 50% building-size difference
- 30% year-built difference
- 20% distance

Lower scores are more similar. The displayed universe ends at `0.50`:

- Excellent: `0.00–0.10`
- Good: `>0.10–0.20`
- Decent: `>0.20–0.35`
- Broad: `>0.35–0.50`

Broad rows are context only. Only rows through `0.35` can drive uniformity, comparable-sales, or
land savings calculations.

“Top” always means most similar, ordered by ascending similarity. Summary groups are calculated
from the complete displayed universe and never change with table filters, sorting, or pagination:

- Top 25%: first `ceil(N × 0.25)` rows
- Top 50%: first `ceil(N × 0.50)` rows
- Top 75%: first `ceil(N × 0.75)` rows
- All: all displayed rows

## Evidence and savings

Evidence candidates are independent. Each reports availability, selectability, a status, a short
reason, the Appeal Compass screening threshold, the venue's official rule summary and source, data
used, limitations, and any calculation inputs. There is no aggregate score or automatic
recommendation.

Savings methods are also independent:

- Uniformity
- Recorded subject sale
- User-reported subject purchase
- User-provided appraisal
- Comparable-sales market evidence
- Land overassessment

Comparable-sales screening uses the first nested actionable group with at least three recent sales:

`median(sale price ÷ comparable building sqft) × effective subject building sqft`

The result is an unadjusted preliminary supported market value, not an appraisal. Land screening
uses the first nested actionable group with at least three usable land rows:

`median comparable Land AV/sqft × effective subject land sqft`

Each selected method gets its own calculation card. Tax estimates retain:

`estimated tax = AV × state equalizer × tax rate`

The point estimate is shown with a ±20% range and the tax-rate source. Methods are never merged into
a best, combined, or recommended result. Deadline information appears once with savings results.

## Evidence packet and XLSX

`POST /api/packet` rebuilds and validates the analysis from the submitted PIN, Step 1 choices,
corrections, value evidence, selected evidence types, and comparable PINs. The jurisdiction-facing
PDF includes only selected evidence and selected comparable rows. It excludes tax savings,
deadlines, filing instructions, official-rule links, and homeowner checklists.

The XLSX always contains:

1. Subject & Corrections
2. Selected Comparables
3. All Comparables through similarity `0.50`
4. Evidence Summary
5. One calculation sheet for each selected savings method

`GET /print` remains available as a backward-compatible default packet.

## Data and operational safeguards

Live county data is fetched only by the Worker. The browser never receives the Socrata token.
Current sources are documented in [docs/DATA_SOURCES.md](docs/DATA_SOURCES.md).

The existing safeguards remain in place: bounded Socrata queries, a capped comparable pool, one
batched comparable-sale query, 12-hour cache, request coalescing, per-case outbound concurrency of
2, assessment concurrency of 4, FIFO queueing with a 60-second timeout, and Cloudflare rate
limiting. Fixture mode is available with `demo=1` for local tests.

Useful endpoints:

- `GET /api/health`
- `GET /api/queue`
- `GET /api/subject`
- `POST /api/analysis`
- `POST /api/packet`
- `GET /print` (backward compatibility)
- `POST /api/report`
- `POST /api/contact`
- `GET /methodology`

## Local development

```powershell
npm install
npm run dev
```

Optional local secrets belong in `.dev.vars`:

```powershell
SOCRATA_APP_TOKEN=your_token_here
TURNSTILE_SECRET_KEY=your_turnstile_secret_here
GITHUB_ISSUES_TOKEN=your_tdsdesa_bot_github_token_here
RESEND_API_KEY=your_resend_api_key_here
```

Run the full local gate:

```powershell
npm run verify
```

Fixture smoke against a running local Worker:

```powershell
npm run dev
npm run smoke:fixtures
```

The repository is deploy-ready but does not deploy automatically. Deploy only through an explicit,
separate release action.

## License

Appeal Compass is open source under GPLv3. See [LICENSE](LICENSE).

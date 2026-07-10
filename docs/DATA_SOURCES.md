# Data Sources

All live county data is fetched server-side. The browser never receives the Socrata app token.

| Source | Dataset ID | Fields used |
| --- | --- | --- |
| Parcel universe | `nj4t-kc8j` | `pin`, `class`, `township_name`, `township_code`, `nbhd_code`, `tax_code`, `lat`, `lon`, `year`, `zip_code` |
| Assessed values | `uzyt-m557` | `pin`, `year`, `mailed_tot`, `certified_tot`, `board_tot`, `mailed_bldg`, `certified_bldg`, `board_bldg`, `mailed_land`, `certified_land`, `board_land` |
| Residential characteristics | `x54s-btds` | `pin`, `card`, `row_id`, `pin_is_multicard`, `pin_num_cards`, `class`, `township_code`, `year`, building/land sqft, year built, construction/style inputs, beds, baths, amenities |
| Parcel sales | `wvhk-k5uv` | `pin`, `sale_date`, `sale_price` for subject value evidence and latest comparable-sale display |
| Clerk tax-code rates | manual Clerk XLSX | Tax code and composite `CodeRate24` from the Cook County Clerk 2024 Tax Code Agency Rate file, retrieved 2026-07-08 from `https://www.cookcountyclerkil.gov/sites/default/files/2026-04/2024-tax-code-agency-rate-file.xlsx` |

The parcel universe exposes `tax_code`, so the app can map a parcel to the committed Clerk
composite-rate lookup when that code is available. Cook County Clerk tax-rate reports are published
as annual files rather than a currently verified Socrata API, so `src/domain/taxRates.ts` must be
refreshed manually each year from the latest official Clerk Tax Code Agency Rate file or equivalent
Tax Rate Report extract.

## Known Limits

- Parcel-universe rows used by the current public dataset do not include street-address fields.
  Comparable exhibits identify properties by formatted PIN.
- Live address search is disabled because the current public parcel-universe dataset does not
  expose a reliable address field. Users should recover their PIN from the official Cook County
  Property Tax Portal.
- The parcel-universe class is checked before characteristics or comparable queries. The current
  product supports eligible Class 2 dwellings and Class 299 condominiums; commercial, industrial,
  Class 3 multi-family, special/non-dwelling Class 2, and unknown classes stop before analysis.
- Configured-year assessed-value rows can exist without AV fields. The app falls back to the latest
  value-bearing row and warns the user. Each component prefers Board, then certified, then mailed
  values, and Total AV must reconcile to Improvement AV plus Land AV before automated savings run.
- Multi-card residential rows are aggregated by parcel and year. Building area and improvement
  facts are combined across unique cards; parcel land area is counted once. Missing, unsupported,
  or conflicting card sets suppress automated conclusions and savings.
- Comparable tables show the most recent usable sale returned by `wvhk-k5uv` for each comparable
  when available. Nominal or missing sale prices are ignored; rows without usable sale data render
  "Not available." Sales older than three years before the assessment lien date are labeled as
  context only. Users may display all assessment comparables, only recent three-year sales, or any
  row with a recorded sale; sale filtering does not recalculate the assessment analysis.
- Comparable tables retain both lower- and higher-assessed matches after the active filters. The web
  table shows 10 rows per page by default, and the print packet includes at most the selected 3, 5,
  or 10 most-similar rows.
- Only comparable rows with similarity scores at or below `0.35` drive medians, evidence levels,
  target assessments, or savings. Broader rows remain visible as context only.
- Parcel-specific estimated savings use the Clerk tax-code rate when the parcel tax code is present
  and found in the committed lookup. The committed lookup is labeled approximate. Otherwise the app
  falls back to the default 10% county assumption and labels that assumption.
- Condo pools can be sparse. The app uses the measured missing-data bands described in
  [LEARNINGS.md](LEARNINGS.md).
- PTAB full-grid evidence is not feasible from public data alone. The results view includes
  property-record-card fallback guidance. The jurisdiction-facing print packet includes subject
  specifications, consolidated data notes, a plain-language comparable method, selected rows, and
  analysis results. It intentionally omits homeowner-facing deadline status.

## Operational Guardrails

- Cache TTL: 12 hours.
- Identical in-flight Socrata requests are coalesced within the server instance.
- Per-case outbound Socrata fetch concurrency is capped at 2.
- Case and print builds are capped at 4 concurrent assessments per server instance. Extra requests
  wait in FIFO order instead of increasing Socrata pressure.
- Queued assessments wait up to 60 seconds. If a request cannot start in that window, the API
  returns a friendly 503 with retry guidance.
- `/api/queue` exposes active/queued counts so the browser can show a plain-language busy message
  while the user waits.
- Cloudflare Rate Limiting bindings apply a shared 10-per-minute per-IP limit to case and print
  requests and a shared 2-per-minute per-IP limit to feedback and contact submissions. Rejected
  requests return HTTP 429 with `Retry-After: 60`.
- The Socrata app token is read from `SOCRATA_APP_TOKEN` and never committed.
- The merged problem/feature feedback form requires `TURNSTILE_SECRET_KEY` and
  `GITHUB_ISSUES_TOKEN`; commercial-interest contact messages require `TURNSTILE_SECRET_KEY` and
  `RESEND_API_KEY`. Turnstile tokens are validated against the expected form action. The GitHub
  token must resolve to `tdsdesa-bot` before an issue is created. Secrets are never sent to the
  browser.

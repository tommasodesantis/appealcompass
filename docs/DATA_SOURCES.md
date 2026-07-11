# Data Sources

All live county data is fetched server-side. Browser payloads never contain the Socrata app token.

| Source | Dataset ID | Fields used |
| --- | --- | --- |
| Parcel universe | `nj4t-kc8j` | PIN, class, township name/code, neighborhood, tax code, coordinates, year, ZIP |
| Assessed values | `uzyt-m557` | Mailed, certified, and Board Total AV, Improvement AV, Land AV, and year |
| Residential characteristics | `x54s-btds` | PIN, card identifier, expected card count, class, township, building/land sqft, year built, and venue-profile characteristics |
| Parcel sales | `wvhk-k5uv` | Sale date and price for subject value evidence and comparable-sale screening |
| Clerk tax-code rates | Manual Clerk XLSX | Tax code and composite rate from the verified 2024 Tax Code Agency Rate file |

## Two-phase loading

`GET /api/subject` loads only the subject parcel, assessed values, subject sales, and raw individual
residential property-card rows. It does not fetch a user-facing comparable analysis.

`POST /api/analysis` reloads the subject, validates confirmed corrections, builds a separate
effective parcel, and queries comparables using the effective property class and township. A
corrected township name is resolved to a current township code before the bounded characteristic,
assessment, parcel, and batched-sale queries run. Corrected neighborhood, sqft, year built, and card
count then affect matching and similarity selection.

Raw card rows retain card identifier, card class, card building sqft, and card year built. Building
sqft is summed across unique cards; parcel land is counted once. Expected card count, supported
classes, complete building areas, and assessment-component arithmetic are reconciled before
automated analysis.

## Sale windows

A recent comparable sale must have a usable positive price and occur from three years before
through January 1 of the subject assessment year. Sales after January 1 are excluded from the
recent-sale calculation. Current date is never used for comparable-sale recency.

The source data does not reliably identify transaction relationships or conditions. Appeal Compass
does not infer arm's-length status, family transfers, foreclosure, concessions, or similar facts.

## Known public-data limits

- The current parcel universe does not expose reliable street-address fields. Public lookup remains
  PIN-only.
- Configured-year assessed-value rows may exist without usable values. The repository can use the
  latest value-bearing row and reports the limitation.
- Each AV component prefers Board, then certified, then mailed values. Effective AV values must
  reconcile arithmetically before affected calculations run.
- Missing neighborhood, year built, Total AV, land sqft, Land AV, or value evidence disables only
  the calculations that need it. Missing class, township, building sqft, Improvement AV, or a usable
  card count/reconciliation blocks core comparable analysis.
- Condo pools can be sparse and omit private unit attributes such as condition, floor, view,
  parking, or association information.
- PTAB public data cannot populate a complete adjusted comparison grid. Output must state that
  limitation without fabricating missing fields.
- Comparable-sales estimates are unadjusted for condition, exact location, lot differences,
  renovations, garages, amenities, concessions, and market time. They are screens, not appraisals.
- Parcel-specific tax estimates use the committed Clerk tax-code rate when found; otherwise the UI
  labels the 10% default assumption.

## Operational guardrails

- Cache TTL: 12 hours.
- Identical in-flight Socrata requests are coalesced per Worker instance.
- Per-case outbound Socrata concurrency is capped at 2.
- Comparable queries and the batched sale query are bounded and capped.
- Subject, analysis, legacy case, print, and packet builds share an assessment limiter capped at 4.
- Extra builds wait FIFO for up to 60 seconds; timeout returns a friendly retryable `503`.
- `/api/queue` reports active and queued counts.
- Case/packet traffic shares the Cloudflare case rate limiter; feedback/contact share the submission
  rate limiter.
- Turnstile, GitHub, Resend, and Socrata secrets remain server-side.

The annual refresh procedure is documented in [ANNUAL_UPDATE.md](ANNUAL_UPDATE.md).

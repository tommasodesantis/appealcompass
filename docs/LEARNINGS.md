# Appeal Compass Development Learnings

This document records implementation constraints that should survive future UI and data refreshes.

## Source and calendar authority

- Cook County Assessor calendar constants are maintained from the official authority because direct
  automated retrieval has returned CloudFront errors. Runtime output must identify the official
  source and warn after the configured session end.
- The official BOR dates page still needs a current-year schedule before the product can publish
  BOR opening, closing, or evidence dates. Do not reuse an expired prior-year schedule.
- PTAB's notice-based date excludes the notice day, includes day 30, and moves a weekend or Illinois
  legal-holiday expiration to the next business day. A later Cook County township-transmission date
  can control and is not observable from current inputs.

## Subject confirmation and provenance

- Subject lookup and confirmed analysis are separate server operations. Comparable queries must not
  run before subject review.
- Original public values are immutable analysis inputs. Confirmed documented corrections create a
  distinct effective parcel and override the corresponding value for every downstream operation.
- Class and township corrections must change the repository query itself. Neighborhood, sqft, year,
  and card-count corrections must change matching or similarity, not merely displayed text.
- Every manual correction requires a proof type; “Other documented proof” requires a description.
  The product records proof metadata but never accepts document uploads.
- Total AV always equals Improvement AV plus Land AV. A derived component must retain its arithmetic
  explanation and requires no second proof.
- Blocking fields are class, township, building sqft, Improvement AV, and usable card
  count/reconciliation. Other missing fields disable only dependent calculations.

## Property cards

- Preserve raw card identifier, class, building area, and year built after parcel aggregation.
- Sum building area across unique cards, use parcel land once, and reconcile expected card count.
- A multi-card subject review shows the raw card breakdown. A single-card review does not.
- Individual raw cards are informational in this version; corrections apply at the effective parcel
  level and to the total card count.

## Comparable analysis

- Residential uniformity uses Improvement AV per building sqft. Land AV per land sqft remains a
  separate evidence and savings path.
- Venue-specific filters run before the unchanged 50% size, 30% age, 20% distance score.
- The displayed universe ends at `0.50`; rows above `0.35` are context only.
- Fixed top 25%, 50%, and 75% groups use ascending similarity and `ceil`. Table filters, sort, and
  pagination never recalculate summary or evidence groups.
- Comparable-sale recency is anchored to January 1 of the subject assessment year. A group needs at
  least three usable recent sales before a median sale price per sqft or preliminary supported value
  is shown.
- Do not infer transaction type from fields the source does not provide.

## Evidence and savings

- Evidence types remain independent; the product does not accumulate points or issue an automatic
  recommendation.
- Always label official venue requirements separately from Appeal Compass thresholds. Percentile,
  gap, similarity, sample-size, and nested-group choices are product screens unless an official
  source explicitly says otherwise.
- Recorded sale, reported purchase, and appraisal remain separate choices. Flag a likely duplicate
  transaction without deleting either input.
- Comparable-sales market evidence uses median recent sale price per sqft times effective subject
  building sqft. It is unadjusted and is not an appraisal.
- Land savings uses median Land AV per sqft times effective subject land sqft, then adds effective
  Improvement AV.
- Multiple savings methods produce separate cards and separate XLSX sheets. Never merge them into a
  best or combined amount.
- Tax estimates retain `AV × equalizer × tax rate` and a ±20% range. Attach unusually large estimate
  warnings to the affected method.

## Exports and session state

- Packet evidence selection is independent from savings selection.
- The customized packet POST rebuilds server analysis and validates evidence/comparable IDs. The PDF
  includes evidence, selected rows, corrections, proof metadata, methodology, and limitations; it
  excludes savings, deadlines, filing instructions, checklists, and official-rule links.
- XLSX always includes all displayed comparables plus selected comparables and creates calculation
  sheets only for selected savings methods.
- Versioned in-tab state may restore navigation and selections, but it is never authoritative for
  server validation.
- Reconfirming subject data increments/replaces the revision and clears table selections, savings
  results, evidence selections, and dependent filters before recomputation.

## Socrata and runtime safeguards

- Keep Socrata access cache-first, coalesce identical requests, cap per-case outbound concurrency at
  2, cap assessments at 4, bound all queries, and batch comparable sales.
- Preserve queue transparency and the 60-second FIFO timeout.
- Keep fixture mode zero-network and test-only. Preserve case, submission, Turnstile, GitHub actor,
  and Resend validation tests.
- Keep secrets out of browser payloads, committed files, logs, reports, and exports.

## Annual refresh

Refresh the assessment year, equalizer, Clerk rate lookup, Assessor windows, BOR publication state,
official URLs, dataset IDs/fields, and authority cross-check fixtures. Then run the complete local
verification gate twice with no intervening edits.

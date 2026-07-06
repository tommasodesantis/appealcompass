# Deadline Cross-Check - 2026-07-06

## Source

- Authority file: `Assessment & Appeal Calendar _ Cook County Assessor's Office.pdf`
- Official page URL: `https://www.cookcountyassessoril.gov/assessment-calendar-and-deadlines`
- Authority page provenance in PDF: `Last updated: 6/29/26`
- Extracted on: 2026-07-06
- Extraction method: `pypdf` and PyMuPDF text extraction. The PDF is a print of the
  official Assessor calendar page and contains selectable text.

The authority text states that the township opening date is listed below, and the date
row is labeled `Reassessment Notice Date`. For routing, the configured Assessor opening
date is therefore the `Reassessment Notice Date`; the deadline is the `Last File Date`.

## Calendar Constant Diff

| Constant | Pre-update config | Authority file | Status | Updated config |
| --- | --- | --- | --- | --- |
| `ASSESSMENT_YEAR` | 2025 | 2026 assessment calendar | STALE | 2026 |
| `CCAO_CALENDAR.session_label` | Tax Year 2025 Assessor Appeal Windows | Tax Year 2026 Assessor Appeal Windows | STALE | Tax Year 2026 Assessor Appeal Windows |
| `CCAO_CALENDAR.session_end` | 2025-12-31 | Latest listed Assessor last-file date: 2026-08-12 | STALE | 2026-08-12 |
| `CCAO_CALENDAR.source_note` | Browser-loaded page last updated 1/27/26; direct automation CloudFront-blocked | Manual authority PDF last updated 6/29/26 | STALE | Manual authority PDF provenance recorded |
| `BOR_CALENDAR` | 2025-26 BOR PDF, session_end 2026-06-03 | Assessor PDF lists no BOR date values | MISSING | Retained BOR PDF source; see blocker |

## CCAO Township Window Diff

`Pre-update status` compares the authority file against the config that existed before
this iteration. `Updated config` shows the committed config after this cross-check.

| Township | Authority Assessor window | Certified / published | BOR field in authority file | Pre-update config | Pre-update status | Updated config |
| --- | --- | --- | --- | --- | --- | --- |
| Cicero | 2026-06-17 to 2026-07-31 | Not listed | Pass 1; no BOR dates listed | No row | MISSING | MATCH |
| Palos | 2026-06-03 to 2026-07-17 | Not listed | Pass 1; no BOR dates listed | No row | MISSING | MATCH |
| Berwyn | 2026-05-20 to 2026-07-06 | Not listed | Pass 1; no BOR dates listed | No row | MISSING | MATCH |
| Stickney | 2026-06-29 to 2026-08-12 | Not listed | Pass 1; no BOR dates listed | No row | MISSING | MATCH |
| Lyons | Not listed | Not listed | No BOR dates listed | No row | MISSING | MATCH |
| Bremen | Not listed | Not listed | No BOR dates listed | No row | MISSING | MATCH |
| Lemont | Not listed | Not listed | No BOR dates listed | No row | MISSING | MATCH |
| Worth | Not listed | Not listed | No BOR dates listed | No row | MISSING | MATCH |
| Calumet | Not listed | Not listed | No BOR dates listed | No row | MISSING | MATCH |
| Proviso | Not listed | Not listed | No BOR dates listed | No row | MISSING | MATCH |
| Orland | Not listed | Not listed | No BOR dates listed | No row | MISSING | MATCH |
| Thornton | Not listed | Not listed | No BOR dates listed | No row | MISSING | MATCH |
| Rich | Not listed | Not listed | No BOR dates listed | No row | MISSING | MATCH |
| Bloom | Not listed | Not listed | No BOR dates listed | No row | MISSING | MATCH |
| River Forest | 2026-04-20 to 2026-06-02 | 2026-06-23 / 2026-07-02 | Pass 2; no BOR dates listed | No row | MISSING | MATCH |
| Riverside | 2026-04-24 to 2026-06-08 | Not listed | Pass 1; no BOR dates listed | No row | MISSING | MATCH |
| Oak Park | 2026-05-06 to 2026-06-18 | Not listed | Pass 1; no BOR dates listed | No row | MISSING | MATCH |
| Lakeview | 2026-05-28 to 2026-07-13 | Not listed | Pass 1; no BOR dates listed | No row | MISSING | MATCH |
| Maine | 2026-06-05 to 2026-07-21 | Not listed | Pass 1; no BOR dates listed | No row | MISSING | MATCH |
| Elk Grove | 2026-06-22 to 2026-08-04 | Not listed | Pass 1; no BOR dates listed | No row | MISSING | MATCH |
| West Chicago | Not listed | Not listed | No BOR dates listed | No row | MISSING | MATCH |
| Northfield | Not listed | Not listed | No BOR dates listed | No row | MISSING | MATCH |
| Barrington | Not listed | Not listed | No BOR dates listed | No row | MISSING | MATCH |
| Hyde Park | Not listed | Not listed | No BOR dates listed | No row | MISSING | MATCH |
| Leyden | Not listed | Not listed | No BOR dates listed | No row | MISSING | MATCH |
| Lake | Not listed | Not listed | No BOR dates listed | No row | MISSING | MATCH |
| Wheeling | Not listed | Not listed | No BOR dates listed | No row | MISSING | MATCH |
| Palatine | Not listed | Not listed | No BOR dates listed | No row | MISSING | MATCH |
| Jefferson | Not listed | Not listed | No BOR dates listed | No row | MISSING | MATCH |
| Schaumburg | Not listed | Not listed | No BOR dates listed | No row | MISSING | MATCH |
| North Chicago | Not listed | Not listed | No BOR dates listed | No row | MISSING | MATCH |
| Niles | Not listed | Not listed | No BOR dates listed | No row | MISSING | MATCH |
| Hanover | Not listed | Not listed | No BOR dates listed | No row | MISSING | MATCH |
| South Chicago | Not listed | Not listed | No BOR dates listed | No row | MISSING | MATCH |
| Norwood Park | 2026-04-13 to 2026-05-26 | 2026-06-11 / 2026-06-18 | Pass 2; no BOR dates listed | No row | MISSING | MATCH |
| Rogers Park | 2026-04-17 to 2026-06-01 | 2026-06-23 / 2026-07-01 | Pass 2; no BOR dates listed | 2025-02-01 to 2025-03-03 | CONFLICT | MATCH |
| Evanston | 2026-04-22 to 2026-06-04 | Not listed | Pass 1; no BOR dates listed | No row | MISSING | MATCH |
| New Trier | 2026-05-07 to 2026-06-22 | Not listed | Pass 1; no BOR dates listed | No row | MISSING | MATCH |

## BOR Cross-Check

The authority file contains a repeated field labeled `Last File Date Board of Review
Appeal Dates`, plus a `Pass` value for some rows. It does not contain BOR open dates,
close dates, evidence deadlines, or group date ranges. Because no BOR date values are
extractable from this Assessor PDF, the BOR rows cannot supersede `BOR_GROUPS` or
`BOR_CALENDAR`.

Current result:

- `BOR_CALENDAR`: STALE as of 2026-07-06 because the configured 2025-26 session end
  is 2026-06-03.
- `BOR_GROUPS`: retained from the official BOR PDF source because the Assessor PDF
  provides no replacement date values.
- `BLOCKERS.md`: updated to record that automated calendar refresh remains
  CloudFront-blocked, while the manual Assessor PDF now supersedes stale CCAO constants.

## Regression Coverage Added

- Seven official in-window township cases route to the Assessor with the authority
  deadline: Berwyn, Cicero, Palos, Lakeview, Maine, Elk Grove, and Stickney.
- A date after all configured CCAO and BOR windows routes closed and still emits
  staleness warnings.
- The machine-readable JSON artifact is checked against `CCAO_WINDOWS` so the report
  and config stay synchronized.

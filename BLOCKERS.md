# Blockers

## 2026-07-06 - Cook County Assessor calendar source automation blocked

- Attempted source: `https://www.cookcountyassessor.com/assessment-calendar-and-deadlines`
- VPN retest: direct `curl.exe` fetch still returns CloudFront 403 after redirect to `https://www.cookcountyassessoril.gov/assessment-calendar-and-deadlines`.
- Browser-access retest: the official redirected calendar page loaded on 2026-07-06 and reported `Last updated: 1/27/26`.
- Manual authority file supplied for Phase 2: `Assessment & Appeal Calendar _ Cook County Assessor's Office.pdf`.
- Manual authority file provenance: official Assessor calendar printout, `Last updated: 6/29/26`,
  extracted locally on 2026-07-06.
- Socrata retest: live Cook County Socrata API calls work through the VPN path and passed the 10-property smoke run in `reports/live_smoke_2026-07-06.md`.
- Mitigation now applied: the manual authority file supersedes the stale CCAO constants. CCAO
  windows are centralized in `appeal_tool/config.py`; routing emits staleness warnings after the
  extracted authority file's latest listed Assessor deadline, and points users to the official
  Assessor URL instead of presenting stale dates as guaranteed current.
- Remaining blocker: automated local refresh of the CCAO calendar source is still blocked by CloudFront, so calendar constants must be manually verified at the official page until direct fetch access is available.

## 2026-07-06 - Assessor authority PDF does not provide BOR date values

- Attempted source: `Assessment & Appeal Calendar _ Cook County Assessor's Office.pdf`, extracted
  on 2026-07-06.
- Measured evidence: each township row repeats a `Last File Date Board of Review Appeal Dates`
  field, and some rows show `Pass 1` or `Pass 2`, but the PDF provides no BOR open date, close
  date, or evidence deadline values.
- Why this blocks fuller BOR calendar alignment: `BOR_GROUPS` requires concrete open/close/evidence
  deadlines. The Assessor PDF cannot safely supersede the official BOR date PDF without those
  values.
- Fallback strategy: retain `BOR_GROUPS` and `BOR_CALENDAR` from the official BOR PDF source,
  keep BOR staleness warnings active after the configured 2025-26 session end, and update BOR
  constants only from an official BOR source that lists actual township date ranges.

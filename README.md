# Appeal Compass

Appeal Compass is a webapp for screening residential parcels for property-tax appeal evidence. It
is designed to support multiple jurisdictions over time; Cook County, Illinois is the first
implemented jurisdiction.

It loads public county data server-side, helps a homeowner evaluate the selected Assessor, Board of
Review, or PTAB path, and generates a print-optimized evidence packet that can be saved as PDF from
the browser.

## Why this tool?

Property taxes are rising in many jurisdictions, and homeowners often have to navigate appeal rules
without affordable, practical software support. This project exists because there was no
open-source DIY property-tax-appeal tool built to help individual homeowners screen their own case.

## What It Does

- Looks up a residential parcel by PIN.
- Screens public data for Improvement AV/sqft uniformity, sale/appraisal, factual-error,
  land-component, and assessment-shock evidence.
- Notes other possible appeal factors the homeowner may document directly, such as condition,
  vacancy, demolition, and exemption-related statuses.
- Lets the homeowner explicitly choose Cook County Assessor, Cook County Board of Review, or
  Illinois PTAB and reports the selected venue's current window status.
- Shows deadlines, days remaining, official-source links, warning messages, comparable evidence,
  estimated savings assumptions, and a venue-specific checklist.
- Uses an approximate parcel-specific Cook County Clerk tax-code rate when available, otherwise
  labels the 10% county default assumption used for rough savings estimates.
- Shows comparable PINs, distance, neighborhood, class, building facts, latest usable sale,
  Improvement AV/sqft, and similarity score.
- Lets users filter displayed comparable evidence by similarity-score strictness while preserving
  the full similar-home pool in the workbook.
- Runs a separate Land AV/land sqft check so lot-size effects and possible land/factual-error
  issues are not confused with building uniformity evidence.
- Requests user-supplied values only after review, and only for missing public fields needed for
  comparable analysis.
- Produces a concise printable comparable-analysis packet at `/print`.
- Downloads the similarity-filtered selected pool, full selected similar-home pool, and savings
  assumptions as a `.xlsx` workbook. Higher-assessed rows remain visible for transparency.
- Restores the last successful in-tab assessment from `sessionStorage` when a user returns from the
  print page.
- Provides Turnstile-protected problem-reporting, feature-suggestion, and commercial-interest forms when
  deployment secrets are configured.

## What It Does Not Do

- It is NOT LEGAL ADVICE.
- It does not file an appeal for you.
- It does not represent LLCs, corporations, condo associations, or other entities. Those filers
  generally need an attorney.
- It does not guess missing deadlines or facts. PTAB dates require the date on the written BOR
  decision notice and explain that the later Cook County township-transmission date may control.
- It does not promise savings. Estimated savings are rough ranges using the configured equalizer and
  tax-rate assumptions, including the shown Clerk tax-code rate or fallback default.
- It does not currently determine whether a homeowner qualifies for an exemption. A future
  questionnaire may help owners understand whether they might qualify for an exemption, but official
  eligibility must still be verified with the venue.

## Appeal Ladder

1. Cook County Assessor appeal: first-level appeal during the township filing window. This is also
   where property-description errors and Certificates of Error for prior-year factual errors or
   missed exemptions are surfaced.
2. Board of Review appeal: second-level appeal under the BOR township calendar and official rules.
3. Illinois Property Tax Appeal Board: state-level appeal after a BOR decision. PTAB filing is due
   within 30 days of the written BOR decision notice or the later Cook County township-transmission
   date. The app shows a conservative notice-based date and shifts a weekend or Illinois
   legal-holiday expiration to the next business day.

Every deadline shown by the app links users back to the official venue source and tells them to
verify before filing.

## Local Development

Install dependencies:

```powershell
npm install
```

Create `.dev.vars` for local Wrangler development:

```powershell
SOCRATA_APP_TOKEN=your_token_here
TURNSTILE_SECRET_KEY=your_turnstile_secret_here
GITHUB_ISSUES_TOKEN=your_github_issues_token_here
RESEND_API_KEY=your_resend_api_key_here
```

Secrets stay server-side. Do not put Socrata tokens, GitHub tokens, Resend API keys, or Turnstile
secret keys in committed files, browser code, logs, or reports.

Public deployment constants live in `src/domain/publicConfig.ts`:

- `TURNSTILE_SITE_KEY`: public Turnstile site key used by the report and contact widgets.

Run locally:

```powershell
npm run dev
```

Then open `http://127.0.0.1:8787`.

Useful endpoints:

- `GET /api/health`
- `GET /api/queue`
- `GET /api/case?pin=03-00-000-000-0001&venue=assessor&ownershipType=individual`
- `POST /api/report`
- `POST /api/contact`
- `GET /print?pin=03-00-000-000-0001&venue=assessor&ownershipType=individual`
- `GET /methodology`

Street-address lookup and example-property browsing are not public features. Users should recover
their PIN from the Cook County Property Tax Portal and enter it directly.

## Testing

```powershell
npm run verify
```

`verify` builds the tiny browser bundle, runs Biome linting, TypeScript typechecking, and all
Vitest tests.

Fixture smoke against a running local Worker:

```powershell
npm run dev
npm run smoke:fixtures
```

## Data Sources

The Worker reads Cook County Socrata datasets server-side:

- Parcel universe: `nj4t-kc8j`
- Assessed values: `uzyt-m557`
- Residential characteristics: `x54s-btds`
- Parcel sales: `wvhk-k5uv`

The app also includes a committed Cook County Clerk tax-code-rate lookup generated from the latest
verified Clerk Tax Code Agency Rate file and refreshed through the annual update procedure.

See [docs/DATA_SOURCES.md](docs/DATA_SOURCES.md) and [docs/LEARNINGS.md](docs/LEARNINGS.md) for
dataset quirks, public-data limits, comparable feasibility findings, concurrency limits, and annual
update notes.

## Deploying To Cloudflare

This repository is deploy-ready but this project does not deploy automatically.

1. Authenticate Wrangler.
2. Add the production secrets:

   ```powershell
   npx wrangler secret put SOCRATA_APP_TOKEN
   npx wrangler secret put TURNSTILE_SECRET_KEY
   npx wrangler secret put GITHUB_ISSUES_TOKEN
   npx wrangler secret put RESEND_API_KEY
   ```

3. Set the public Turnstile constant in `src/domain/publicConfig.ts` if the report and contact forms
   should be enabled.
4. Review `wrangler.jsonc`.
5. Deploy intentionally:

   ```powershell
   npx wrangler deploy
   ```

The browser talks only to the Worker API; the Socrata token is never sent client-side.

## License

Appeal Compass is open source under GPLv3. See [LICENSE](LICENSE).

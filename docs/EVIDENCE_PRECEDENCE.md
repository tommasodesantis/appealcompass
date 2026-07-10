# Evidence Precedence

Appeal Compass keeps official public data separate from homeowner-entered values. Positive public
values win when present. User-supplied values are fallback-only, labeled as user-supplied, and
never silently replace official public data.

| Field | Public data | User data | Rule |
| --- | --- | --- | --- |
| Building sqft | Wins when present and positive | Fallback only when public sqft is missing or non-positive | User sqft never silently overrides public sqft; a documented conflict of 5% or more produces a property-description argument. |
| Total AV | Wins when present and positive | Fallback only when public total AV is missing or non-positive | Used for market-value context, overvaluation checks, total-value breakdowns, and savings estimates. It must not generate standalone residential uniformity evidence. |
| Improvement AV | Wins when present and positive | Fallback only when public improvement AV is missing or non-positive | Used for residential comparable uniformity evidence in every venue. User improvement AV is labeled user-supplied. |
| Land AV | Wins when present and positive | No user fallback in the app | Used only for the separate Land AV/land sqft diagnostic. |
| Sale price | A qualifying subject recorded sale may be used | A qualifying user purchase supersedes a recorded sale | Both are labeled by source. The date window is tied to the assessment year and venue, and a positive implied-value gap must reach 5% to become actionable. Comparable-property sales are context only. |
| Appraisal | Not public | One documented subject appraisal may be entered instead of a purchase | The appraisal is labeled user-supplied and screened by assessment year and venue. Stale evidence remains context only; a qualifying positive implied-value gap must reach 5% to become actionable. |

Non-positive numeric values are treated as missing. This is intentional because public assessment
and square-footage fields with `0` do not support a meaningful per-square-foot or savings
calculation.

The public UI asks for user-supplied values only after a review has started and only when public
fields necessary for comparable analysis are missing. A separate collapsed form accepts one
optional subject purchase or appraisal after the review starts. Condition, vacancy, and exemption
documentation remain venue-submission evidence rather than initial lookup inputs.

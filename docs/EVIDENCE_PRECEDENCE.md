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
| Sale price | Recorded sale may be used | User purchase price supersedes recorded sale when provided | Both are labeled by source. The sale-recency rule applies to both before either can support overvaluation. |
| Appraisal | Not public | Used as overvaluation evidence when provided | User appraisal is labeled user-supplied and has highest precedence among value evidence. |

Non-positive numeric values are treated as missing. This is intentional because public assessment
and square-footage fields with `0` do not support a meaningful per-square-foot or savings
calculation.

The public UI asks for user-supplied values only after a review has started and only when public
fields necessary for comparable analysis are missing. Purchase, appraisal, condition, vacancy, and
exemption documentation are described as venue-submission evidence rather than collected in the
initial lookup form.

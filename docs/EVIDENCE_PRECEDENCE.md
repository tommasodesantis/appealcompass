# Evidence Precedence

Appeal Compass keeps original public facts and confirmed effective facts separately auditable.
Public values initialize the subject-review step. After explicit confirmation, a documented user
correction overrides the corresponding public value for every downstream calculation without
altering or deleting the original public value.

| Provenance | Meaning | Downstream treatment |
| --- | --- | --- |
| `public` | Unchanged public value | Used as the effective value. |
| `user_corrected` | Documented replacement for a present public value | Overrides the public value for repository selection, similarity, evidence, savings, PDF, and XLSX calculations. |
| `user_added` | Documented value supplied where public data was missing | Becomes the effective value for the same downstream uses. |
| `derived` | Arithmetic counterpart created by AV reconciliation | Used as an effective value, exported with the exact derivation, and does not require separate proof. |

Every manual correction or addition requires one proof type. The proof is recorded in the payload
and exports, but the document itself is not uploaded or stored. The owner must include it separately
with the appeal package.

## AV reconciliation

Appeal Compass always enforces:

`Total AV = Improvement AV + Land AV`

- Total AV cannot be corrected alone.
- Correcting Total AV requires manual Improvement AV and Land AV values whose sum matches exactly.
- If both components are corrected while Total AV is unchanged, their sum must equal the effective
  Total AV.
- If exactly one component is corrected, the owner either enters the other component manually or
  authorizes automatic recalculation while Total AV stays unchanged.
- Automatic reconciliation labels the counterpart `derived` and records the subtraction used.

Invalid, nonpositive, impossible, duplicate, or internally inconsistent corrections are rejected by
the server even if browser state contains them.

## Value evidence

A subject purchase or appraisal is separate from corrected property facts. Only one may be entered
per analysis, and it requires a value, the appropriate date (including “appraisal effective date”),
and a proof type. Recorded sale, user-reported purchase, and appraisal remain separate evidence
candidates; likely duplicate transactions are flagged rather than silently removed.

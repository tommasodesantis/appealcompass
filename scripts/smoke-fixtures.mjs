const baseUrl = process.env.SMOKE_BASE_URL ?? "http://127.0.0.1:8787";
const requiredStepOne = "ownershipType=individual";
const ptabStepOne = "ownershipType=individual&borNoticeReceived=yes";

const checks = [
  {
    label: "assessor sample",
    path: `/api/case?demo=1&pin=03-00-000-000-0001&venue=assessor&today=2026-05-01&${requiredStepOne}`,
    expect: ["\"venue\":\"assessor\"", "\"tier\":\"STRONG\""],
  },
  {
    label: "bor sample",
    path: `/api/case?demo=1&pin=03-00-000-000-0001&venue=bor&today=2025-07-10&${requiredStepOne}`,
    expect: ["\"venue\":\"bor\"", "\"What's Next?\""],
  },
  {
    label: "ptab sample",
    path: `/api/case?demo=1&pin=03-00-000-000-0001&venue=ptab&today=2026-06-01&${ptabStepOne}&borNoticeDate=2026-05-20`,
    expect: ["\"venue\":\"ptab\"", "\"What's Next?\""],
  },
  {
    label: "ptab awaiting notice",
    path: `/api/case?demo=1&pin=03-00-000-000-0001&venue=ptab&today=2026-06-01&ownershipType=individual&borNoticeReceived=no`,
    expect: ["\"actionStatus\":\"upcoming\"", "Waiting for BOR written notice"],
  },
  {
    label: "ptab expired",
    path: `/api/case?demo=1&pin=03-00-000-000-0001&venue=ptab&today=2026-07-06&${ptabStepOne}&borNoticeDate=2026-05-20`,
    expect: ["\"actionStatus\":\"expired\"", "2026-06-22"],
  },
  {
    label: "condo missing data",
    path: `/api/case?demo=1&pin=03-00-000-000-0020&venue=assessor&today=2026-05-01&${requiredStepOne}`,
    expect: ["\"status\":\"condo\"", "missing unit sqft"],
  },
  {
    label: "missing sqft",
    path: `/api/case?demo=1&pin=03-00-000-000-0030&venue=bor&today=2025-07-10&${requiredStepOne}`,
    expect: ["\"status\":\"insufficient_data\"", "Documented building sqft"],
  },
  {
    label: "bor schedule not published",
    path: `/api/case?demo=1&pin=03-00-000-000-0040&venue=bor&today=2025-07-10&${requiredStepOne}`,
    expect: ["\"venue\":\"bor\"", "2026 BOR dates not published yet"],
  },
  {
    label: "print ptab",
    path: `/print?demo=1&pin=03-00-000-000-0001&venue=ptab&today=2026-06-01&${ptabStepOne}&borNoticeDate=2026-05-20`,
    expect: ["Selected venue", "Illinois PTAB", "Comparable method"],
  },
  {
    label: "print assessor comps",
    path: `/print?demo=1&pin=03-00-000-000-0001&venue=assessor&today=2026-05-01&${requiredStepOne}`,
    expect: ["Year built", "Improvement AV/sqft", "Comparable analysis results"],
  },
];

const banned = ["PLACEHOLDER", "undefined", "NaN", ">null<"];

for (const check of checks) {
  const response = await fetch(new URL(check.path, baseUrl));
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`${check.label} failed with HTTP ${response.status}: ${text.slice(0, 300)}`);
  }
  for (const expected of check.expect) {
    if (!text.includes(expected)) {
      throw new Error(`${check.label} missing expected text: ${expected}`);
    }
  }
  for (const marker of banned) {
    if (text.includes(marker)) {
      throw new Error(`${check.label} contained banned text: ${marker}`);
    }
  }
  console.log(`ok - ${check.label}`);
}

console.log(`Fixture smoke passed against ${baseUrl}`);

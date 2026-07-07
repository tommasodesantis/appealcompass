const baseUrl = process.env.SMOKE_BASE_URL ?? "http://127.0.0.1:8787";

const checks = [
  {
    label: "assessor sample",
    path: "/api/case?demo=1&pin=03-00-000-000-0001&venue=assessor&today=2026-05-01",
    expect: ["\"venue\":\"assessor\"", "\"tier\":\"STRONG\""],
  },
  {
    label: "bor sample",
    path: "/api/case?demo=1&pin=03-00-000-000-0001&venue=bor&today=2025-07-10",
    expect: ["\"venue\":\"bor\"", "\"BOR Rules Checklist\""],
  },
  {
    label: "ptab sample",
    path: "/api/case?demo=1&pin=03-00-000-000-0001&venue=ptab&today=2026-06-01&borDecisionDate=2026-05-20",
    expect: ["\"venue\":\"ptab\"", "\"PTAB Checklist\""],
  },
  {
    label: "ptab needs input",
    path: "/api/case?demo=1&pin=03-00-000-000-0001&venue=ptab&today=2026-06-01",
    expect: ["\"actionStatus\":\"needs_input\"", "refuses to guess"],
  },
  {
    label: "ptab expired",
    path: "/api/case?demo=1&pin=03-00-000-000-0001&venue=ptab&today=2026-07-06&borDecisionDate=2026-05-20",
    expect: ["\"actionStatus\":\"expired\"", "Deadline was 2026-06-19"],
  },
  {
    label: "condo missing data",
    path: "/api/case?demo=1&pin=03-00-000-000-0020&venue=assessor&today=2026-05-01",
    expect: ["\"status\":\"condo\"", "missing unit sqft"],
  },
  {
    label: "missing sqft",
    path: "/api/case?demo=1&pin=03-00-000-000-0030&venue=bor&today=2025-07-10",
    expect: ["\"status\":\"insufficient_data\"", "--actual-sqft"],
  },
  {
    label: "unknown township closed",
    path: "/api/case?demo=1&pin=03-00-000-000-0040&venue=auto&today=2025-07-10",
    expect: ["\"venue\":\"closed\"", "No configured CCAO or BOR"],
  },
  {
    label: "print ptab",
    path: "/print?demo=1&pin=03-00-000-000-0001&venue=ptab&today=2026-06-01&borDecisionDate=2026-05-20",
    expect: ["PTAB Comparable Grid Public-Data Limits", "Print / Save as PDF"],
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

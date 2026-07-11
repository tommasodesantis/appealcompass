const baseUrl = process.env.SMOKE_BASE_URL ?? "http://127.0.0.1:8787";
const stepOne = {
  jurisdiction: "cook_county_il",
  venue: "assessor",
  ownershipType: "individual",
  borNoticeReceived: null,
  borNoticeDate: null,
  today: "2026-05-01",
};

const analysisBody = (overrides = {}) => ({
  pin: "03-00-000-000-0001",
  stepOne,
  corrections: [],
  valueEvidence: null,
  revision: 1,
  ...overrides,
});

const checks = [
  {
    label: "subject review",
    path: "/api/subject?demo=1&pin=03-00-000-000-0001&venue=assessor&ownershipType=individual&today=2026-05-01",
    expect: ['"phase":"subject"', '"publicParcel"', '"propertyCards"'],
  },
  {
    label: "confirmed analysis",
    path: "/api/analysis?demo=1",
    init: { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(analysisBody()) },
    expect: ['"phase":"analysis"', '"evidenceCandidates"', '"comparableSummary"'],
  },
  {
    label: "documented correction",
    path: "/api/analysis?demo=1",
    init: {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(
        analysisBody({
          revision: 2,
          corrections: [
            { field: "buildingSqft", value: 1900, proofType: "official_property_record_card" },
          ],
        }),
      ),
    },
    expect: ['"user_corrected"', '"buildingSqft":1900'],
  },
  {
    label: "multi-card subject",
    path: "/api/subject?demo=1&pin=03-00-000-000-0050&venue=assessor&ownershipType=individual&today=2026-05-01",
    expect: ['"cardCount":2', '"cardNumber":"2"'],
  },
  {
    label: "missing blocking field",
    path: "/api/subject?demo=1&pin=03-00-000-000-0030&venue=bor&ownershipType=individual&today=2026-05-01",
    expect: ['"blockingMissingFields":["buildingSqft"'],
  },
  {
    label: "PTAB awaiting notice",
    path: "/api/subject?demo=1&pin=03-00-000-000-0001&venue=ptab&ownershipType=individual&borNoticeReceived=no&today=2026-06-01",
    expect: ['"deadlineState":"awaiting_notice"'],
  },
  {
    label: "default print packet",
    path: "/print?demo=1&pin=03-00-000-000-0001&venue=assessor&ownershipType=individual&today=2026-05-01",
    expect: ["Owner-selected evidence", "Owner-selected comparable rows", "Improvement AV/sqft"],
  },
];

for (const check of checks) {
  const response = await fetch(new URL(check.path, baseUrl), check.init);
  const text = await response.text();
  if (!response.ok) throw new Error(`${check.label} failed with HTTP ${response.status}: ${text.slice(0, 300)}`);
  for (const expected of check.expect) {
    if (!text.includes(expected)) throw new Error(`${check.label} missing expected text: ${expected}`);
  }
  for (const marker of ["PLACEHOLDER", "undefined", "NaN", ">null<"]) {
    if (text.includes(marker)) throw new Error(`${check.label} contained banned text: ${marker}`);
  }
  console.log(`ok - ${check.label}`);
}

console.log(`Fixture smoke passed against ${baseUrl}`);

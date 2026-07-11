import worker from "./index";

const stepOne = {
  jurisdiction: "cook_county_il",
  venue: "assessor",
  ownershipType: "individual",
  borNoticeReceived: null,
  borNoticeDate: null,
  today: "2026-05-01",
};

function packetRequest(overrides: Record<string, unknown> = {}): Request {
  return new Request("http://example.test/api/packet?demo=1", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      pin: "03-00-000-000-0001",
      stepOne,
      corrections: [],
      valueEvidence: null,
      revision: 1,
      selection: {
        evidenceTypes: ["uniformity"],
        comparablePins: ["03000000000002", "03000000000003", "03000000000004"],
      },
      ...overrides,
    }),
  });
}

test("customized packet uses only selected evidence and selected comparable rows", async () => {
  const response = await worker.fetch(packetRequest(), {});
  expect(response.status).toBe(200);
  const html = await response.text();
  expect(html).toContain("Owner-selected evidence");
  expect(html).toContain("Uniformity");
  expect(html).not.toContain("Comparable-sales market evidence");
  expect(html).toContain("03-00-000-000-0002");
  expect(html).toContain("03-00-000-000-0003");
  expect(html).not.toContain("03-00-000-000-0010");
});

test("packet includes corrections, proof types, and derived reconciliation", async () => {
  const response = await worker.fetch(
    packetRequest({
      corrections: [
        {
          field: "currentImprovementAv",
          value: 48000,
          proofType: "assessment_notice_or_tax_document",
          reconciliation: "automatic",
        },
      ],
      selection: { evidenceTypes: ["property_corrections"], comparablePins: [] },
    }),
    {},
  );
  const html = await response.text();
  expect(html).toContain("Assessment notice or tax document");
  expect(html).toContain("derived");
  expect(html).toContain("Total AV");
});

test("multiple-card breakdown is included only for multi-card parcels", async () => {
  const multi = await worker.fetch(
    packetRequest({
      pin: "03-00-000-000-0050",
      selection: { evidenceTypes: ["uniformity"], comparablePins: ["03000000000051"] },
    }),
    {},
  );
  expect(await multi.text()).toContain("Residential property-card breakdown");
  const single = await worker.fetch(packetRequest(), {});
  expect(await single.text()).not.toContain("Residential property-card breakdown");
});

test("packet excludes savings, deadlines, checklists, links to official rules, and obsolete result language", async () => {
  const response = await worker.fetch(packetRequest(), {});
  const html = await response.text();
  for (const banned of [
    "Annual savings",
    "Estimated current tax",
    "Deadline status",
    "days remaining",
    "checklist",
    "Official source",
    "automatic recommendation",
  ]) {
    expect(html.toLowerCase()).not.toContain(banned.toLowerCase());
  }
});

test("GET print remains functional with a reasonable default packet", async () => {
  const response = await worker.fetch(
    new Request(
      "http://example.test/print?demo=1&pin=03-00-000-000-0001&venue=assessor&ownershipType=individual&today=2026-05-01",
    ),
    {},
  );
  expect(response.status).toBe(200);
  const html = await response.text();
  expect(html).toContain("Appeal Compass");
  expect(html).toContain("Owner-selected comparable rows");
});

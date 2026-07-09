import { buildDataNotices, cleanWarnings } from "./notices";

test("combines repeated year and characteristic warnings into clear notices", () => {
  const notices = buildDataNotices([
    "Residential characteristics were unavailable; square-foot and comparable analysis may be limited.",
    "We found a 2026 assessment row, but it did not include usable assessed values, so we're using the most recent value-bearing year (2025). Double-check current values at the official source.",
    "We found 2026 comparable assessment rows, but they did not include usable assessed values, so we're using 2025 value-bearing rows. Double-check current comparable values at the official source.",
    "No comparable characteristic rows were returned for the subject township/class.",
  ]);

  expect(notices).toHaveLength(2);
  expect(notices.map((notice) => notice.code)).toEqual([
    "assessment_year_fallback",
    "characteristics_limited",
  ]);
  expect(notices[0]?.summary).toContain("subject and comparable pool");
  expect(notices[0]?.summary).toContain("2025 values");
  expect(notices[1]?.summary).toContain("either the subject or comparable candidates");
});

test("removes documentation-required wording from compatibility warnings", () => {
  const warnings = cleanWarnings([
    "Using a user-supplied value; documentation required.",
    "Using a user-supplied value; documentation required.",
  ]);
  expect(warnings).toEqual(["Using a user-supplied value"]);
  expect(JSON.stringify(buildDataNotices(warnings)).toLowerCase()).not.toContain(
    "documentation required",
  );
});

test("does not repeat calendar staleness as a data note", () => {
  const notices = buildDataNotices([
    "Cook County Assessor configured calendar is past its session end (2026-08-12). Verify current deadlines at the official source.",
  ]);
  expect(notices).toEqual([]);
});

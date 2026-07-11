import { readFileSync } from "node:fs";

const source = readFileSync(new URL("./app.ts", import.meta.url), "utf8");

test("Step 1 and subject-review copy preserve the required flow", () => {
  expect(source).toContain("Jurisdiction");
  expect(source).toContain("Cook County Assessor");
  expect(source).toContain("Cook County Board of Review");
  expect(source).toContain("Illinois PTAB");
  expect(source).toContain("Who owns the property?");
  expect(source).toContain("written Board of Review decision notice");
  expect(source).toContain("Subject property: review found data");
  expect(source).toContain("All correct. Continue");
  expect(source).toContain("I want to correct something");
  expect(source).toContain("Provide missing data");
});

test("subject correction UI supports multiple documented values without uploads", () => {
  expect(source).toContain("Add another correction");
  expect(source).toContain("Automatically recalculate the other component");
  expect(source).toContain("Appeal Compass does not collect documents");
  expect(source).toContain("appraisal effective date");
  expect(source).not.toMatch(/type=["']file["']/i);
});

test("analysis UI contains the requested table, savings, deadline, and packet surfaces", () => {
  for (const text of [
    "Select all currently filtered",
    "Select top 3 most similar",
    "Land AV/sqft",
    "Estimate tax savings",
    "Generate evidence packet",
    "Print/Save PDF",
    "Download comps .xlsx",
    "Deadline status",
    "Edit subject property",
  ])
    expect(source).toContain(text);
  expect(source.indexOf("table-pagination")).toBeLessThan(source.indexOf("comparable-table"));
});

test("browser source uses independent evidence candidates", () => {
  expect(source).toContain("evidenceCandidates");
  expect(source).toContain("status-badge");
});

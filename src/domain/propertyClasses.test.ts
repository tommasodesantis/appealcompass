import { propertyClassDecision } from "./propertyClasses";

test.each(["202", "203", "212", "299"])("supports residential dwelling class %s", (code) => {
  expect(propertyClassDecision(code).supported).toBe(true);
});

test.each([
  ["597", "special commercial improvements"],
  ["591", "commercial property"],
  ["318", "mixed-use or multi-family property"],
  ["399", "multi-family property"],
  ["200", "vacant residential land"],
  ["218", "more than six units"],
  ["297", "special residential-class improvement"],
])("blocks unsupported class %s", (code, categoryText) => {
  const decision = propertyClassDecision(code);
  expect(decision.supported).toBe(false);
  expect(decision.category).toContain(categoryText);
});

test("blocks missing classes instead of guessing", () => {
  expect(propertyClassDecision(null)).toEqual({
    supported: false,
    propertyClass: "",
    category: "unknown property class",
  });
});

import { DEFAULT_PRINT_COMPARABLE_LIMIT, parsePrintComparableLimit } from "./printOptions";

test("print comparable limit accepts only the configured packet sizes", () => {
  expect(parsePrintComparableLimit("3")).toBe(3);
  expect(parsePrintComparableLimit("5")).toBe(5);
  expect(parsePrintComparableLimit("10")).toBe(10);
  expect(parsePrintComparableLimit("100")).toBe(DEFAULT_PRINT_COMPARABLE_LIMIT);
});

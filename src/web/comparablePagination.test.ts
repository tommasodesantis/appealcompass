import {
  DEFAULT_COMPARABLE_PAGE_SIZE,
  paginateComparables,
  parseComparablePageSize,
} from "./comparablePagination";

test("pagination clamps pages and reports the visible row range", () => {
  const rows = Array.from({ length: 23 }, (_, index) => index + 1);
  expect(paginateComparables(rows, 2, 10)).toMatchObject({
    pageRows: [11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
    currentPage: 2,
    totalPages: 3,
    startRow: 11,
    endRow: 20,
    totalRows: 23,
  });
  expect(paginateComparables(rows, 99, 10).currentPage).toBe(3);
});

test("page-size parsing accepts only configured choices", () => {
  expect(parseComparablePageSize("25")).toBe(25);
  expect(parseComparablePageSize("all")).toBe(DEFAULT_COMPARABLE_PAGE_SIZE);
});

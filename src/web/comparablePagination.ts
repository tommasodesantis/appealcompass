export const COMPARABLE_PAGE_SIZES = [5, 10, 25, 50] as const;
export type ComparablePageSize = (typeof COMPARABLE_PAGE_SIZES)[number];
export const DEFAULT_COMPARABLE_PAGE_SIZE: ComparablePageSize = 10;

export function parseComparablePageSize(value: string): ComparablePageSize {
  const parsed = Number(value);
  return COMPARABLE_PAGE_SIZES.includes(parsed as ComparablePageSize)
    ? (parsed as ComparablePageSize)
    : DEFAULT_COMPARABLE_PAGE_SIZE;
}

export function paginateComparables<T>(rows: T[], page: number, pageSize: number) {
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const currentPage = Math.min(Math.max(1, Math.floor(page)), totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const pageRows = rows.slice(startIndex, startIndex + pageSize);
  return {
    pageRows,
    currentPage,
    totalPages,
    startRow: rows.length === 0 ? 0 : startIndex + 1,
    endRow: Math.min(startIndex + pageRows.length, rows.length),
    totalRows: rows.length,
  };
}

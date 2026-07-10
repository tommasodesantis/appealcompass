export const PRINT_COMPARABLE_LIMITS = [3, 5, 10] as const;
export type PrintComparableLimit = (typeof PRINT_COMPARABLE_LIMITS)[number];
export const DEFAULT_PRINT_COMPARABLE_LIMIT: PrintComparableLimit = 10;

export function parsePrintComparableLimit(value: string | null): PrintComparableLimit {
  const parsed = Number(value);
  return PRINT_COMPARABLE_LIMITS.includes(parsed as PrintComparableLimit)
    ? (parsed as PrintComparableLimit)
    : DEFAULT_PRINT_COMPARABLE_LIMIT;
}

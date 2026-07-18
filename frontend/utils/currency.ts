/**
 * Formats a number to Nepali Rupees (Rs.) with South Asian comma grouping.
 * e.g., 150000 -> "Rs. 1,50,000"
 */
export function formatNepaliCurrency(amount: number | undefined | null): string {
  if (amount == null) return "Rs. 0";
  const formatted = new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(amount);
  return `Rs. ${formatted}`;
}

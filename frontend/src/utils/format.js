/** Formats a phone number as the user types.
 * Removes non-digit characters and limits the input to 10 digits.
 *
 * @param {string} phone - The phone number to format.
 * @returns {string} The formatted phone number.
 */
export function formatPhone(phone) {
  const digits = (phone ?? "").replace(/\D/g, "").slice(0, 10);
  if (digits.length === 0) return "";

  if (digits.length > 3 && digits.length <= 6)
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 7)}`;
  else if (digits.length > 6 && digits.length <= 10)
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;

  return digits;
}

/** Formats an amount as a dollar string with two decimals.
 *
 * @param {number|string|null} phone - The phone number to format.
 * @returns {string} The formatted amount (e.g. "$4,000.00"), or "-" if the value is missing or not a number.
 */
export function formatMoney(amount) {
  if (amount === null || amount === undefined || amount === "") return "-";

  const value = Number(amount);
  if (!Number.isFinite(value)) return "-";

  const formattedAmount = value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return "$" + formattedAmount;
}

/** Formats a count as a percentage of a total, with one decimal
 *
 * @param {number} amount - The count.
 * @param {number} totalAmount - The whole the count is part of.
 * @returns {string} e.g. "7.7%", or "0.0%" if totalAmount is missing or 0.
 */
export function formatPercentage(amount, totalAmount) {
  if (!totalAmount) return "0.0%";

  const count = amount ?? 0;

  return `${((count / totalAmount) * 100).toFixed(1)}%`;
}

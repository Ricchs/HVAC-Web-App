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

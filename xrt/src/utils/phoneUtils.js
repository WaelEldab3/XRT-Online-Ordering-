/**
 * Formats a raw phone number string into a readable format based on country code.
 *
 * Strategy (no external dependency):
 * - Strip all non-digit characters.
 * - Detect country prefix (1, 20, 44, 33, 49, 90, 966, 971, 20, etc.)
 * - Format accordingly.
 * - Falls back to grouping digits when country is unknown.
 *
 * @param {string|number} raw - Raw phone number (e.g. "15086748440", "+15086748440")
 * @returns {string} Formatted phone (e.g. "+1 (508) 674-8440")
 */

/** Map of country calling codes → formatters */
const COUNTRY_FORMATS = [
  // North America (NANP) - +1
  {
    prefix: '1',
    minLen: 11,
    maxLen: 11,
    format: (d) => `+1 (${d.slice(1, 4)}) ${d.slice(4, 7)}-${d.slice(7, 11)}`,
  },
  // UK - +44
  {
    prefix: '44',
    minLen: 12,
    maxLen: 12,
    format: (d) => `+44 ${d.slice(2, 6)} ${d.slice(6, 9)} ${d.slice(9, 12)}`,
  },
  // Egypt - +20
  {
    prefix: '20',
    minLen: 12,
    maxLen: 12,
    format: (d) => `+20 ${d.slice(2, 4)} ${d.slice(4, 8)} ${d.slice(8, 12)}`,
  },
  // Saudi Arabia - +966
  {
    prefix: '966',
    minLen: 12,
    maxLen: 12,
    format: (d) => `+966 ${d.slice(3, 5)} ${d.slice(5, 8)} ${d.slice(8, 12)}`,
  },
  // UAE - +971
  {
    prefix: '971',
    minLen: 12,
    maxLen: 12,
    format: (d) => `+971 ${d.slice(3, 5)} ${d.slice(5, 8)} ${d.slice(8, 12)}`,
  },
  // France - +33
  {
    prefix: '33',
    minLen: 11,
    maxLen: 11,
    format: (d) => `+33 ${d.slice(2, 3)} ${d.slice(3, 5)} ${d.slice(5, 7)} ${d.slice(7, 9)} ${d.slice(9, 11)}`,
  },
  // Germany - +49
  {
    prefix: '49',
    minLen: 11,
    maxLen: 13,
    format: (d) => `+49 ${d.slice(2, 5)} ${d.slice(5, 9)} ${d.slice(9)}`,
  },
  // Turkey - +90
  {
    prefix: '90',
    minLen: 12,
    maxLen: 12,
    format: (d) => `+90 (${d.slice(2, 5)}) ${d.slice(5, 8)} ${d.slice(8, 10)} ${d.slice(10, 12)}`,
  },
];

/**
 * Formats a raw phone number into a readable, country-aware string.
 * @param {string|number} raw
 * @returns {string}
 */
export function formatPhone(raw) {
  if (!raw) return '';

  // Strip everything except digits
  const digits = String(raw).replace(/\D/g, '');

  if (!digits) return String(raw);

  // Try to match a known country code
  for (const country of COUNTRY_FORMATS) {
    if (
      digits.startsWith(country.prefix) &&
      digits.length >= country.minLen &&
      digits.length <= country.maxLen
    ) {
      return country.format(digits);
    }
  }

  // Fallback: group digits nicely
  // If 10 digits, assume local US format without country code
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  }

  // Generic grouping: chunks of 3-3-4
  if (digits.length > 6) {
    const chunkSize = Math.ceil(digits.length / 3);
    const parts = [];
    for (let i = 0; i < digits.length; i += chunkSize) {
      parts.push(digits.slice(i, i + chunkSize));
    }
    return parts.join(' ');
  }

  return digits;
}

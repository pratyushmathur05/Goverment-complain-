/**
 * Aadhaar Utilities
 * ─────────────────
 * Verhoeff checksum algorithm — the same algorithm UIDAI uses to validate
 * Aadhaar numbers. If this check fails the number is structurally invalid
 * before any network call is made.
 *
 * Reference: https://en.wikipedia.org/wiki/Verhoeff_algorithm
 */

// Multiplication table
const d = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
  [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
  [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
  [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
  [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
  [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
  [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
  [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
  [9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
];

// Permutation table
const p = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
  [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
  [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
  [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
  [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
  [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
  [7, 0, 4, 6, 9, 1, 3, 2, 5, 8],
];

// Inverse table
const inv = [0, 4, 3, 2, 1, 5, 6, 7, 8, 9];

/**
 * Returns true if the 12-digit Aadhaar number passes the Verhoeff checksum.
 * Rejects obviously fake numbers like 000000000000 / 111111111111.
 */
export function validateAadhaar(raw: string): boolean {
  const digits = raw.replace(/\s/g, '');
  if (digits.length !== 12) return false;
  if (!/^\d{12}$/.test(digits)) return false;

  // Reject obviously invalid repeating-digit numbers
  if (/^(\d)\1{11}$/.test(digits)) return false;

  // Verhoeff checksum
  let c = 0;
  const reversed = digits.split('').reverse();
  for (let i = 0; i < reversed.length; i++) {
    c = d[c][p[i % 8][parseInt(reversed[i], 10)]];
  }
  return c === 0;
}

/**
 * Returns the masked display version: XXXX XXXX 1234
 * Used in the OTP-sent confirmation message.
 */
export function maskAadhaarDisplay(raw: string): string {
  const digits = raw.replace(/\s/g, '');
  if (digits.length < 4) return raw;
  return `XXXX XXXX ${digits.slice(-4)}`;
}

/**
 * Formatting utilities — currency, dates, strings.
 * All price display goes through formatPrice — never inline format in components.
 */

/**
 * Format PKR price in the understated luxury style.
 * No bold-red, no "Rs." in caps — just a clean numeric representation.
 */
export function formatPrice(amount) {
  if (amount == null) return '';
  return `PKR ${Number(amount).toLocaleString('en-PK')}`;
}

/**
 * Truncate a string to maxLength with ellipsis.
 */
export function truncate(str, maxLength = 120) {
  if (!str) return '';
  return str.length > maxLength ? str.slice(0, maxLength).trimEnd() + '…' : str;
}

/**
 * Convert a slug to a human-readable label.
 */
export function slugToLabel(slug) {
  if (!slug) return '';
  return slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

/**
 * Format a date string to a readable date.
 */
export function formatDate(dateString) {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-PK', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

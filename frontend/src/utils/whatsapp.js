/**
 * WhatsApp order hand-off helpers.
 * Builds the plain-text order message (never includes prices) and
 * the wa.me deep link. The target number always comes from the backend
 * config endpoint — never hardcoded here.
 */

export function buildWhatsAppMessage({ name, phone, city, address, note, items }) {
  const lines = ['New Order — Eminence Life Science', ''];

  if (name)  lines.push(`Name: ${name}`);
  if (phone) lines.push(`Phone: ${phone}`);
  if (city)  lines.push(`City: ${city}`);
  if (address) lines.push(`Address: ${address}`);

  if (items?.length) {
    lines.push('', 'Items:');
    lines.push(...items.map((i) => `• ${i.name} × ${i.quantity}`));
  }

  if (note && note.trim()) {
    lines.push('', `Note: ${note.trim()}`);
  }

  return lines.join('\n');
}

export function buildWhatsAppUrl(number, message) {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
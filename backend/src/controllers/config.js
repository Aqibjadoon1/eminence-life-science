/**
 * Public app configuration.
 * Single source for the WhatsApp order number — always read from the
 * WHATSAPP_ORDER_NUMBER env var; the client never hardcodes the number.
 */
export const WHATSAPP_ORDER_NUMBER =
  process.env.WHATSAPP_ORDER_NUMBER || '923105749480';

export function getWhatsappConfig(_req, res) {
  res.json({ data: { whatsappNumber: WHATSAPP_ORDER_NUMBER } });
}

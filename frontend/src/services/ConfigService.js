/**
 * Public config service — the WhatsApp order number is served by the API
 * (single source: WHATSAPP_ORDER_NUMBER env var on the backend). The
 * frontend never hardcodes the number.
 */
import client from './api.js';
import { API } from '../config.js';

export const ConfigService = {
  getWhatsappOrder: () =>
    client.get(API.WHATSAPP_ORDER).then((r) => r.data.data),
};

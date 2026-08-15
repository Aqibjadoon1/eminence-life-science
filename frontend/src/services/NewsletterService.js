import client from './api.js';
import { API } from '../config.js';

export const NewsletterService = {
  subscribe: (email) => client.post(API.NEWSLETTER, { email }).then((r) => r.data),
};

import client from './api.js';
import { API } from '../config.js';

export const CategoryService = {
  getAll: () =>
    client.get(API.CATEGORIES).then((r) => r.data),

  getProductsByCategory: (slug, params = {}) =>
    client.get(API.PRODUCTS_BY_CATEGORY(slug), { params }).then((r) => r.data),

  getAttributesForCategory: (slug) =>
    client.get(API.CATEGORY_ATTRIBUTES(slug)).then((r) => r.data),
};

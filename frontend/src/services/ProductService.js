import client from './api.js';
import { API } from '../config.js';

export const ProductService = {
  getAll: (params = {}) =>
    client.get(API.PRODUCTS, { params }).then((r) => r.data),

  getFeatured: () =>
    client.get(API.FEATURED).then((r) => r.data),

  getBestSellers: () =>
    client.get(API.BESTSELLERS).then((r) => r.data),

  getBySlug: (slug) =>
    client.get(API.PRODUCT(slug)).then((r) => r.data),

  getRelated: (slug) =>
    client.get(API.RELATED(slug)).then((r) => r.data),

  getByCategory: (slug, params = {}) =>
    client.get(API.PRODUCTS_BY_CATEGORY(slug), { params }).then((r) => r.data),
};

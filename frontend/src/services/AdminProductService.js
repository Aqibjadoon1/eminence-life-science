import client from './api.js';
import { API } from '../config.js';

export const AdminProductService = {
  getAll:      ()            => client.get(API.ADMIN_PRODUCTS).then((r) => r.data),
  create:      (data)        => client.post(API.ADMIN_PRODUCTS, data).then((r) => r.data),
  update:      (id, data)    => client.put(API.ADMIN_PRODUCT(id), data).then((r) => r.data),
  toggleActive:(id, active)  => client.patch(API.ADMIN_PRODUCT_ACTIVE(id), { is_active: active }).then((r) => r.data),
};

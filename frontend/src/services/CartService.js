import client from './api.js';
import { API } from '../config.js';

export const CartService = {
  get: ()                          => client.get(API.CART).then((r) => r.data),
  add: (product_id, quantity = 1)  => client.post(API.CART, { product_id, quantity }).then((r) => r.data),
  update: (itemId, quantity)       => client.patch(API.CART_ITEM(itemId), { quantity }).then((r) => r.data),
  remove: (itemId)                 => client.delete(API.CART_ITEM(itemId)).then((r) => r.data),
  clear: ()                        => client.delete(API.CART).then((r) => r.data),
  merge: ()                        => client.post(API.CART_MERGE).then((r) => r.data),
};

import client from './api.js';
import { API } from '../config.js';

export const OrderService = {
  create:  (data) => client.post(API.ORDERS, data).then((r) => r.data),
  getAll:  ()     => client.get(API.MY_ORDERS).then((r) => r.data),
  getById: (id)   => client.get(API.ORDER(id)).then((r) => r.data),
};

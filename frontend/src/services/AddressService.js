import client from './api.js';
import { API } from '../config.js';

export const AddressService = {
  create: (data) => client.post(API.ADDRESSES, data).then((r) => r.data),
};
import client from './api.js';
import { API } from '../config.js';

export const AuthService = {
  register: (data) => client.post(API.REGISTER, data).then((r) => r.data),
  login:    (data) => client.post(API.LOGIN, data).then((r) => r.data),
  logout:   ()     => client.post(API.LOGOUT).then((r) => r.data),
  me:       ()     => client.get(API.ME).then((r) => r.data),
};

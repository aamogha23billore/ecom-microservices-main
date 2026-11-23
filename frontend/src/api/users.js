import { request } from './client';

export const listUsers = (opts) => request('/api/users', opts);

export const getUser = (id, opts) => request(`/api/users/${encodeURIComponent(id)}`, opts);

// Registration happens before the person has a token.
export const createUser = (data) => request('/api/users', { method: 'POST', body: data, auth: false });

export const updateUser = (id, data) =>
  request(`/api/users/${encodeURIComponent(id)}`, { method: 'PUT', body: data });

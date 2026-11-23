import { request } from './client';

export const listProducts = (opts) => request('/api/products', opts);

export const searchProducts = (keyword, opts) =>
  request(`/api/products/search?keyword=${encodeURIComponent(keyword)}`, opts);

export const getProduct = (id, opts) => request(`/api/products/${encodeURIComponent(id)}`, opts);

export const createProduct = (data) => request('/api/products', { method: 'POST', body: data });

export const updateProduct = (id, data) =>
  request(`/api/products/${encodeURIComponent(id)}`, { method: 'PUT', body: data });

// Backend performs a soft delete (active=false).
export const deleteProduct = (id) =>
  request(`/api/products/${encodeURIComponent(id)}`, { method: 'DELETE' });

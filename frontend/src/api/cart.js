import { request } from './client';

export const getCart = (userId, opts) => request('/api/cart', { ...opts, userId });

// Backend adds `quantity` on top of any existing line for the same product.
export const addToCart = (userId, productId, quantity = 1) =>
  request('/api/cart', {
    method: 'POST',
    userId,
    body: { productId: String(productId), quantity },
  });

// Sets the exact quantity of a line that is already in the cart.
export const updateCartItem = (userId, productId, quantity) =>
  request(`/api/cart/items/${encodeURIComponent(productId)}`, {
    method: 'PUT',
    userId,
    body: { quantity },
  });

export const removeFromCart = (userId, productId) =>
  request(`/api/cart/items/${encodeURIComponent(productId)}`, { method: 'DELETE', userId });

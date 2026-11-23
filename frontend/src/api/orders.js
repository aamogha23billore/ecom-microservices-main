import { request } from './client';

// Turns the current cart into an order (the backend clears the cart).
export const createOrder = (userId) =>
  request('/api/orders', { method: 'POST', userId });

// Creates a Stripe Checkout Session and pending order
export const createCheckoutSession = (userId, data = {}) =>
  request('/api/orders/checkout', { method: 'POST', userId, body: data });

// Verifies and confirms Stripe payment after redirect
export const confirmPayment = (sessionId, userId) =>
  request(`/api/orders/confirm-payment?sessionId=${encodeURIComponent(sessionId)}`, { method: 'GET', userId });

// Order history for one customer, newest first.
export const listOrders = (userId, opts) =>
  request('/api/orders/user', { ...opts, userId });

// Pure read: fetches the already confirmed order by Stripe session ID
export const getOrderBySession = (sessionId, userId) =>
  request(
    `/api/orders/by-session?sessionId=${encodeURIComponent(sessionId)}`,
    { method: 'GET', userId }
  );
import keycloak from '../auth/keycloak';
import { config } from '../config';

export class ApiError extends Error {
  constructor(message, { status = 0, body = null } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

async function getToken() {
  try {
    // Refreshes only when the token expires within 30s.
    await keycloak.updateToken(30);
  } catch {
    throw new ApiError('Your session has expired. Please sign in again.', { status: 401 });
  }
  return keycloak.token;
}

function messageFor(status, body) {
  // Gateway circuit-breaker fallback answers 503 with a JSON array of strings.
  if (Array.isArray(body) && body.length && body.every((x) => typeof x === 'string')) {
    return body.join(' ');
  }
  if (body && typeof body === 'object' && typeof body.message === 'string' && body.message) {
    return body.message;
  }
  if (typeof body === 'string' && body.trim() && body.length < 200 && !body.trim().startsWith('<')) {
    return body.trim();
  }
  switch (status) {
    case 400:
      return 'The server could not complete that request.';
    case 401:
      return 'The server did not accept your session. Try signing out and in again.';
    case 403:
      return 'You do not have permission to do that.';
    case 404:
      return 'Not found.';
    case 429:
      return 'Too many requests. Please wait a moment and try again.';
    case 502:
    case 503:
    case 504:
      return 'A service is temporarily unavailable. Please try again shortly.';
    default:
      return status >= 500 ? 'Something went wrong on the server.' : `Request failed (${status}).`;
  }
}

/**
 * Thin fetch wrapper for the API gateway.
 *  - attaches the Keycloak bearer token (unless auth: false)
 *  - attaches X-User-ID when provided (cart + orders need it)
 *  - tolerates empty bodies and plain-text bodies (the backend returns both)
 */
export async function request(
  path,
  { method = 'GET', body, userId, signal, auth = true } = {},
) {
  const headers = { Accept: 'application/json, text/plain, */*' };
  if (auth) headers.Authorization = `Bearer ${await getToken()}`;
  if (userId) headers['X-User-ID'] = String(userId);

  let payload;
  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }

  let response;
  try {
    response = await fetch(`${config.apiBaseUrl}${path}`, { method, headers, body: payload, signal });
  } catch (err) {
    if (err?.name === 'AbortError') throw err;
    throw new ApiError('Cannot reach the server. Is the API gateway running?', { status: 0 });
  }

  const text = await response.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!response.ok) {
    throw new ApiError(messageFor(response.status, data), { status: response.status, body: data });
  }
  return data;
}

export function errorMessage(err, fallback = 'Something went wrong.') {
  return err?.message || fallback;
}

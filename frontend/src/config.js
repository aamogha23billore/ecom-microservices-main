const env = import.meta.env ?? {};

export const config = {
  storeName: env.VITE_STORE_NAME || 'ecom',
  // Empty = same origin (Vite proxies /api to the gateway in dev).
  apiBaseUrl: (env.VITE_API_BASE_URL || '').replace(/\/+$/, ''),
  keycloak: {
    url: (env.VITE_KEYCLOAK_URL || 'http://localhost:8443').replace(/\/+$/, ''),
    realm: env.VITE_KEYCLOAK_REALM || 'ecom-app',
    clientId: env.VITE_KEYCLOAK_CLIENT_ID || 'oauth2-pkce',
    scope: env.VITE_KEYCLOAK_SCOPE || 'openid profile roles email',
  },
  currency: env.VITE_CURRENCY || 'INR',
  locale: env.VITE_LOCALE || 'en-IN', 
};

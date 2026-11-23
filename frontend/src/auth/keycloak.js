import Keycloak from 'keycloak-js';
import { config } from '../config';

// One Keycloak instance for the whole app (public client + PKCE, no secret).
const keycloak = new Keycloak({
  url: config.keycloak.url,
  realm: config.keycloak.realm,
  clientId: config.keycloak.clientId,
});

let initPromise = null;

// keycloak.init() may only run once per instance. React StrictMode runs
// effects twice in development, so we memoise the promise.
export function initKeycloak() {
  if (!initPromise) {
    initPromise = keycloak.init({
      onLoad: 'check-sso',
      silentCheckSsoRedirectUri: `${window.location.origin}/silent-check-sso.html`,
      pkceMethod: 'S256',
      checkLoginIframe: false,
      scope: config.keycloak.scope,
    });
  }
  return initPromise;
}

export default keycloak;

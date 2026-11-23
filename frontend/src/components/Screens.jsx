import { config } from '../config';
import { AlertIcon } from './Icons';

export function SplashScreen() {
  return (
    <div className="splash" role="status" aria-label="Loading">
      <div className="splash__mark">
        {config.storeName}
        <span className="wordmark__dot">.</span>
      </div>
    </div>
  );
}

export function AuthErrorScreen({ error }) {
  const timedOut = error?.message === 'timeout';
  return (
    <div className="splash splash--error">
      <div className="state state--card" role="alert">
        <div className="state__icon">
          <AlertIcon size={28} />
        </div>
        <h3>We can’t reach the sign-in service</h3>
        <p>
          {timedOut
            ? 'Keycloak did not answer in time.'
            : 'Keycloak could not be initialised.'}{' '}
          Check the following, then reload.
        </p>
        <ul className="checklist">
          <li>
            Keycloak is running at <code>{config.keycloak.url}</code>
          </li>
          <li>
            Realm <code>{config.keycloak.realm}</code> has a public client <code>{config.keycloak.clientId}</code>
          </li>
          <li>
            Valid redirect URIs include <code>{window.location.origin}/*</code>
          </li>
          <li>
            Web origins include <code>{window.location.origin}</code>
          </li>
        </ul>
        <button type="button" className="btn btn--primary" onClick={() => window.location.reload()}>
          Reload
        </button>
      </div>
    </div>
  );
}

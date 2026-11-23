import { useAuth } from '../auth/AuthContext';
import { InfoIcon } from './Icons';

export default function ProfileMissing() {
  const { user, logout, reloadProfile } = useAuth();
  return (
    <div className="container">
      <div className="state">
        <div className="state__icon">
          <InfoIcon size={28} />
        </div>
        <h3>No customer profile found</h3>
        <p>
          You’re signed in{user?.username ? ` as ${user.username}` : ''}, but the user service has no customer record
          linked to this login. Accounts created with <strong>Create account</strong> get one automatically.
        </p>
        <div className="state__actions">
          <button type="button" className="btn btn--secondary" onClick={reloadProfile}>
            Check again
          </button>
          <button type="button" className="btn btn--ghost" onClick={logout}>
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}

import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { errorMessage } from '../api/client';
import EmptyState from './EmptyState';
import ErrorState from './ErrorState';
import PageLoader from './PageLoader';
import ProfileMissing from './ProfileMissing';
import { ShieldIcon } from './Icons';

/**
 * Route guard.
 *  - needsProfile: page needs the store profile (its id is the X-User-ID)
 *  - admin: page is only for ADMIN users
 */
export default function Protected({ children, needsProfile = false, admin = false }) {
  const { authenticated, profileStatus, profileError, reloadProfile, isAdmin } = useAuth();

  if (!authenticated) return <Navigate to="/" replace />;

  if (needsProfile || admin) {
    if (profileStatus === 'idle' || profileStatus === 'loading') {
      return <PageLoader label="Loading your account…" />;
    }
    if (profileStatus === 'error') {
      return (
        <div className="container">
          <ErrorState
            title="We couldn’t load your account"
            message={errorMessage(profileError)}
            onRetry={reloadProfile}
          />
        </div>
      );
    }
  }

  if (needsProfile && profileStatus === 'missing') return <ProfileMissing />;

  if (admin && !isAdmin) {
    return (
      <div className="container">
        <EmptyState
          icon={<ShieldIcon size={28} />}
          title="Admins only"
          message="Your account doesn’t have access to this page."
          action={
            <Link className="btn btn--secondary" to="/">
              Back to shop
            </Link>
          }
        />
      </div>
    );
  }

  return children;
}

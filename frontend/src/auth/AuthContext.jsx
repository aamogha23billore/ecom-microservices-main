import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import keycloak, { initKeycloak } from './keycloak';
import { config } from '../config';
import { listUsers } from '../api/users';

const AuthContext = createContext(null);

// If Keycloak is down or the client's redirect URIs are wrong, init can hang
// forever. Fail with a helpful screen instead of an endless spinner.
const INIT_TIMEOUT_MS = 10000;

function withTimeout(promise, ms) {
  return new Promise((resolve, reject) => {
    const id = setTimeout(() => reject(new Error('timeout')), ms);
    promise.then(
      (value) => {
        clearTimeout(id);
        resolve(value);
      },
      (error) => {
        clearTimeout(id);
        reject(error);
      },
    );
  });
}

function readUserFromToken() {
  const token = keycloak.tokenParsed ?? {};
  const roles = [
    ...(token.resource_access?.[config.keycloak.clientId]?.roles ?? []),
    ...(token.realm_access?.roles ?? []),
  ].map((role) => String(role).toUpperCase());

  return {
    id: token.sub,
    username: token.preferred_username,
    email: token.email,
    name:
      token.name ||
      [token.given_name, token.family_name].filter(Boolean).join(' ') ||
      token.preferred_username ||
      '',
    roles,
  };
}

export function AuthProvider({ children }) {
  const [init, setInit] = useState({ status: 'initializing', error: null });
  const [authenticated, setAuthenticated] = useState(false);
  const [profile, setProfile] = useState(null);
  const [profileState, setProfileState] = useState({ status: 'idle', error: null });

  // 1) Initialise Keycloak (handles the redirect back from the login page).
  useEffect(() => {
    let cancelled = false;

    withTimeout(initKeycloak(), INIT_TIMEOUT_MS).then(
      (isAuthenticated) => {
        if (cancelled) return;
        setAuthenticated(Boolean(isAuthenticated));
        setInit({ status: 'ready', error: null });
      },
      (error) => {
        if (cancelled) return;
        setInit({ status: 'error', error });
      },
    );

    keycloak.onTokenExpired = () => {
      keycloak.updateToken(30).catch(() => setAuthenticated(false));
    };
    keycloak.onAuthLogout = () => setAuthenticated(false);

    return () => {
      cancelled = true;
    };
  }, []);

  // 2) Find the store profile (Mongo user) that belongs to this Keycloak user.
  //    Cart + orders identify people by that Mongo id (X-User-ID header).
  const loadProfile = useCallback(async () => {
    setProfileState({ status: 'loading', error: null });
    try {
      const subject = keycloak.tokenParsed?.sub;
      const users = await listUsers();
      const me = (Array.isArray(users) ? users : []).find(
        (candidate) => (candidate.keyCloakId ?? candidate.keycloakId) === subject,
      );
      if (me) {
        setProfile(me);
        setProfileState({ status: 'ready', error: null });
      } else {
        setProfile(null);
        setProfileState({ status: 'missing', error: null });
      }
    } catch (error) {
      setProfileState({ status: 'error', error });
    }
  }, []);

  useEffect(() => {
    if (init.status !== 'ready') return;
    if (authenticated) {
      loadProfile();
    } else {
      setProfile(null);
      setProfileState({ status: 'idle', error: null });
    }
  }, [init.status, authenticated, loadProfile]);

  const user = useMemo(() => (authenticated ? readUserFromToken() : null), [authenticated]);
  const isAdmin = Boolean(user?.roles.includes('ADMIN') || profile?.role === 'ADMIN');

  const login = useCallback((options) => keycloak.login(options), []);
  const logout = useCallback(() => keycloak.logout({ redirectUri: window.location.origin }), []);

  const value = useMemo(
    () => ({
      status: init.status,
      error: init.error,
      authenticated,
      user,
      isAdmin,
      profile,
      profileStatus: profileState.status,
      profileError: profileState.error,
      reloadProfile: loadProfile,
      login,
      logout,
    }),
    [init, authenticated, user, isAdmin, profile, profileState, loadProfile, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}

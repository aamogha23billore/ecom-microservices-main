import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { useCart } from '../context/CartContext';
import { config } from '../config';
import { initials } from '../utils/format';
import { CartIcon, ChevronDownIcon, LogoutIcon, PackageIcon, UserIcon } from './Icons';

const navClass = ({ isActive }) => `site-nav__link${isActive ? ' is-active' : ''}`;

export default function Header() {
  const { authenticated, user, profile, isAdmin, login, logout } = useAuth();
  const { count } = useCart();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const { pathname } = useLocation();

  // Close the menu on navigation, outside click and Escape.
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return undefined;
    const onPointer = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) setOpen(false);
    };
    const onKey = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const profileName = profile ? `${profile.firstName ?? ''} ${profile.lastName ?? ''}`.trim() : '';
  const displayName = profileName || user?.name || user?.username || '';

  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <Link to="/" className="wordmark" aria-label={`${config.storeName} home`}>
          {config.storeName}
          <span className="wordmark__dot">.</span>
        </Link>

        {authenticated && (
          <nav className="site-nav" aria-label="Primary">
            <NavLink to="/" end className={navClass}>
              Shop
            </NavLink>
            <NavLink to="/orders" className={navClass}>
              Orders
            </NavLink>
            {isAdmin && (
              <NavLink to="/admin/products" className={navClass}>
                Manage products
              </NavLink>
            )}
          </nav>
        )}

        <div className="site-header__actions">
          {authenticated ? (
            <>
              <Link to="/cart" className="cart-link" aria-label={`Cart, ${count} ${count === 1 ? 'item' : 'items'}`}>
                <CartIcon size={22} />
                {count > 0 && <span className="cart-link__count">{count}</span>}
              </Link>

              <div className="user-menu" ref={menuRef}>
                <button
                  type="button"
                  className="avatar-btn"
                  aria-haspopup="menu"
                  aria-expanded={open}
                  onClick={() => setOpen((o) => !o)}
                >
                  <span className="avatar">{initials(displayName)}</span>
                  <ChevronDownIcon size={16} />
                  <span className="sr-only">Account menu</span>
                </button>

                {open && (
                  <div className="menu" role="menu">
                    <div className="menu__head">
                      <strong>{displayName || 'Your account'}</strong>
                      {user?.email && <span>{user.email}</span>}
                    </div>
                    <Link to="/orders" role="menuitem" className="menu__item">
                      <PackageIcon size={18} /> My orders
                    </Link>
                    <Link to="/profile" role="menuitem" className="menu__item">
                      <UserIcon size={18} /> Profile
                    </Link>
                    {isAdmin && (
                      <Link to="/admin/products" role="menuitem" className="menu__item">
                        <PackageIcon size={18} /> Manage products
                      </Link>
                    )}
                    <button type="button" role="menuitem" className="menu__item" onClick={logout}>
                      <LogoutIcon size={18} /> Sign out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/register" className="btn btn--ghost btn--sm">
                Create account
              </Link>
              <button type="button" className="btn btn--primary btn--sm" onClick={() => login()}>
                Sign in
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

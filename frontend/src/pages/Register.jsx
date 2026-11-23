import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { createUser } from '../api/users';
import { errorMessage } from '../api/client';
import Field from '../components/Field';
import Spinner from '../components/Spinner';
import { AlertIcon, CheckIcon } from '../components/Icons';

const EMPTY = {
  username: '',
  password: '',
  confirm: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  street: '',
  city: '',
  state: '',
  country: '',
  zipcode: '',
};

function validate(form) {
  const errors = {};
  if (!form.username.trim()) errors.username = 'Choose a username';
  else if (/\s/.test(form.username.trim())) errors.username = 'Username can’t contain spaces';
  if (form.password.length < 6) errors.password = 'Use at least 6 characters';
  if (form.confirm !== form.password) errors.confirm = 'Passwords don’t match';
  if (!form.firstName.trim()) errors.firstName = 'First name is required';
  if (!form.lastName.trim()) errors.lastName = 'Last name is required';
  if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) errors.email = 'Enter a valid email address';
  return errors;
}

export default function Register() {
  const { authenticated, login } = useAuth();
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [createdUsername, setCreatedUsername] = useState(null);

  if (authenticated) return <Navigate to="/" replace />;

  const set = (key) => (event) => setForm((f) => ({ ...f, [key]: event.target.value }));

  async function handleSubmit(event) {
    event.preventDefault();
    setServerError(null);
    const next = validate(form);
    setErrors(next);
    if (Object.keys(next).length) return;

    setSubmitting(true);
    const username = form.username.trim();
    try {
      await createUser({
        username,
        password: form.password,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        address: {
          street: form.street.trim(),
          city: form.city.trim(),
          state: form.state.trim(),
          country: form.country.trim(),
          zipcode: form.zipcode.trim(),
        },
      });
      setCreatedUsername(username);
    } catch (err) {
      if (err?.status === 401 || err?.status === 403) {
        setServerError({
          title: 'Sign-ups are blocked by the API gateway',
          message:
            'The gateway requires a login for every request, including POST /api/users. Allow that one route without authentication in the gateway’s SecurityConfig (see README, “Enable sign-up”).',
        });
      } else if (err?.status === 0) {
        setServerError({ title: 'Can’t reach the server', message: errorMessage(err) });
      } else {
        setServerError({
          title: 'We couldn’t create your account',
          message: `${errorMessage(err)} The username or email may already be in use.`,
        });
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (createdUsername) {
    return (
      <div className="container container--narrow">
        <div className="confirm">
          <div className="confirm__badge">
            <CheckIcon size={30} />
          </div>
          <h1 className="confirm__title">Your account is ready</h1>
          <p className="confirm__lead">Sign in to start shopping.</p>
          <button type="button" className="btn btn--primary btn--lg" onClick={() => login({ loginHint: createdUsername })}>
            Sign in
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container container--narrow">
      <header className="page-head">
        <div>
          <h1 className="page-head__title">Create your account</h1>
          <p className="page-head__sub">
            Already have one?{' '}
            <button type="button" className="link-btn" onClick={() => login()}>
              Sign in
            </button>
          </p>
        </div>
      </header>

      <div className="card profile-card">
        {serverError && (
          <div className="notice notice--error" role="alert">
            <AlertIcon size={20} />
            <div>
              <strong>{serverError.title}</strong>
              <p>{serverError.message}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <fieldset className="form-section">
            <legend>Login</legend>
            <div className="form-grid">
              <Field label="Username" htmlFor="username" error={errors.username} className="form-grid__full">
                <input id="username" value={form.username} onChange={set('username')} autoComplete="username" />
              </Field>
              <Field label="Password" htmlFor="password" error={errors.password}>
                <input id="password" type="password" value={form.password} onChange={set('password')} autoComplete="new-password" />
              </Field>
              <Field label="Confirm password" htmlFor="confirm" error={errors.confirm}>
                <input id="confirm" type="password" value={form.confirm} onChange={set('confirm')} autoComplete="new-password" />
              </Field>
            </div>
          </fieldset>

          <fieldset className="form-section">
            <legend>About you</legend>
            <div className="form-grid">
              <Field label="First name" htmlFor="firstName" error={errors.firstName}>
                <input id="firstName" value={form.firstName} onChange={set('firstName')} autoComplete="given-name" />
              </Field>
              <Field label="Last name" htmlFor="lastName" error={errors.lastName}>
                <input id="lastName" value={form.lastName} onChange={set('lastName')} autoComplete="family-name" />
              </Field>
              <Field label="Email" htmlFor="email" error={errors.email}>
                <input id="email" type="email" value={form.email} onChange={set('email')} autoComplete="email" />
              </Field>
              <Field label="Phone" htmlFor="phone">
                <input id="phone" type="tel" value={form.phone} onChange={set('phone')} autoComplete="tel" />
              </Field>
            </div>
          </fieldset>

          <fieldset className="form-section">
            <legend>Delivery address</legend>
            <div className="form-grid">
              <Field label="Street" htmlFor="street" className="form-grid__full">
                <input id="street" value={form.street} onChange={set('street')} autoComplete="street-address" />
              </Field>
              <Field label="City" htmlFor="city">
                <input id="city" value={form.city} onChange={set('city')} autoComplete="address-level2" />
              </Field>
              <Field label="State / Region" htmlFor="state">
                <input id="state" value={form.state} onChange={set('state')} autoComplete="address-level1" />
              </Field>
              <Field label="Country" htmlFor="country">
                <input id="country" value={form.country} onChange={set('country')} autoComplete="country-name" />
              </Field>
              <Field label="ZIP / Postal code" htmlFor="zipcode">
                <input id="zipcode" value={form.zipcode} onChange={set('zipcode')} autoComplete="postal-code" />
              </Field>
            </div>
          </fieldset>

          <div className="form-actions">
            <Link to="/" className="btn btn--ghost">
              Cancel
            </Link>
            <button type="submit" className="btn btn--primary" disabled={submitting}>
              {submitting ? <Spinner className="spinner--sm" /> : 'Create account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

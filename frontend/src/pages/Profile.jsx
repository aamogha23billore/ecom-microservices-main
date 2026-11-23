import { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { useToast } from '../context/ToastContext';
import { updateUser } from '../api/users';
import { errorMessage } from '../api/client';
import Field from '../components/Field';
import Spinner from '../components/Spinner';
import { initials } from '../utils/format';

function toForm(profile) {
  return {
    firstName: profile?.firstName ?? '',
    lastName: profile?.lastName ?? '',
    phone: profile?.phone ?? '',
    street: profile?.address?.street ?? '',
    city: profile?.address?.city ?? '',
    state: profile?.address?.state ?? '',
    country: profile?.address?.country ?? '',
    zipcode: profile?.address?.zipcode ?? '',
  };
}

export default function Profile() {
  const { profile, user, isAdmin, reloadProfile } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState(() => toForm(profile));
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const set = (key) => (event) => setForm((f) => ({ ...f, [key]: event.target.value }));
  const fullName = `${profile.firstName ?? ''} ${profile.lastName ?? ''}`.trim();

  async function handleSubmit(event) {
    event.preventDefault();
    const next = {};
    if (!form.firstName.trim()) next.firstName = 'First name is required';
    if (!form.lastName.trim()) next.lastName = 'Last name is required';
    setErrors(next);
    if (Object.keys(next).length) return;

    setSaving(true);
    try {
      await updateUser(profile.id, {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        // Email is tied to the login, so it is sent back unchanged.
        email: profile.email,
        phone: form.phone.trim(),
        address: {
          street: form.street.trim(),
          city: form.city.trim(),
          state: form.state.trim(),
          country: form.country.trim(),
          zipcode: form.zipcode.trim(),
        },
      });
      await reloadProfile();
      toast.success('Your profile has been updated');
    } catch (err) {
      toast.error(errorMessage(err, 'We couldn’t save your changes.'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="container container--narrow">
      <header className="page-head">
        <div>
          <h1 className="page-head__title">Your profile</h1>
          <p className="page-head__sub">Keep your details up to date for delivery.</p>
        </div>
      </header>

      <div className="card profile-card">
        <div className="profile-card__head">
          <span className="avatar avatar--lg">{initials(fullName || user?.name)}</span>
          <div>
            <strong className="profile-card__name">{fullName || user?.name}</strong>
            <span className="profile-card__meta">
              {user?.username ? `@${user.username}` : profile.email}
              <span className={`role role--${isAdmin ? 'admin' : 'customer'}`}>{isAdmin ? 'Admin' : 'Customer'}</span>
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <fieldset className="form-section">
            <legend>Personal details</legend>
            <div className="form-grid">
              <Field label="First name" htmlFor="firstName" error={errors.firstName}>
                <input id="firstName" value={form.firstName} onChange={set('firstName')} autoComplete="given-name" />
              </Field>
              <Field label="Last name" htmlFor="lastName" error={errors.lastName}>
                <input id="lastName" value={form.lastName} onChange={set('lastName')} autoComplete="family-name" />
              </Field>
              <Field label="Email" htmlFor="email" hint="Email is tied to your login and can’t be changed here.">
                <input id="email" value={profile.email ?? ''} readOnly disabled />
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
            <button type="submit" className="btn btn--primary" disabled={saving}>
              {saving ? <Spinner className="spinner--sm" /> : 'Save changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

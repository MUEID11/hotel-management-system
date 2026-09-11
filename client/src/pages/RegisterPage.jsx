import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Field from '../components/common/Field.jsx';
import Button from '../components/common/Button.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { useNotification } from '../context/NotificationContext.jsx';

const INITIAL_FORM = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  country: '',
  dateOfBirth: '',
  documentType: 'PASSPORT',
  documentNumber: '',
  password: '',
  confirmPassword: '',
};

const DOCUMENT_TYPES = ['PASSPORT', 'NATIONAL_ID', 'DRIVERS_LICENSE', 'OTHER'];

export default function RegisterPage() {
  const { register } = useAuth();
  const notify = useNotification();
  const navigate = useNavigate();

  const [form, setForm] = useState(INITIAL_FORM);
  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => ({ ...current, [name]: undefined }));
  };

  const validate = () => {
    const errors = {};
    if (!form.firstName.trim()) errors.firstName = 'First name is required.';
    if (!form.lastName.trim()) errors.lastName = 'Last name is required.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'Enter a valid email address.';
    if (form.phone && !/^\+?[0-9\s-]{7,15}$/.test(form.phone)) {
      errors.phone = 'Enter a valid phone number.';
    }
    if (!form.documentNumber.trim()) errors.documentNumber = 'Document number is required.';
    if (form.password.length < 6) errors.password = 'Password must be at least 6 characters.';
    if (form.password !== form.confirmPassword) errors.confirmPassword = 'Passwords do not match.';
    return errors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setGeneralError('Please fix the highlighted fields.');
      return;
    }

    setSubmitting(true);
    setGeneralError(null);
    try {
      const { confirmPassword, ...payload } = form;
      // Send both documentNumber and idCard for complete backend compatibility
      await register({
        ...payload,
        idCard: payload.documentNumber,
      });
      notify.success('Account created successfully. Please sign in.');
      navigate('/login', { replace: true });
    } catch (err) {
      if (err.errors && typeof err.errors === 'object') {
        setFieldErrors(err.errors);
      }
      setGeneralError(err.message ?? 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <div className="flex w-full items-start justify-center px-4 py-12 sm:px-6 lg:w-1/2 lg:py-16">
        <div className="w-full max-w-xl">
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-sm font-bold text-amber-400">GH</span>
            <span className="font-serif text-lg font-semibold">Grand Horizon</span>
          </div>

          <h1 className="font-serif text-2xl font-semibold text-slate-900">Create your account</h1>
          <p className="mt-1 text-sm text-slate-500">
            Join as a guest to book rooms, order services, and manage your stays.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field
                label="First name"
                name="firstName"
                placeholder="Jane"
                required
                value={form.firstName}
                onChange={handleChange}
                error={fieldErrors.firstName}
              />
              <Field
                label="Last name"
                name="lastName"
                placeholder="Doe"
                required
                value={form.lastName}
                onChange={handleChange}
                error={fieldErrors.lastName}
              />
            </div>

            <Field
              label="Email address"
              name="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              required
              value={form.email}
              onChange={handleChange}
              error={fieldErrors.email}
            />

            <div className="grid gap-5 sm:grid-cols-2">
              <Field
                label="Phone number"
                name="phone"
                type="tel"
                placeholder="+1 555 010 1234"
                value={form.phone}
                onChange={handleChange}
                error={fieldErrors.phone}
                hint="Optional, used for reservation updates."
              />
              <Field
                label="Country"
                name="country"
                placeholder="United States"
                value={form.country}
                onChange={handleChange}
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field
                label="Date of birth"
                name="dateOfBirth"
                type="date"
                max={new Date().toISOString().slice(0, 10)}
                value={form.dateOfBirth}
                onChange={handleChange}
              />
              <Field
                label="Document type"
                name="documentType"
                as="select"
                options={DOCUMENT_TYPES}
                value={form.documentType}
                onChange={handleChange}
              />
            </div>

            <Field
              label="ID / Passport number"
              name="documentNumber"
              placeholder="AB1234567"
              required
              value={form.documentNumber}
              onChange={handleChange}
              error={fieldErrors.documentNumber}
            />

            <div className="grid gap-5 sm:grid-cols-2">
              <Field
                label="Password"
                name="password"
                type="password"
                placeholder="At least 6 characters"
                autoComplete="new-password"
                required
                value={form.password}
                onChange={handleChange}
                error={fieldErrors.password}
              />
              <Field
                label="Confirm password"
                name="confirmPassword"
                type="password"
                placeholder="Repeat your password"
                autoComplete="new-password"
                required
                value={form.confirmPassword}
                onChange={handleChange}
                error={fieldErrors.confirmPassword}
              />
            </div>

            {generalError && (
              <p className="rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm font-medium text-rose-700">
                {generalError}
              </p>
            )}

            <Button type="submit" loading={submitting} className="w-full" size="lg">
              Create account
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-amber-600 hover:text-amber-700">
              Sign in
            </Link>
          </p>
        </div>
      </div>

      <div className="relative hidden w-1/2 lg:block">
        <img
          src="https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=1600&auto=format&fit=crop"
          alt="Luxurious Grand Horizon suite"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 to-slate-900/30" />
        <div className="relative z-10 flex h-full flex-col justify-end p-12">
          <p className="font-serif text-3xl font-semibold text-white">Stay the horizon</p>
          <p className="mt-2 max-w-sm text-sm text-slate-300">
            One account for bookings, room service, and effortless check-out — all in a few taps.
          </p>
        </div>
      </div>
    </div>
  );
}
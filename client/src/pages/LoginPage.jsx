import { useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import Field from '../components/common/Field.jsx';
import Button from '../components/common/Button.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { useNotification } from '../context/NotificationContext.jsx';

export default function LoginPage() {
  const { login } = useAuth();
  const notify = useNotification();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const session = await login(form);
      notify.success(`Welcome back, ${session.user?.firstName ?? 'guest'}!`);
      const redirectParam = searchParams.get('redirect');
      const destination =
        redirectParam ??
        location.state?.from?.pathname ??
        (session.user?.role === 'GUEST' ? '/my-bookings' : '/dashboard');
      navigate(destination, { replace: true });
    } catch (err) {
      setError(err.message ?? 'Unable to sign in. Please check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const selectDemoAccount = (email) => {
    setForm({ email, password: 'admin12345' });
    setError(null);
  };

  return (
    <div className="flex min-h-screen">
      <div className="relative hidden w-1/2 lg:block">
        <img
          src="https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?q=80&w=1600&auto=format&fit=crop"
          alt="Grand Horizon hotel room"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950/80 to-slate-900/40" />
        <div className="relative z-10 flex h-full flex-col justify-end p-12">
          <p className="font-serif text-3xl font-semibold text-white">Grand Horizon</p>
          <p className="mt-2 max-w-sm text-sm text-slate-300">
            Sign in to manage your reservations, track payments, and unlock exclusive guest perks.
          </p>
        </div>
      </div>

      <div className="flex w-full items-center justify-center bg-slate-50 px-4 py-12 sm:px-6 lg:w-1/2">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-sm font-bold text-amber-400">GH</span>
            <span className="font-serif text-lg font-semibold">Grand Horizon</span>
          </div>

          <h1 className="font-serif text-2xl font-semibold text-slate-900">Welcome back</h1>
          <p className="mt-1 text-sm text-slate-500">Sign in to your account to continue.</p>

          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/80 p-3 text-xs text-amber-900">
            <p className="font-semibold text-amber-950">Quick demo login:</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => selectDemoAccount('guest@hotel.com')}
                className="rounded-md bg-white px-2.5 py-1 font-medium shadow-sm ring-1 ring-amber-300 transition-colors hover:bg-amber-100"
              >
                Guest (Amelia)
              </button>
              <button
                type="button"
                onClick={() => selectDemoAccount('front@hotel.com')}
                className="rounded-md bg-white px-2.5 py-1 font-medium shadow-sm ring-1 ring-amber-300 transition-colors hover:bg-amber-100"
              >
                Receptionist (Daniel)
              </button>
              <button
                type="button"
                onClick={() => selectDemoAccount('admin@hotel.com')}
                className="rounded-md bg-white px-2.5 py-1 font-medium shadow-sm ring-1 ring-amber-300 transition-colors hover:bg-amber-100"
              >
                Admin (Sofia)
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <Field
              label="Email address"
              name="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              required
              value={form.email}
              onChange={handleChange}
            />
            <div className="relative">
              <Field
                label="Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                autoComplete="current-password"
                required
                value={form.password}
                onChange={handleChange}
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute right-3 top-9 text-slate-400 transition-colors hover:text-slate-600"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            {error && (
              <p className="rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm font-medium text-rose-700">
                {error}
              </p>
            )}

            <Button type="submit" loading={submitting} className="w-full" size="lg">
              Sign in
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            New to Grand Horizon?{' '}
            <Link to="/register" className="font-semibold text-amber-600 hover:text-amber-700">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
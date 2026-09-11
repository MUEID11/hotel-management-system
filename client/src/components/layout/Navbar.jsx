import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  Menu,
  X,
  BedDouble,
  LogOut,
  User as UserIcon,
  Building2,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';
import { classNames } from '../../utils/format.js';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = [
    { to: '/', label: 'Home', end: true },
    { to: '/booking', label: 'Book a Stay' },
    ...(isAuthenticated ? [{ to: '/my-stay', label: 'My Stay' }] : []),
  ];

  const authArea = isAuthenticated ? (
    <div className="flex items-center gap-3">
      {user?.role !== 'GUEST' ? (
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:text-amber-600"
        >
          <Building2 className="h-4 w-4" aria-hidden="true" />
          Staff Portal
        </Link>
      ) : (
        <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100/80 px-3 py-1 text-xs font-semibold text-slate-700">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          <span>{user?.name || user?.email || 'Guest'}</span>
        </div>
      )}
      <button
        type="button"
        onClick={handleLogout}
        className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-rose-50 hover:text-rose-600"
      >
        <LogOut className="h-4 w-4" aria-hidden="true" />
        <span className="hidden sm:inline">Log out</span>
      </button>
    </div>
  ) : (
    <div className="flex items-center gap-3">
      <Link
        to="/login"
        className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:text-amber-600"
      >
        <UserIcon className="h-4 w-4" aria-hidden="true" />
        Sign in
      </Link>
      <Link
        to="/register"
        className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-amber-600"
      >
        Create account
      </Link>
    </div>
  );

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-slate-900/10 bg-white/80 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2" onClick={() => setMobileOpen(false)}>
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-sm font-bold text-amber-400">
              GH
            </span>
            <span className="hidden font-serif text-lg font-semibold tracking-tight text-slate-900 sm:block">
              Grand Horizon
            </span>
          </Link>
          <div className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  classNames(
                    'inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive ? 'text-amber-600 font-semibold' : 'text-slate-600 hover:text-slate-900'
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>
        </div>

        <div className="hidden items-center gap-2 md:flex">{authArea}</div>

        <button
          type="button"
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"
          onClick={() => setMobileOpen((open) => !open)}
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {mobileOpen && (
        <div className="border-t border-slate-100 bg-white px-4 pb-6 pt-4 md:hidden">
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  classNames(
                    'inline-flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive ? 'bg-amber-50 text-amber-700 font-semibold' : 'text-slate-700 hover:bg-slate-100'
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
            <div className="mt-3 border-t border-slate-100 pt-3">{authArea}</div>
          </div>
        </div>
      )}
    </header>
  );
}
import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  BedDouble,
  BedSingle,
  Users,
  CalendarCheck,
  CreditCard,
  ConciergeBell,
  IdCard,
  BarChart3,
  LogOut,
  Home,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';
import { fetchIssues } from '../../services/issueService.js';
import { fetchAllServiceOrders } from '../../services/serviceService.js';
import { classNames } from '../../utils/format.js';

export default function DashboardLayout({
  activeTab,
  onTabChange,
  onNavigateLanding,
  children,
}) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const isAdmin = user?.role === 'ADMIN';
  const [openIssuesCount, setOpenIssuesCount] = useState(0);
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);

  useEffect(() => {
    fetchIssues()
      .then((issues) => {
        if (Array.isArray(issues)) {
          setOpenIssuesCount(issues.filter((i) => i.status === 'OPEN').length);
        }
      })
      .catch(() => {});

    fetchAllServiceOrders()
      .then((orders) => {
        if (Array.isArray(orders)) {
          setPendingOrdersCount(orders.filter((o) => (o.status || o.order_status) === 'PENDING').length);
        }
      })
      .catch(() => {});
  }, []);

  const links = [
    { to: '/dashboard', tab: 'overview', label: 'Overview', icon: LayoutDashboard, end: true },
    { to: '/dashboard/rooms', tab: 'rooms', label: 'Rooms', icon: BedDouble },
    ...(isAdmin ? [{ to: '/dashboard/room-types', tab: 'room-types', label: 'Room Types', icon: BedSingle }] : []),
    ...(isAdmin ? [{ to: '/dashboard/guests', tab: 'guests', label: 'Guests', icon: Users }] : []),
    { to: '/dashboard/reservations', tab: 'reservations', label: 'Reservations', icon: CalendarCheck },
    { to: '/dashboard/payments', tab: 'payments', label: 'Payments', icon: CreditCard },
    { to: '/dashboard/services', tab: 'services', label: 'Services', icon: ConciergeBell },
    ...(isAdmin ? [{ to: '/dashboard/staff', tab: 'staff', label: 'Staff', icon: IdCard }] : []),
    { to: '/dashboard/reports', tab: 'reports', label: 'Reports', icon: BarChart3 },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleHome = () => {
    if (onNavigateLanding) onNavigateLanding();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <aside className="fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-slate-950">
        <div
          onClick={handleHome}
          className="flex items-center gap-2 px-6 py-5 cursor-pointer group"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500 text-sm font-bold text-white group-hover:scale-105 transition-transform">
            GH
          </span>
          <div>
            <p className="font-serif text-sm font-semibold text-white group-hover:text-amber-400 transition-colors">
              Grand Horizon
            </p>
            <p className="text-xs text-slate-400">Management Suite</p>
          </div>
        </div>

        <nav className="mt-2 flex-1 space-y-1 px-3" aria-label="Dashboard navigation">
          {links.map((link) => {
            const isTabActive = activeTab && activeTab === link.tab;

            if (onTabChange) {
              return (
                <button
                  key={link.to}
                  type="button"
                  onClick={() => onTabChange(link.tab)}
                  className={classNames(
                    'w-full flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors cursor-pointer',
                    isTabActive
                      ? 'bg-amber-500 text-white shadow-sm'
                      : 'text-slate-400 hover:bg-slate-800/70 hover:text-white'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <link.icon className="h-5 w-5" aria-hidden="true" />
                    <span>{link.label}</span>
                  </div>
                  {link.tab === 'services' && pendingOrdersCount > 0 && (
                    <span className="rounded-full bg-amber-500 px-2 py-0.5 text-xs font-bold text-white">
                      {pendingOrdersCount}
                    </span>
                  )}
                  {link.tab === 'reports' && openIssuesCount > 0 && (
                    <span className="rounded-full bg-rose-500 px-2 py-0.5 text-xs font-bold text-white">
                      {openIssuesCount}
                    </span>
                  )}
                </button>
              );
            }

            return (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  classNames(
                    'flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-amber-500 text-white shadow-sm'
                      : 'text-slate-400 hover:bg-slate-800/70 hover:text-white'
                  )
                }
              >
                <div className="flex items-center gap-3">
                  <link.icon className="h-5 w-5" aria-hidden="true" />
                  <span>{link.label}</span>
                </div>
                {link.tab === 'services' && pendingOrdersCount > 0 && (
                  <span className="rounded-full bg-amber-500 px-2 py-0.5 text-xs font-bold text-white">
                    {pendingOrdersCount}
                  </span>
                )}
                {link.tab === 'reports' && openIssuesCount > 0 && (
                  <span className="rounded-full bg-rose-500 px-2 py-0.5 text-xs font-bold text-white">
                    {openIssuesCount}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="border-t border-slate-800 px-4 py-4">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-sm font-semibold text-amber-400">
              {user?.firstName?.[0] ?? user?.email?.[0]?.toUpperCase() ?? 'U'}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="truncate text-xs text-slate-400">{user?.role}</p>
            </div>
          </div>
          <div className="space-y-1">
            <button
              type="button"
              onClick={handleHome}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-400 transition-colors hover:text-white cursor-pointer"
            >
              <Home className="h-5 w-5" aria-hidden="true" />
              View site
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium text-rose-300 transition-colors hover:bg-rose-500/10 hover:text-rose-200 cursor-pointer"
            >
              <LogOut className="h-5 w-5" aria-hidden="true" />
              Sign out
            </button>
          </div>
        </div>
      </aside>

      <div className="pl-64">
        <main className="mx-auto max-w-7xl px-6 py-8 lg:px-10">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
}
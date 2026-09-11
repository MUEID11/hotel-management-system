import { useEffect, useState } from 'react';
import {
  BedDouble,
  BedSingle,
  CalendarCheck,
  ReceiptText,
  TrendingUp,
  DoorOpen,
  MessageSquareWarning,
  AlertCircle,
  Wrench,
  ArrowRight,
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import StatCard from '../../components/common/StatCard.jsx';
import Badge from '../../components/common/Badge.jsx';
import Spinner from '../../components/common/Spinner.jsx';
import Button from '../../components/common/Button.jsx';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import { useNotification } from '../../context/NotificationContext.jsx';
import {
  fetchDashboardSummary,
  fetchDailyReservations,
} from '../../services/reportService.js';
import { fetchActiveReservations } from '../../services/reservationService.js';
import { fetchIssues } from '../../services/issueService.js';
import { RESERVATION_STATUS_META } from '../../constants.js';
import { formatDate, formatCurrency, todayInput } from '../../utils/format.js';

function EventRow({ event }) {
  const meta = RESERVATION_STATUS_META[event.status] ?? RESERVATION_STATUS_META.PENDING;
  return (
    <li className="flex items-center justify-between gap-4 py-3">
      <div>
        <p className="text-sm font-medium text-slate-900">
          {event.guest_name}
          <span className="ml-2 text-xs font-normal text-slate-400">Room {event.room_number}</span>
        </p>
        <p className="mt-0.5 text-xs text-slate-500">
          {event.room_type_name} · {formatDate(event.check_in_date)} → {formatDate(event.check_out_date)}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <Badge color={meta.color}>{meta.label}</Badge>
        <span className="text-xs font-medium text-slate-500">{event.event_type}</span>
      </div>
    </li>
  );
}

export default function DashboardHome() {
  const { isAdmin } = useAuth();
  const notify = useNotification();
  const [summary, setSummary] = useState(null);
  const [todayEvents, setTodayEvents] = useState([]);
  const [active, setActive] = useState([]);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const today = todayInput();
        const [daily, issuesData] = await Promise.all([
          fetchDailyReservations(today),
          fetchIssues().catch(() => []),
        ]);
        if (!cancelled) {
          setTodayEvents(Array.isArray(daily) ? daily : []);
          setIssues(Array.isArray(issuesData) ? issuesData : []);
        }

        if (isAdmin) {
          const data = await fetchDashboardSummary();
          if (!cancelled) setSummary(data ?? null);
        } else {
          const activeList = await fetchActiveReservations();
          if (!cancelled) setActive(Array.isArray(activeList) ? activeList : []);
        }
      } catch (err) {
        if (!cancelled) notify.error(err.message ?? 'Unable to load the dashboard.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [isAdmin, notify]);

  const openIssues = issues.filter((i) => i.status === 'OPEN');

  return (
    <>
      <PageHeader
        title="Overview"
        description={isAdmin ? 'Today at a glance across the property.' : 'Today’s arrivals and departures.'}
      />

      {loading ? (
        <div className="pt-16">
          <Spinner label="Loading dashboard…" />
        </div>
      ) : (
        <>
          {/* Active User Problem Reports Alert Banner */}
          {openIssues.length > 0 && (
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-rose-200 bg-rose-50/90 p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-600 text-white shrink-0 shadow-md">
                  <AlertCircle className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-rose-950">
                    {openIssues.length} User Problem Report{openIssues.length > 1 ? 's' : ''} Awaiting Attention
                  </p>
                  <p className="text-xs text-rose-700">
                    Guests have reported issues in Room {openIssues.map((i) => i.room_number).filter(Boolean).join(', ')}.
                  </p>
                </div>
              </div>
              <Link to="/dashboard/reports">
                <Button variant="danger" size="sm">
                  <span>View in Reports</span>
                  <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </Link>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {isAdmin ? (
              <>
                <StatCard label="Occupancy" value={`${summary?.occupancy_rate ?? 0}%`} icon={TrendingUp} accent="emerald" />
                <StatCard label="Rooms available" value={summary?.available_rooms ?? 0} icon={BedSingle} accent="sky" />
                <StatCard label="Rooms occupied" value={summary?.occupied_rooms ?? 0} icon={BedDouble} accent="violet" />
                <StatCard label="Open Guest Reports" value={openIssues.length} icon={MessageSquareWarning} accent={openIssues.length > 0 ? "rose" : "emerald"} />
                <StatCard label="Revenue (month)" value={formatCurrency(summary?.monthly_revenue)} icon={ReceiptText} accent="rose" />
              </>
            ) : (
              <>
                <StatCard label="Active reservations" value={active.length} icon={CalendarCheck} accent="amber" />
                <StatCard label="Arrivals today" value={todayEvents.filter((event) => event.event_type === 'ARRIVAL').length} icon={DoorOpen} accent="emerald" />
                <StatCard label="Departures today" value={todayEvents.filter((event) => event.event_type === 'DEPARTURE').length} icon={DoorOpen} accent="sky" />
                <StatCard label="Guests due in today" value={todayEvents.filter((event) => event.event_type === 'ARRIVAL').length} icon={BedSingle} accent="violet" />
                <StatCard label="Pending confirmations" value={todayEvents.filter((event) => event.status === 'PENDING').length} icon={CalendarCheck} accent="rose" />
              </>
            )}
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
              <header className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <h2 className="text-base font-semibold text-slate-900">Today at the hotel</h2>
                <Link to="/dashboard/reservations">
                  <Button variant="ghost" size="sm">View all</Button>
                </Link>
              </header>
              {todayEvents.length === 0 ? (
                <p className="px-5 py-10 text-center text-sm text-slate-500">No arrivals or departures scheduled today.</p>
              ) : (
                <ul className="divide-y divide-slate-100 px-5">
                  {todayEvents.slice(0, 8).map((event) => (
                    <EventRow key={event.reservation_id} event={event} />
                  ))}
                </ul>
              )}
            </section>

            {isAdmin ? (
              <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
                <header className="border-b border-slate-100 px-5 py-4">
                  <h2 className="text-base font-semibold text-slate-900">Property status</h2>
                </header>
                <div className="grid grid-cols-2 gap-3 px-5 py-5 sm:grid-cols-3">
                  {[
                    { label: 'Available', value: summary?.available_rooms ?? 0, cls: 'bg-emerald-50 text-emerald-700' },
                    { label: 'Occupied', value: summary?.occupied_rooms ?? 0, cls: 'bg-rose-50 text-rose-700' },
                    { label: 'Maintenance', value: summary?.maintenance_rooms ?? 0, cls: 'bg-amber-50 text-amber-700' },
                    { label: 'Inactive', value: summary?.inactive_rooms ?? 0, cls: 'bg-slate-100 text-slate-600' },
                    { label: 'Total rooms', value: summary?.total_rooms ?? 0, cls: 'bg-sky-50 text-sky-700' },
                  ].map((chip) => (
                    <div key={chip.label} className={`rounded-lg px-4 py-3 ${chip.cls}`}>
                      <p className="text-xs font-medium opacity-80">{chip.label}</p>
                      <p className="mt-1 text-xl font-bold">{chip.value}</p>
                    </div>
                  ))}
                </div>
              </section>
            ) : (
              <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
                <header className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                  <h2 className="text-base font-semibold text-slate-900">Reservations in-house</h2>
                  <Badge color="bg-emerald-100 text-emerald-700 ring-emerald-600/20">{active.length} active</Badge>
                </header>
                {active.length === 0 ? (
                  <p className="px-5 py-10 text-center text-sm text-slate-500">No checked-in or confirmed reservations right now.</p>
                ) : (
                  <ul className="divide-y divide-slate-100 px-5">
                    {active.slice(0, 8).map((reservation) => {
                      const meta = RESERVATION_STATUS_META[reservation.status] ?? RESERVATION_STATUS_META.PENDING;
                      return (
                        <li key={reservation.id} className="flex items-center justify-between gap-4 py-3">
                          <div>
                            <p className="text-sm font-medium text-slate-900">
                              {reservation.guest_name}
                              <span className="ml-2 text-xs font-normal text-slate-400">Room {reservation.room_number}</span>
                            </p>
                            <p className="mt-0.5 text-xs text-slate-500">
                              {formatDate(reservation.check_in_date)} → {formatDate(reservation.check_out_date)}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge color={meta.color}>{meta.label}</Badge>
                            <span className="text-sm font-semibold text-slate-900">{formatCurrency(reservation.total_amount)}</span>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>
            )}
          </div>
        </>
      )}
    </>
  );
}
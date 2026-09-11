import { useEffect, useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  Wrench,
  BarChart3,
  Check,
  Award,
  Users,
  MessageSquareWarning,
  RefreshCw,
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import StatCard from '../../components/common/StatCard.jsx';
import Badge from '../../components/common/Badge.jsx';
import Spinner from '../../components/common/Spinner.jsx';
import Field from '../../components/common/Field.jsx';
import Button from '../../components/common/Button.jsx';
import Table from '../../components/common/Table.jsx';
import Modal from '../../components/common/Modal.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { useNotification } from '../../context/NotificationContext.jsx';
import {
  fetchDashboardSummary,
  fetchDailyReservations,
  fetchMonthlyRevenue,
  fetchOccupancyReport,
} from '../../services/reportService.js';
import { fetchIssues, updateIssueStatus } from '../../services/issueService.js';
import { formatCurrency, formatDate, formatDateTime, todayInput } from '../../utils/format.js';

const MONTHS = Array.from({ length: 12 }, (_, index) => index + 1);

export default function ReportsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const notify = useNotification();

  // Tab: 'issues' (Guest Problem Reports) | 'analytics' (Financial & Occupancy)
  const [activeTab, setActiveTab] = useState('issues');

  // =========================================================================
  // 1. Guest Problem Reports State
  // =========================================================================
  const [issues, setIssues] = useState([]);
  const [issuesLoading, setIssuesLoading] = useState(true);
  const [issueStatusFilter, setIssueStatusFilter] = useState('ALL');

  // Resolve Modal state
  const [resolveTarget, setResolveTarget] = useState(null);
  const [resolveNotes, setResolveNotes] = useState('');
  const [resolving, setResolving] = useState(false);

  // =========================================================================
  // 2. Financial & Operational Analytics State
  // =========================================================================
  const [summary, setSummary] = useState(null);
  const [dailyDate, setDailyDate] = useState(todayInput());
  const [daily, setDaily] = useState([]);

  const current = new Date();
  const [month, setMonth] = useState(current.getMonth() + 1);
  const [year, setYear] = useState(current.getFullYear());
  const [revenue, setRevenue] = useState(null);

  const [occupancyStart, setOccupancyStart] = useState(`${current.getFullYear()}-01-01`);
  const [occupancyEnd, setOccupancyEnd] = useState(todayInput());
  const [occupancy, setOccupancy] = useState(null);

  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [dailyLoading, setDailyLoading] = useState(false);

  // =========================================================================
  // Data Loading
  // =========================================================================
  const loadIssues = async () => {
    setIssuesLoading(true);
    try {
      const data = await fetchIssues();
      setIssues(Array.isArray(data) ? data : []);
    } catch (err) {
      notify.error(err.message ?? 'Unable to load user problem reports.');
    } finally {
      setIssuesLoading(false);
    }
  };

  const loadAnalytics = async () => {
    setAnalyticsLoading(true);
    try {
      if (isAdmin) {
        const [summaryData, dailyData] = await Promise.all([
          fetchDashboardSummary(),
          fetchDailyReservations(todayInput()),
        ]);
        setSummary(summaryData ?? null);
        setDaily(dailyData ?? []);
      } else {
        const dailyData = await fetchDailyReservations(todayInput());
        setDaily(dailyData ?? []);
      }
    } catch (err) {
      notify.error(err.message ?? 'Unable to load analytics.');
    } finally {
      setAnalyticsLoading(false);
    }
  };

  useEffect(() => {
    loadIssues();
    loadAnalytics();
  }, [isAdmin]);

  // =========================================================================
  // Issue Actions
  // =========================================================================
  const handleStartFix = async (issue) => {
    try {
      await updateIssueStatus(issue.id, 'IN_PROGRESS', 'Staff technician assigned.');
      notify.success(`Issue #${issue.id} (Room ${issue.room_number}) set to In Progress.`);
      await loadIssues();
    } catch (err) {
      notify.error(err.message ?? 'Failed to update issue status.');
    }
  };

  const handleOpenResolve = (issue) => {
    setResolveTarget(issue);
    setResolveNotes(issue.resolution_notes || 'Fixed and verified with guest.');
  };

  const handleConfirmResolve = async (e) => {
    e?.preventDefault();
    if (!resolveTarget) return;

    setResolving(true);
    try {
      await updateIssueStatus(resolveTarget.id, 'RESOLVED', resolveNotes.trim());
      notify.success(`Issue #${resolveTarget.id} marked as Resolved!`);
      setResolveTarget(null);
      setResolveNotes('');
      await loadIssues();
    } catch (err) {
      notify.error(err.message ?? 'Failed to resolve issue.');
    } finally {
      setResolving(false);
    }
  };

  // =========================================================================
  // Analytics Queries
  // =========================================================================
  const runDaily = async () => {
    setDailyLoading(true);
    try {
      const data = await fetchDailyReservations(dailyDate);
      setDaily(data ?? []);
    } catch (err) {
      notify.error(err.message ?? 'Unable to load daily report.');
    } finally {
      setDailyLoading(false);
    }
  };

  const runRevenue = async () => {
    try {
      const data = await fetchMonthlyRevenue(year, month);
      setRevenue(data ?? null);
    } catch (err) {
      notify.error(err.message ?? 'Unable to load revenue report.');
    }
  };

  const runOccupancy = async () => {
    try {
      const data = await fetchOccupancyReport(occupancyStart, occupancyEnd);
      setOccupancy(data ?? null);
    } catch (err) {
      notify.error(err.message ?? 'Unable to load occupancy report.');
    }
  };

  // Issue calculations
  const openCount = issues.filter((i) => i.status === 'OPEN').length;
  const inProgressCount = issues.filter((i) => i.status === 'IN_PROGRESS').length;
  const resolvedCount = issues.filter((i) => i.status === 'RESOLVED').length;

  const filteredIssues = issues.filter((i) => {
    if (issueStatusFilter === 'ALL') return true;
    return i.status === issueStatusFilter;
  });

  const dailyColumns = [
    { key: 'reservation_id', header: '#', render: (row) => <span className="font-medium text-slate-500">#{row.reservation_id}</span> },
    { key: 'guest_name', header: 'Guest', render: (row) => <span className="font-semibold text-slate-900">{row.guest_name}</span> },
    { key: 'room_number', header: 'Room', render: (row) => `Room ${row.room_number}` },
    { key: 'room_type_name', header: 'Type' },
    { key: 'check_in_date', header: 'Check-in', render: (row) => formatDate(row.check_in_date) },
    { key: 'check_out_date', header: 'Check-out', render: (row) => formatDate(row.check_out_date) },
    {
      key: 'event_type',
      header: 'Type',
      render: (row) => (
        <Badge color={row.event_type === 'ARRIVAL' ? 'bg-emerald-100 text-emerald-700 ring-emerald-600/20' : 'bg-sky-100 text-sky-700 ring-sky-600/20'}>
          {row.event_type}
        </Badge>
      ),
    },
    { key: 'total_amount', header: 'Total', render: (row) => formatCurrency(row.total_amount) },
  ];

  return (
    <>
      <PageHeader
        title="Reports & Assistance"
        description="Monitor user-submitted problem reports and property performance analytics."
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              loadIssues();
              loadAnalytics();
            }}
          >
            <RefreshCw className="h-4 w-4 mr-1.5" />
            <span>Refresh</span>
          </Button>
        }
      />

      {/* ========================================================================= */}
      {/* Top Primary Tabs */}
      {/* ========================================================================= */}
      <div className="mt-4 flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('issues')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
            activeTab === 'issues'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <MessageSquareWarning className="h-4 w-4" />
          <span>User Problem Reports</span>
          {openCount > 0 ? (
            <span className="rounded-full bg-rose-500 px-2 py-0.5 text-xs font-bold text-white animate-pulse">
              {openCount} Open
            </span>
          ) : (
            <span className="rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5 text-xs font-semibold">
              All Clear
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
            activeTab === 'analytics'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <BarChart3 className="h-4 w-4" />
          <span>Property & Revenue Analytics</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: GUEST PROBLEM REPORTS (USER REPORTS) */}
      {/* ========================================================================= */}
      {activeTab === 'issues' && (
        <div className="mt-6 space-y-6">
          {/* Summary Stat Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Total User Reports" value={issues.length} icon={MessageSquareWarning} accent="slate" />
            <StatCard label="Open / Needs Action" value={openCount} icon={AlertCircle} accent="rose" />
            <StatCard label="Under Repair / In Progress" value={inProgressCount} icon={Clock} accent="amber" />
            <StatCard label="Resolved" value={resolvedCount} icon={CheckCircle2} accent="emerald" />
          </div>

          {/* Great Service Banner if all clear */}
          {openCount === 0 && (
            <div className="rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-100/60 p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white">
                  <Award className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-emerald-950">
                    Great service! Keep up the wonderful work!
                  </h3>
                  <p className="text-xs text-emerald-800">
                    There are no unresolved guest problem reports or complaints at this time.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Status:</span>
              {[
                { key: 'ALL', label: `All (${issues.length})` },
                { key: 'OPEN', label: `Open (${openCount})` },
                { key: 'IN_PROGRESS', label: `In Progress (${inProgressCount})` },
                { key: 'RESOLVED', label: `Resolved (${resolvedCount})` },
              ].map((btn) => (
                <button
                  key={btn.key}
                  type="button"
                  onClick={() => setIssueStatusFilter(btn.key)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                    issueStatusFilter === btn.key
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>

            <span className="text-xs text-slate-500">
              Showing {filteredIssues.length} of {issues.length} tickets
            </span>
          </div>

          {/* Reports Table / List */}
          {issuesLoading ? (
            <div className="py-12 flex justify-center">
              <Spinner label="Loading user reports…" />
            </div>
          ) : filteredIssues.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center shadow-sm">
              <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
              <h3 className="mt-3 font-serif text-lg font-bold text-slate-900">
                No tickets for this filter
              </h3>
              <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">
                🌟 Great service! All user-submitted complaints and problem reports are resolved.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="border-b border-slate-100 bg-slate-50/80 text-xs font-bold uppercase tracking-wider text-slate-700">
                    <tr>
                      <th className="px-5 py-4">Ticket</th>
                      <th className="px-5 py-4">Guest & Room</th>
                      <th className="px-5 py-4">Category & Priority</th>
                      <th className="px-5 py-4">Problem Description</th>
                      <th className="px-5 py-4">Status</th>
                      <th className="px-5 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredIssues.map((issue) => {
                      const isOpen = issue.status === 'OPEN';
                      const isInProgress = issue.status === 'IN_PROGRESS';
                      const isResolved = issue.status === 'RESOLVED';
                      const isUrgent = issue.priority === 'URGENT';

                      return (
                        <tr key={issue.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="px-5 py-4 font-mono text-xs font-bold text-slate-900">
                            #{issue.id}
                          </td>

                          <td className="px-5 py-4">
                            <p className="font-semibold text-slate-900">
                              Room {issue.room_number || 'N/A'}
                              {issue.room_type_name && (
                                <span className="ml-1.5 text-xs font-normal text-slate-500">
                                  ({issue.room_type_name})
                                </span>
                              )}
                            </p>
                            <p className="mt-0.5 text-xs text-slate-500">
                              {issue.guest_name || 'Guest'} {issue.guest_phone && `· ${issue.guest_phone}`}
                            </p>
                          </td>

                          <td className="px-5 py-4">
                            <span className="inline-block rounded-md bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-800">
                              {issue.category?.replace('_', ' ')}
                            </span>
                            <div className="mt-1">
                              {isUrgent ? (
                                <span className="inline-flex items-center rounded-full bg-rose-100 px-2 py-0.5 text-xs font-bold text-rose-700">
                                  Urgent Priority
                                </span>
                              ) : (
                                <span className="text-xs text-slate-400">
                                  {issue.priority}
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="px-5 py-4 max-w-sm">
                            <p className="font-medium text-slate-900 line-clamp-2">
                              {issue.description}
                            </p>
                            <p className="mt-1 text-xs text-slate-400">
                              Reported {formatDateTime(issue.created_at)}
                            </p>
                            {issue.resolution_notes && (
                              <p className="mt-1 text-xs text-emerald-700 bg-emerald-50 rounded px-2 py-0.5 border border-emerald-100">
                                <strong>Staff Note:</strong> {issue.resolution_notes}
                              </p>
                            )}
                          </td>

                          <td className="px-5 py-4">
                            {isOpen ? (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 border border-rose-200 px-2.5 py-1 text-xs font-semibold text-rose-800">
                                <AlertCircle className="h-3.5 w-3.5 text-rose-600" />
                                <span>Open</span>
                              </span>
                            ) : isInProgress ? (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-1 text-xs font-semibold text-amber-800">
                                <Clock className="h-3.5 w-3.5 text-amber-600" />
                                <span>In Progress</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-xs font-semibold text-emerald-800">
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                                <span>Resolved</span>
                              </span>
                            )}
                          </td>

                          <td className="px-5 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {isOpen && (
                                <button
                                  type="button"
                                  onClick={() => handleStartFix(issue)}
                                  className="inline-flex items-center gap-1 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-xs font-semibold text-amber-900 hover:bg-amber-100 transition"
                                >
                                  <Wrench className="h-3.5 w-3.5 text-amber-600" />
                                  <span>Start Fix</span>
                                </button>
                              )}
                              {!isResolved && (
                                <button
                                  type="button"
                                  onClick={() => handleOpenResolve(issue)}
                                  className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 transition shadow-sm"
                                >
                                  <Check className="h-3.5 w-3.5" />
                                  <span>Resolve</span>
                                </button>
                              )}
                              {isResolved && (
                                <span className="text-xs text-slate-400">
                                  Closed
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: PROPERTY & REVENUE ANALYTICS */}
      {/* ========================================================================= */}
      {activeTab === 'analytics' && (
        <div className="mt-6 space-y-6">
          {analyticsLoading ? (
            <div className="py-12 flex justify-center">
              <Spinner label="Loading property intelligence…" />
            </div>
          ) : (
            <>
              {isAdmin ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <StatCard label="Occupancy rate" value={`${summary?.occupancy_rate ?? 0}%`} accent="emerald" />
                  <StatCard label="Active reservations" value={summary?.active_reservations ?? 0} accent="amber" />
                  <StatCard label="Monthly revenue" value={formatCurrency(summary?.monthly_revenue)} accent="rose" />
                  <StatCard label="Rooms (excl. inactive)" value={(summary?.total_rooms ?? 0) - (summary?.inactive_rooms ?? 0)} accent="sky" />
                </div>
              ) : (
                <div className="rounded-2xl border border-amber-200/80 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-100/60 p-6 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white shadow-md shadow-amber-500/20">
                        <Sparkles className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-lg font-bold text-slate-900">Front Desk Operations & Daily Roster</h2>
                          <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800 border border-amber-300">
                            Front Desk
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-slate-700">
                          🌟 <span className="font-semibold text-amber-950">Great service! Keep up the wonderful work!</span> You are making every guest's stay memorable. Here is the active daily roster for arrivals and departures.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-white/90 px-3.5 py-2 text-xs font-semibold text-amber-900 shadow-sm shrink-0">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <span>Front Desk Ready</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Daily Reservations Report */}
              <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <h2 className="text-base font-semibold text-slate-900">Daily reservations report</h2>
                    <p className="text-xs text-slate-500">Track check-ins (arrivals) and check-outs (departures) by date.</p>
                  </div>
                  <div className="flex items-end gap-3">
                    <Field name="dailyDate" type="date" label="Date" value={dailyDate} onChange={(event) => setDailyDate(event.target.value)} />
                    <Button onClick={runDaily} loading={dailyLoading}>Run report</Button>
                  </div>
                </div>
                <div className="mt-4">
                  <Table
                    columns={dailyColumns}
                    data={daily}
                    loading={dailyLoading}
                    rowKey="reservation_id"
                    pageable={false}
                    emptyTitle="All clear for selected date!"
                    emptyMessage="🌟 Great service! Keep up the good work — no pending arrivals or departures scheduled for this date."
                  />
                </div>
              </section>

              {isAdmin && (
                <div className="grid gap-6 lg:grid-cols-2">
                  {/* Monthly Revenue */}
                  <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex flex-wrap items-end justify-between gap-4">
                      <h2 className="text-base font-semibold text-slate-900">Monthly revenue</h2>
                      <div className="flex items-end gap-3">
                        <Field
                          name="month"
                          as="select"
                          label="Month"
                          value={month}
                          onChange={(event) => setMonth(Number(event.target.value))}
                          options={MONTHS.map((m) => ({ value: m, label: new Date(2000, m - 1, 1).toLocaleString('en-US', { month: 'long' }) }))}
                        />
                        <Field name="year" type="number" label="Year" min="2000" max="2100" value={year} onChange={(event) => setYear(Number(event.target.value))} />
                        <Button onClick={runRevenue}>Run</Button>
                      </div>
                    </div>

                    {revenue ? (
                      <div className="mt-4 grid grid-cols-2 gap-3">
                        <div className="col-span-2 rounded-lg bg-slate-900 px-4 py-3 text-white">
                          <p className="text-xs text-slate-400">Total revenue</p>
                          <p className="text-xl font-bold">{formatCurrency(revenue.total_revenue)}</p>
                          <p className="mt-0.5 text-xs text-slate-400">{revenue.payment_count} payments · {revenue.paying_reservations} reservations</p>
                        </div>
                        {[
                          { label: 'Cash', value: revenue.cash_revenue },
                          { label: 'Card', value: revenue.card_revenue },
                          { label: 'Mobile transfer', value: revenue.mobile_revenue },
                          { label: 'Bank transfer', value: revenue.bank_revenue },
                          { label: 'Average payment', value: revenue.average_payment },
                        ].map((item) => (
                          <div key={item.label} className="rounded-lg border border-slate-100 bg-slate-50 px-4 py-3">
                            <p className="text-xs text-slate-500">{item.label}</p>
                            <p className="mt-0.5 text-base font-semibold text-slate-900">{formatCurrency(item.value)}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-4 text-sm text-slate-500">Run the report to see revenue for the selected month.</p>
                    )}
                  </section>

                  {/* Occupancy Report */}
                  <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex flex-wrap items-end justify-between gap-4">
                      <h2 className="text-base font-semibold text-slate-900">Occupancy report</h2>
                      <div className="grid grid-cols-2 items-end gap-3">
                        <Field name="occupancyStart" type="date" label="From" value={occupancyStart} onChange={(event) => setOccupancyStart(event.target.value)} />
                        <Field name="occupancyEnd" type="date" label="To" value={occupancyEnd} onChange={(event) => setOccupancyEnd(event.target.value)} />
                        <Button onClick={runOccupancy} className="col-span-2">Run report</Button>
                      </div>
                    </div>

                    {occupancy ? (
                      <div className="mt-4 space-y-3">
                        <div className="rounded-lg bg-emerald-50 px-4 py-4">
                          <p className="text-xs font-medium text-emerald-700">Occupancy rate</p>
                          <p className="text-3xl font-bold text-emerald-700">{occupancy.occupancy_rate}%</p>
                          <p className="mt-1 text-xs text-emerald-600">
                            Across all active room types between {formatDate(occupancyStart)} and {formatDate(occupancyEnd)}.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p className="mt-4 text-sm text-slate-500">Run the report to see room occupancy percentages.</p>
                    )}
                  </section>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* Resolve Issue Modal */}
      {/* ========================================================================= */}
      <Modal
        open={Boolean(resolveTarget)}
        onClose={() => setResolveTarget(null)}
        title={resolveTarget ? `Resolve Ticket #${resolveTarget.id} (Room ${resolveTarget.room_number})` : 'Resolve Ticket'}
      >
        {resolveTarget && (
          <form onSubmit={handleConfirmResolve} className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Problem Reported</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                {resolveTarget.category?.replace('_', ' ')}: {resolveTarget.description}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Guest: {resolveTarget.guest_name} · Room {resolveTarget.room_number} ({resolveTarget.room_type_name})
              </p>
            </div>

            <Field label="Resolution Notes for Guest & Staff" required>
              <textarea
                rows={3}
                value={resolveNotes}
                onChange={(e) => setResolveNotes(e.target.value)}
                placeholder="E.g., Replaced air filter, provided clean towels, verified with guest."
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                required
              />
            </Field>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setResolveTarget(null)}
                disabled={resolving}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={resolving}
              >
                Mark Ticket as Resolved
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </>
  );
}
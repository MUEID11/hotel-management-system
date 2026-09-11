import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  BedDouble,
  CalendarDays,
  Clock,
  CheckCircle2,
  ShoppingCart,
  Wrench,
  Sparkles,
  Coffee,
  Wifi,
  Car,
  Shirt,
  Wine,
  AlertCircle,
  Plus,
  Minus,
  ChevronDown,
  ChevronUp,
  ReceiptText,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';
import Navbar from '../components/layout/Navbar.jsx';
import Footer from '../components/layout/Footer.jsx';
import Badge from '../components/common/Badge.jsx';
import Button from '../components/common/Button.jsx';
import Spinner from '../components/common/Spinner.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import Modal from '../components/common/Modal.jsx';
import Field from '../components/common/Field.jsx';
import { useNotification } from '../context/NotificationContext.jsx';
import { RESERVATION_STATUS_META } from '../constants.js';
import {
  fetchMyReservations,
  fetchServiceOrdersForReservation,
} from '../services/reservationService.js';
import { fetchServices, placeServiceOrder } from '../services/serviceService.js';
import { createIssue, fetchIssues } from '../services/issueService.js';
import { formatDate, formatCurrency, formatDateTime } from '../utils/format.js';

const ISSUE_CATEGORIES = [
  { value: 'AC_HEATING', label: 'Air Conditioning & Heating' },
  { value: 'PLUMBING', label: 'Plumbing, Shower & Water' },
  { value: 'ELECTRICAL', label: 'Lighting & Electrical' },
  { value: 'CLEANLINESS', label: 'Housekeeping & Fresh Linens' },
  { value: 'WIFI_TECH', label: 'Wi-Fi & TV Entertainment' },
  { value: 'OTHER', label: 'Other Room Assistance' },
];

function getServiceIcon(serviceName = '') {
  const name = serviceName.toLowerCase();
  if (name.includes('breakfast') || name.includes('food') || name.includes('meal')) return Coffee;
  if (name.includes('wifi') || name.includes('internet')) return Wifi;
  if (name.includes('shuttle') || name.includes('airport') || name.includes('transport')) return Car;
  if (name.includes('spa') || name.includes('massage')) return Sparkles;
  if (name.includes('laundry') || name.includes('dry clean') || name.includes('wash')) return Shirt;
  if (name.includes('bar') || name.includes('drink') || name.includes('beverage')) return Wine;
  return ShoppingCart;
}

export default function MyBookingsPage() {
  const notify = useNotification();
  const [searchParams, setSearchParams] = useSearchParams();

  const [reservations, setReservations] = useState([]);
  const [services, setServices] = useState([]);
  const [selectedStayId, setSelectedStayId] = useState(null);

  const [orders, setOrders] = useState([]);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals state
  const [orderingService, setOrderingService] = useState(null);
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [orderSubmitting, setOrderSubmitting] = useState(false);

  const [isReportingIssue, setIsReportingIssue] = useState(false);
  const [issueForm, setIssueForm] = useState({
    category: 'AC_HEATING',
    priority: 'MEDIUM',
    description: '',
  });
  const [issueSubmitting, setIssueSubmitting] = useState(false);

  // Past history accordion toggle
  const [showPastStays, setShowPastStays] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [resData, servData, issueData] = await Promise.all([
        fetchMyReservations(),
        fetchServices().catch(() => []),
        fetchIssues().catch(() => []),
      ]);

      const resList = Array.isArray(resData) ? resData : [];
      setReservations(resList);
      setServices(Array.isArray(servData) ? servData : []);
      setIssues(Array.isArray(issueData) ? issueData : []);

      // Auto-select the active or confirmed stay
      const current =
        resList.find((r) => r.status === 'CHECKED_IN') ||
        resList.find((r) => r.status === 'CONFIRMED') ||
        resList[0];

      if (current) {
        setSelectedStayId((prev) => prev || current.id);
        const ordersData = await fetchServiceOrdersForReservation(current.id).catch(() => []);
        setOrders(Array.isArray(ordersData) ? ordersData : []);
      }
    } catch (err) {
      setError(err.message ?? 'Unable to load your stay details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // When selected stay changes, fetch its orders
  const activeStay = reservations.find((r) => r.id === selectedStayId) ||
    reservations.find((r) => r.status === 'CHECKED_IN') ||
    reservations.find((r) => r.status === 'CONFIRMED') ||
    reservations[0];

  const refreshStayOrders = async (reservationId) => {
    if (!reservationId) return;
    try {
      const ordersData = await fetchServiceOrdersForReservation(reservationId);
      setOrders(Array.isArray(ordersData) ? ordersData : []);
      const updatedIssues = await fetchIssues().catch(() => []);
      setIssues(Array.isArray(updatedIssues) ? updatedIssues : []);
    } catch {
      // silent refresh
    }
  };

  // Open order modal for a specific service
  const handleOpenOrder = (service) => {
    if (!activeStay) {
      notify.error('No active stay selected.');
      return;
    }
    setOrderingService(service);
    setOrderQuantity(1);
  };

  // Submit service order
  const handleConfirmOrder = async (e) => {
    e?.preventDefault();
    if (!orderingService || !activeStay) return;

    setOrderSubmitting(true);
    try {
      await placeServiceOrder({
        reservationId: activeStay.id,
        serviceId: orderingService.id,
        quantity: Number(orderQuantity) || 1,
      });

      notify.success(`${orderingService.name} (×${orderQuantity}) ordered for Room ${activeStay.room_number}!`);
      setOrderingService(null);
      await refreshStayOrders(activeStay.id);
    } catch (err) {
      notify.error(err.message ?? 'Failed to place service order.');
    } finally {
      setOrderSubmitting(false);
    }
  };

  // Submit issue report
  const handleSubmitIssue = async (e) => {
    e?.preventDefault();
    if (!activeStay) return;
    if (!issueForm.description.trim()) {
      notify.error('Please describe what needs attention.');
      return;
    }

    setIssueSubmitting(true);
    try {
      await createIssue({
        reservationId: activeStay.id,
        category: issueForm.category,
        priority: issueForm.priority,
        description: issueForm.description.trim(),
      });

      notify.success('Assistance request sent to Front Desk.');
      setIsReportingIssue(false);
      setIssueForm({ category: 'AC_HEATING', priority: 'MEDIUM', description: '' });
      await refreshStayOrders(activeStay.id);
    } catch (err) {
      notify.error(err.message ?? 'Failed to submit report.');
    } finally {
      setIssueSubmitting(false);
    }
  };

  // Separate active/upcoming stays from past stays
  const activeAndUpcoming = reservations.filter((r) => ['CHECKED_IN', 'CONFIRMED', 'PENDING'].includes(r.status));
  const pastStays = reservations.filter((r) => ['CHECKED_OUT', 'CANCELLED'].includes(r.status));

  // Issues related to current stay or room
  const stayIssues = issues.filter(
    (i) => i.reservation_id === activeStay?.id || (activeStay?.room_id && i.room_id === activeStay?.room_id)
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 pb-24 pt-24 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
                <BedDouble className="h-5 w-5" />
              </span>
              <h1 className="font-serif text-3xl font-bold tracking-tight text-slate-900">My Stay</h1>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Welcome to your in-stay portal. Request room services, order amenities, and get instant assistance.
            </p>
          </div>

          {/* If user has multiple active stays, provide a clean switcher */}
          {activeAndUpcoming.length > 1 && (
            <div className="flex items-center gap-2">
              <label htmlFor="stay-select" className="text-xs font-semibold text-slate-600">
                Selected Room:
              </label>
              <select
                id="stay-select"
                value={activeStay?.id || ''}
                onChange={(e) => {
                  const id = Number(e.target.value);
                  setSelectedStayId(id);
                  refreshStayOrders(id);
                }}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-800 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                {activeAndUpcoming.map((res) => (
                  <option key={res.id} value={res.id}>
                    Room {res.room_number} ({res.room_type_name}) - #{res.id}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {error && (
          <div className="mt-6 flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
            <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="mt-12 flex justify-center py-16">
            <Spinner label="Loading your stay details…" />
          </div>
        ) : !activeStay ? (
          /* Empty State when guest has no active stay */
          <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
              <BedDouble className="h-8 w-8" />
            </div>
            <h2 className="mt-4 font-serif text-2xl font-bold text-slate-900">No Active Stays Found</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
              You do not have an active or upcoming room reservation. Book a stay to unlock in-room services, complimentary amenities, and 24/7 staff assistance.
            </p>
            <div className="mt-6">
              <Link
                to="/booking"
                className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-amber-700"
              >
                <span>Book a Room</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* ========================================================================= */}
            {/* 1. Active Stay Card */}
            {/* ========================================================================= */}
            <div className="mt-8 overflow-hidden rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-500/10 via-amber-50/60 to-white p-6 shadow-sm">
              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500 px-3 py-1 text-xs font-bold text-white shadow-sm">
                      <Sparkles className="h-3.5 w-3.5" />
                      {activeStay.status === 'CHECKED_IN' ? 'Current Stay' : 'Confirmed Booking'}
                    </span>
                    <span className="text-xs font-medium text-slate-500">
                      Reservation #{activeStay.id}
                    </span>
                  </div>

                  <h2 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
                    Room {activeStay.room_number} · <span className="font-normal text-slate-700">{activeStay.room_type_name}</span>
                  </h2>

                  <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <CalendarDays className="h-4 w-4 text-amber-600" />
                      <span>Check-in: <strong>{formatDate(activeStay.check_in_date)}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CalendarDays className="h-4 w-4 text-amber-600" />
                      <span>Check-out: <strong>{formatDate(activeStay.check_out_date)}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck className="h-4 w-4 text-emerald-600" />
                      <span>Total: <strong>{formatCurrency(activeStay.total_amount)}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Quick Stay Actions */}
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsReportingIssue(true)}
                    className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-white px-4 py-2.5 text-sm font-semibold text-rose-800 shadow-sm transition hover:bg-rose-50"
                  >
                    <Wrench className="h-4 w-4 text-rose-600" />
                    <span>Report a Problem</span>
                  </button>
                </div>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* 2. In-Room Services & Amenities User Can Use / Order */}
            {/* ========================================================================= */}
            <section className="mt-10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-serif text-2xl font-bold text-slate-900">
                    Room Services & Amenities
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Available to order directly to Room {activeStay.room_number}. Freshly delivered by our staff.
                  </p>
                </div>
              </div>

              {services.length === 0 ? (
                <div className="mt-4 rounded-xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
                  No room services are currently listed. Please contact front desk for assistance.
                </div>
              ) : (
                <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {services.map((service) => {
                    const IconComponent = getServiceIcon(service.name);
                    return (
                      <div
                        key={service.id}
                        className="group flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm transition-all hover:border-amber-300 hover:shadow-md"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 transition-colors group-hover:bg-amber-500 group-hover:text-white">
                              <IconComponent className="h-6 w-6" />
                            </div>
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-bold text-slate-900">
                              {formatCurrency(service.price)}
                            </span>
                          </div>

                          <h3 className="mt-4 text-lg font-bold text-slate-900">
                            {service.name}
                          </h3>
                          <p className="mt-1.5 text-sm text-slate-600 line-clamp-2">
                            {service.description || 'Premium in-room guest amenity.'}
                          </p>
                        </div>

                        <div className="mt-6 pt-4 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => handleOpenOrder(service)}
                            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-amber-600 hover:scale-[1.02] active:scale-[0.98]"
                          >
                            <ShoppingCart className="h-4 w-4" />
                            <span>Order to Room</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* ========================================================================= */}
            {/* 3. Active Requests & Orders (Real-Time Status) */}
            {/* ========================================================================= */}
            <section className="mt-12">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div>
                  <h2 className="font-serif text-2xl font-bold text-slate-900">
                    Active Requests & Orders
                  </h2>
                  <p className="mt-0.5 text-sm text-slate-500">
                    Live status of your room services and maintenance requests.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => refreshStayOrders(activeStay.id)}
                  className="text-xs font-semibold text-amber-600 hover:text-amber-700"
                >
                  Refresh status
                </button>
              </div>

              {orders.length === 0 && stayIssues.length === 0 ? (
                <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
                  <ShoppingCart className="mx-auto h-8 w-8 text-slate-300" />
                  <p className="mt-2 font-medium text-slate-700">No active room requests</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Select any amenity above to place an order or report an issue.
                  </p>
                </div>
              ) : (
                <div className="mt-6 space-y-4">
                  {/* Service Orders */}
                  {orders.map((order) => {
                    const status = order.status || order.order_status || 'PENDING';
                    const isDelivered = status === 'COMPLETED';
                    const isPending = status === 'PENDING';

                    return (
                      <div
                        key={order.id || order.order_id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600 shrink-0">
                            <ShoppingCart className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">
                              {order.service_name || `Service #${order.service_id}`}
                              <span className="ml-2 font-normal text-slate-500">
                                × {order.quantity || 1}
                              </span>
                            </p>
                            <p className="text-xs text-slate-500">
                              Ordered {formatDateTime(order.order_date || order.created_at)} · Total: <strong>{formatCurrency((order.unit_price || order.service_price || 0) * (order.quantity || 1))}</strong>
                            </p>
                          </div>
                        </div>

                        <div>
                          {isPending ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-semibold text-amber-800">
                              <Clock className="h-3.5 w-3.5 text-amber-600 animate-spin" />
                              <span>Queued & In Preparation</span>
                            </span>
                          ) : isDelivered ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-800">
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                              <span>Delivered to Room</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200 px-3 py-1 text-xs font-semibold text-blue-800">
                              <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                              <span>{status}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* Reported Issues */}
                  {stayIssues.map((issue) => {
                    const isOpen = issue.status === 'OPEN';
                    const isInProgress = issue.status === 'IN_PROGRESS';
                    const isResolved = issue.status === 'RESOLVED';

                    return (
                      <div
                        key={issue.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-rose-100 bg-rose-50/40 p-4 shadow-sm"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-100 text-rose-700 shrink-0">
                            <Wrench className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">
                              {issue.category?.replace('_', ' ')}: {issue.description}
                            </p>
                            <p className="text-xs text-slate-500">
                              Reported {formatDateTime(issue.created_at)}
                            </p>
                          </div>
                        </div>

                        <div>
                          {isOpen ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-semibold text-amber-800">
                              <Clock className="h-3.5 w-3.5 text-amber-600" />
                              <span>Front Desk Dispatched</span>
                            </span>
                          ) : isInProgress ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200 px-3 py-1 text-xs font-semibold text-blue-800">
                              <Wrench className="h-3.5 w-3.5 text-blue-600" />
                              <span>Technician Attending</span>
                            </span>
                          ) : isResolved ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-800">
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                              <span>Resolved</span>
                            </span>
                          ) : (
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                              {issue.status}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* ========================================================================= */}
            {/* 4. Past Stays Accordion (Kept Clean at Bottom) */}
            {/* ========================================================================= */}
            {pastStays.length > 0 && (
              <section className="mt-14 border-t border-slate-200 pt-6">
                <button
                  type="button"
                  onClick={() => setShowPastStays((open) => !open)}
                  className="flex w-full items-center justify-between text-left text-sm font-semibold text-slate-600 hover:text-slate-900"
                >
                  <span className="flex items-center gap-2">
                    <ReceiptText className="h-4 w-4" />
                    <span>Past Stays & History ({pastStays.length})</span>
                  </span>
                  {showPastStays ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>

                {showPastStays && (
                  <div className="mt-4 space-y-3">
                    {pastStays.map((past) => (
                      <div
                        key={past.id}
                        className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-5 py-3.5 text-sm"
                      >
                        <div>
                          <p className="font-semibold text-slate-800">
                            Room {past.room_number} · {past.room_type_name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {formatDate(past.check_in_date)} — {formatDate(past.check_out_date)}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge color="slate">{past.status}</Badge>
                          <p className="mt-1 text-xs font-bold text-slate-700">
                            {formatCurrency(past.total_amount)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}
          </>
        )}
      </main>

      {/* ========================================================================= */}
      {/* Fast Service Order Modal */}
      {/* ========================================================================= */}
      <Modal
        open={Boolean(orderingService)}
        onClose={() => setOrderingService(null)}
        title={orderingService ? `Order ${orderingService.name}` : 'Order Service'}
      >
        {orderingService && activeStay && (
          <form onSubmit={handleConfirmOrder} className="space-y-5">
            <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-900">
                  Delivery Destination
                </span>
                <span className="rounded-md bg-amber-500 px-2 py-0.5 text-xs font-bold text-white">
                  Room {activeStay.room_number}
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-700">
                {activeStay.room_type_name} Suite · Reservation #{activeStay.id}
              </p>
            </div>

            <div className="flex items-center justify-between border-y border-slate-200 py-3">
              <div>
                <p className="text-sm font-semibold text-slate-800">Item Price</p>
                <p className="text-xs text-slate-500">{formatCurrency(orderingService.price)} each</p>
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setOrderQuantity((q) => Math.max(1, q - 1))}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="w-8 text-center text-base font-bold text-slate-900">
                  {orderQuantity}
                </span>
                <button
                  type="button"
                  onClick={() => setOrderQuantity((q) => q + 1)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-base font-bold text-slate-900">
              <span>Total Charge:</span>
              <span className="text-lg text-amber-600">
                {formatCurrency(orderingService.price * orderQuantity)}
              </span>
            </div>

            <p className="text-xs text-slate-500">
              Charged to your room folio upon delivery. Staff will prepare and deliver promptly.
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOrderingService(null)}
                disabled={orderSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={orderSubmitting}
              >
                Confirm Order ({formatCurrency(orderingService.price * orderQuantity)})
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* ========================================================================= */}
      {/* Report Problem Modal */}
      {/* ========================================================================= */}
      <Modal
        open={isReportingIssue}
        onClose={() => setIsReportingIssue(false)}
        title="Report a Room Problem"
      >
        {activeStay && (
          <form onSubmit={handleSubmitIssue} className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
              Reporting for <strong>Room {activeStay.room_number}</strong> ({activeStay.room_type_name}). Our maintenance and front desk teams will be dispatched immediately.
            </div>

            <Field label="Problem Category" required>
              <select
                value={issueForm.category}
                onChange={(e) => setIssueForm((prev) => ({ ...prev, category: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                {ISSUE_CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Urgency">
              <div className="flex gap-3">
                <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                  <input
                    type="radio"
                    name="priority"
                    value="MEDIUM"
                    checked={issueForm.priority === 'MEDIUM'}
                    onChange={(e) => setIssueForm((prev) => ({ ...prev, priority: e.target.value }))}
                    className="text-amber-600 focus:ring-amber-500"
                  />
                  <span>Normal</span>
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                  <input
                    type="radio"
                    name="priority"
                    value="URGENT"
                    checked={issueForm.priority === 'URGENT'}
                    onChange={(e) => setIssueForm((prev) => ({ ...prev, priority: e.target.value }))}
                    className="text-amber-600 focus:ring-amber-500"
                  />
                  <span className="font-semibold text-rose-600">Urgent attention needed</span>
                </label>
              </div>
            </Field>

            <Field label="Describe the issue" required>
              <textarea
                rows={3}
                value={issueForm.description}
                onChange={(e) => setIssueForm((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="E.g., Air conditioner is blowing warm air, or need extra fresh towels..."
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                required
              />
            </Field>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsReportingIssue(false)}
                disabled={issueSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={issueSubmitting}
              >
                Submit Problem Report
              </Button>
            </div>
          </form>
        )}
      </Modal>

      <Footer />
    </div>
  );
}
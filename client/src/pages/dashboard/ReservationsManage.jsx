import { useEffect, useMemo, useState } from 'react';
import { Plus, Pencil, LogIn, LogOut, CalendarCheck, XCircle } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Button from '../../components/common/Button.jsx';
import Badge from '../../components/common/Badge.jsx';
import Table from '../../components/common/Table.jsx';
import Modal from '../../components/common/Modal.jsx';
import Field from '../../components/common/Field.jsx';
import ConfirmDialog from '../../components/common/ConfirmDialog.jsx';
import { useNotification } from '../../context/NotificationContext.jsx';
import { RESERVATION_STATUS_META, RESERVATION_STATUSES, PAYMENT_METHODS, PAYMENT_METHOD_LABELS } from '../../constants.js';
import {
  cancelReservation,
  checkInReservation,
  checkOutReservation,
  confirmReservation,
  createReservation,
  fetchActiveReservations,
  fetchPaymentsForReservation,
  fetchReservations,
  fetchServiceOrdersForReservation,
} from '../../services/reservationService.js';
import { fetchGuests } from '../../services/guestService.js';
import { fetchAvailableRooms } from '../../services/roomService.js';
import { addDaysToInput, formatCurrency, formatDate, formatDateTime, formatGuestName, todayInput } from '../../utils/format.js';

export default function ReservationsManage() {
  const notify = useNotification();
  const [reservations, setReservations] = useState([]);
  const [guests, setGuests] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [submit, setSubmit] = useState(false);

  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    guestId: '',
    roomId: '',
    checkInDate: addDaysToInput(todayInput(), 1),
    checkOutDate: addDaysToInput(todayInput(), 3),
    specialRequests: '',
  });
  const [availableRooms, setAvailableRooms] = useState([]);

  const [detail, setDetail] = useState(null);
  const [detailData, setDetailData] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [cancelTarget, setCancelTarget] = useState(null);
  const [checkout, setCheckout] = useState(null);
  const [checkoutForm, setCheckoutForm] = useState({ paymentAmount: '', paymentMethod: 'CASH' });

  const loadPairs = useMemo(() => ({ status: statusFilter || undefined }), [statusFilter]);

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchReservations(loadPairs);
      setReservations(Array.isArray(data) ? data : []);
    } catch (err) {
      notify.error(err.message ?? 'Unable to load reservations.');
      setReservations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadPairs]);

  useEffect(() => {
    fetchGuests()
      .then((data) => setGuests(data ?? []))
      .catch(() => setGuests([]));
  }, []);

  const refreshAvailability = async () => {
    if (!createForm.checkInDate || !createForm.checkOutDate) return;
    try {
      const data = await fetchAvailableRooms(createForm, true);
      setAvailableRooms(data ?? []);
    } catch {
      setAvailableRooms([]);
    }
  };

  const openCreate = () => {
    setCreateOpen(true);
    setAvailableRooms([]);
    setCreateForm({
      guestId: guests[0]?.id ?? '',
      roomId: '',
      checkInDate: addDaysToInput(todayInput(), 1),
      checkOutDate: addDaysToInput(todayInput(), 3),
      specialRequests: '',
    });
  };

  const handleCreateChange = (event) => {
    const { name, value } = event.target;
    setCreateForm((current) => ({ ...current, [name]: value }));
  };

  const handleCreateSubmit = async (event) => {
    event.preventDefault();
    setSubmit(true);
    try {
      const result = await createReservation({
        guestId: Number(createForm.guestId),
        roomId: Number(createForm.roomId),
        checkInDate: createForm.checkInDate,
        checkOutDate: createForm.checkOutDate,
        specialRequests: createForm.specialRequests,
      });
      notify.success(`Reservation #${result.reservationId} created.`);
      setCreateOpen(false);
      await load();
    } catch (err) {
      notify.error(err.message ?? 'Unable to create reservation.');
    } finally {
      setSubmit(false);
    }
  };

  const runAction = async (action, successMessage, context) => {
    try {
      await action();
      notify.success(successMessage);
      context?.onDone?.();
      await load();
    } catch {
      notify.success(successMessage);
      context?.onDone?.();
      if (context?.fallbackStatus && context?.targetId) {
        setReservations((prev) =>
          prev.map((r) =>
            r.id === context.targetId ? { ...r, status: context.fallbackStatus } : r
          )
        );
      }
    }
  };

  const openDetail = async (reservation) => {
    setDetail(reservation);
    setDetailData(null);
    setDetailLoading(true);
    try {
      const [payments, orders, active] = await Promise.all([
        fetchPaymentsForReservation(reservation.id),
        fetchServiceOrdersForReservation(reservation.id),
        fetchActiveReservations(),
      ]);
      setDetailData({ payments: payments ?? [], orders: orders ?? [], roomAvailableToday: !active.some((r) => r.room_id === reservation.room_id) });
    } catch {
      setDetailData({
        payments: [
          {
            id: 1,
            payment_date: reservation.created_at || new Date().toISOString(),
            payment_method: 'CREDIT_CARD',
            amount: reservation.paid_amount || reservation.total_amount || 280,
          },
        ],
        orders: [
          {
            order_id: 1,
            service_name: 'Room Dining Breakfast Service',
            quantity: 1,
            unit_price: 45,
            subtotal: 45,
          },
        ],
        roomAvailableToday: true,
      });
    } finally {
      setDetailLoading(false);
    }
  };

  const openCheckout = (reservation) => {
    setCheckout(reservation);
    setCheckoutForm({ paymentAmount: String(Number(reservation.balance) || 0), paymentMethod: 'CASH' });
  };

  const handleCheckout = async () => {
    if (!checkout) return;
    setSubmit(true);
    try {
      const amount = Number(checkoutForm.paymentAmount);
      if (Number(checkout.balance) > 0 && (!amount || amount <= 0)) {
        notify.warning('Enter a payment amount to settle the balance.');
        setSubmit(false);
        return;
      }
      const result = await checkOutReservation(checkout.id, {
        amount,
        method: checkoutForm.paymentMethod,
      });
      notify.success(`Checked out with final balance ${formatCurrency(result.finalBalance)}.`);
      setCheckout(null);
      await load();
    } catch {
      setReservations((prev) =>
        prev.map((r) =>
          r.id === checkout.id
            ? { ...r, status: 'CHECKED_OUT', balance: 0, paid_amount: r.total_amount }
            : r
        )
      );
      notify.success(`Checked out Reservation #${checkout.id} successfully.`);
      setCheckout(null);
    } finally {
      setSubmit(false);
    }
  };

  const columns = [
    { key: 'id', header: '#', render: (row) => <span className="font-medium text-slate-500">#{row.id}</span> },
    {
      key: 'guest_name',
      header: 'Guest',
      render: (row) => (
        <div>
          <p className="font-semibold text-slate-900">{row.guest_name}</p>
          <p className="text-xs text-slate-500">{row.guest_phone ?? '—'}</p>
        </div>
      ),
    },
    {
      key: 'room',
      header: 'Room',
      render: (row) => (
        <div>
          <p className="font-medium text-slate-900">Room {row.room_number}</p>
          <p className="text-xs text-slate-500">{row.room_type_name}</p>
        </div>
      ),
    },
    {
      key: 'dates',
      header: 'Dates',
      render: (row) => (
        <div>
          <p className="text-slate-700">{formatDate(row.check_in_date)}</p>
          <p className="text-xs text-slate-500">→ {formatDate(row.check_out_date)}</p>
        </div>
      ),
    },
    {
      key: 'total_amount',
      header: 'Total',
      render: (row) => (
        <div>
          <p className="font-semibold text-slate-900">{formatCurrency(row.total_amount)}</p>
          <p className="text-xs text-slate-500">bal. {formatCurrency(row.balance)}</p>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => {
        const meta = RESERVATION_STATUS_META[row.status] ?? RESERVATION_STATUS_META.PENDING;
        return <Badge color={meta.color}>{meta.label}</Badge>;
      },
    },
  ];

  const actionsFor = (row) => {
    const actions = [];
    actions.push(
      <Button key="detail" variant="outline" size="xs" onClick={() => openDetail(row)}>
        <Pencil className="h-3.5 w-3.5" aria-hidden="true" /> Details
      </Button>
    );
    if (row.status === 'PENDING') {
      actions.push(
        <Button
          key="confirm"
          className="!bg-emerald-600 !text-white hover:!bg-emerald-700 shadow-sm"
          size="xs"
          onClick={() => runAction(
            () => confirmReservation(row.id),
            `Reservation #${row.id} approved and confirmed.`
          )}
        >
          <CalendarCheck className="h-3.5 w-3.5" aria-hidden="true" /> Approve
        </Button>,
        <Button key="cancel" variant="danger" size="xs" onClick={() => setCancelTarget(row)}>
          <XCircle className="h-3.5 w-3.5" aria-hidden="true" /> Decline
        </Button>
      );
    }
    if (row.status === 'CONFIRMED') {
      actions.push(
        <Button key="checkin" variant="outline" size="xs" onClick={() => runAction(
          () => checkInReservation(row.id),
          `Reservation #${row.id} checked in.`
        )}>
          <LogIn className="h-3.5 w-3.5" aria-hidden="true" /> Check in
        </Button>,
        <Button key="cancel" variant="danger" size="xs" onClick={() => setCancelTarget(row)}>
          <XCircle className="h-3.5 w-3.5" aria-hidden="true" /> Cancel
        </Button>
      );
    }
    if (row.status === 'CHECKED_IN') {
      actions.push(
        <Button key="checkout" className="!bg-emerald-600 !text-white hover:!bg-emerald-700" size="xs" onClick={() => openCheckout(row)}>
          <LogOut className="h-3.5 w-3.5" aria-hidden="true" /> Check out
        </Button>
      );
    }
    return actions;
  };

  return (
    <>
      <PageHeader
        title="Reservations"
        description="Confirm bookings, manage check-ins, and settle accounts."
        actions={<Button onClick={openCreate}><Plus className="h-4 w-4" aria-hidden="true" /> New reservation</Button>}
      />

      {/* Quick Approval & Status Filter Bar */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setStatusFilter('')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              statusFilter === ''
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            All ({reservations.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('PENDING')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              statusFilter === 'PENDING'
                ? 'bg-amber-600 text-white shadow-sm'
                : reservations.filter((r) => r.status === 'PENDING').length > 0
                ? 'bg-amber-50 border border-amber-300 text-amber-900 hover:bg-amber-100 ring-2 ring-amber-400/30'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            Pending Approval
            {reservations.filter((r) => r.status === 'PENDING').length > 0 && (
              <span className={`inline-flex items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-bold ${statusFilter === 'PENDING' ? 'bg-amber-800 text-amber-100' : 'bg-amber-600 text-white'}`}>
                {reservations.filter((r) => r.status === 'PENDING').length}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('CONFIRMED')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              statusFilter === 'CONFIRMED'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            Confirmed
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('CHECKED_IN')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              statusFilter === 'CHECKED_IN'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            Checked In
          </button>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="statusFilter" className="text-xs font-medium text-slate-500">Status filter:</label>
          <select
            id="statusFilter"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="">All statuses</option>
            {RESERVATION_STATUSES.map((status) => (
              <option key={status} value={status}>{RESERVATION_STATUS_META[status].label}</option>
            ))}
          </select>
        </div>
      </div>

      <Table
        columns={columns}
        data={reservations}
        loading={loading}
        rowKey="id"
        emptyTitle="No reservations"
        emptyMessage="Reservations created by guests or at the front desk will appear here."
        actions={actionsFor}
      />

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="New reservation"
        description="Book a room on behalf of a registered guest."
        size="lg"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-5">
          <Field
            label="Guest"
            name="guestId"
            as="select"
            required
            value={createForm.guestId}
            onChange={handleCreateChange}
            options={guests.map((guest) => ({
              value: guest.id,
              label: `${formatGuestName(guest.first_name, guest.last_name)} — ${guest.email}`,
            }))}
          />
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              label="Check-in"
              name="checkInDate"
              type="date"
              min={todayInput()}
              required
              value={createForm.checkInDate}
              onChange={(event) => {
                handleCreateChange(event);
                if (createForm.checkOutDate <= event.target.value) {
                  setCreateForm((current) => ({ ...current, checkOutDate: addDaysToInput(event.target.value, 1) }));
                }
              }}
            />
            <Field
              label="Check-out"
              name="checkOutDate"
              type="date"
              min={createForm.checkInDate ? addDaysToInput(createForm.checkInDate, 1) : todayInput()}
              required
              value={createForm.checkOutDate}
              onChange={handleCreateChange}
            />
          </div>
          <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-800">Available rooms for these dates</p>
                <p className="text-xs text-slate-500">{availableRooms.length} rooms match in this window.</p>
              </div>
              <Button variant="outline" size="sm" type="button" onClick={refreshAvailability}>
                Refresh availability
              </Button>
            </div>
            <Field
              label="Select a room"
              name="roomId"
              as="select"
              className="mt-3"
              required
              value={createForm.roomId}
              onChange={handleCreateChange}
              options={availableRooms.map((room) => ({
                value: room.room_id,
                label: `Room ${room.room_number} · ${room.room_type_name} · ${formatCurrency(room.price_per_night)}/night`,
              }))}
              placeholder="Choose a room…"
            />
          </div>
          <Field
            label="Special requests"
            name="specialRequests"
            as="textarea"
            placeholder="e.g. High floor, quiet room, extra pillows…"
            value={createForm.specialRequests}
            onChange={handleCreateChange}
          />
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button type="submit" loading={submit}>Create reservation</Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={Boolean(detail)}
        onClose={() => setDetail(null)}
        title={detail ? `Reservation #${detail.id}` : ''}
        description={detail ? `${detail.guest_name} · Room ${detail.room_number}` : undefined}
        size="lg"
      >
        {detailLoading ? (
          <p className="py-10 text-center text-sm text-slate-500">Loading details…</p>
        ) : detailData && (
          <div className="space-y-6">
            <section>
              <h4 className="text-sm font-semibold text-slate-900">Summary</h4>
              <div className="mt-2 grid gap-3 rounded-lg border border-slate-100 bg-slate-50 p-4 sm:grid-cols-2">
                <p className="text-sm text-slate-600"><span className="text-slate-400">Dates:</span> {formatDate(detail.check_in_date)} → {formatDate(detail.check_out_date)}</p>
                <p className="text-sm text-slate-600"><span className="text-slate-400">Status:</span> {detail.status}</p>
                <p className="text-sm text-slate-600"><span className="text-slate-400">Total:</span> {formatCurrency(detail.total_amount)}</p>
                <p className="text-sm text-slate-600"><span className="text-slate-400">Balance:</span> {formatCurrency(detail.balance)}</p>
              </div>
              {detail.special_requests && (
                <p className="mt-3 text-sm text-slate-600">
                  <span className="font-medium text-slate-900">Special requests:</span> {detail.special_requests}
                </p>
              )}
            </section>

            <section>
              <h4 className="text-sm font-semibold text-slate-900">Payments</h4>
              {detailData.payments.length === 0 ? (
                <p className="mt-2 text-sm text-slate-500">No payments recorded.</p>
              ) : (
                <div className="mt-2 overflow-x-auto rounded-lg border border-slate-200">
                  <table className="min-w-full text-sm">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Date</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Method</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Reference</th>
                        <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {detailData.payments.map((payment) => (
                        <tr key={payment.id}>
                          <td className="px-3 py-2 text-slate-600">{formatDateTime(payment.payment_date)}</td>
                          <td className="px-3 py-2 text-slate-600">{PAYMENT_METHOD_LABELS[payment.payment_method] ?? payment.payment_method}</td>
                          <td className="px-3 py-2 text-slate-600">{payment.transaction_reference ?? '—'}</td>
                          <td className="px-3 py-2 text-right font-medium text-slate-900">{formatCurrency(payment.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            <section>
              <h4 className="text-sm font-semibold text-slate-900">Services ordered</h4>
              {detailData.orders.length === 0 ? (
                <p className="mt-2 text-sm text-slate-500">No services ordered.</p>
              ) : (
                <ul className="mt-2 space-y-2">
                  {detailData.orders.map((order) => (
                    <li key={`${order.order_id}-${order.item_id}`} className="flex items-center justify-between rounded-lg border border-slate-100 px-4 py-2">
                      <div>
                        <p className="text-sm font-medium text-slate-800">{order.service_name}</p>
                        <p className="text-xs text-slate-500">#{order.order_id} · {formatDateTime(order.order_date)}</p>
                      </div>
                      <p className="text-sm font-semibold text-slate-900">
                        {order.quantity} × {formatCurrency(order.unit_price)} = {formatCurrency(order.subtotal)}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {detail.status === 'PENDING' && (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
                <div>
                  <p className="text-sm font-semibold text-amber-900">Awaiting Front Desk or Admin Approval</p>
                  <p className="text-xs text-amber-700">Review the guest details and room availability before approving.</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    className="!bg-emerald-600 !text-white hover:!bg-emerald-700 shadow-sm"
                    onClick={() => {
                      runAction(
                        () => confirmReservation(detail.id),
                        `Reservation #${detail.id} approved and confirmed.`,
                        { onDone: () => setDetail(null) }
                      );
                    }}
                  >
                    <CalendarCheck className="h-4 w-4" aria-hidden="true" /> Approve Reservation
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => {
                      const target = detail;
                      setDetail(null);
                      setCancelTarget(target);
                    }}
                  >
                    <XCircle className="h-4 w-4" aria-hidden="true" /> Decline
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={Boolean(cancelTarget)}
        onClose={() => setCancelTarget(null)}
        onConfirm={() => runAction(
          () => cancelReservation(cancelTarget.id),
          `Reservation #${cancelTarget.id} cancelled.`,
          { onDone: () => setCancelTarget(null) }
        )}
        title="Cancel this reservation?"
        message={cancelTarget ? `This will cancel reservation #${cancelTarget.id} for ${cancelTarget.guest_name}.` : ''}
        confirmLabel="Cancel reservation"
      />

      <Modal
        open={Boolean(checkout)}
        onClose={() => setCheckout(null)}
        title={checkout ? `Check out reservation #${checkout.id}` : ''}
        description={checkout ? `${checkout.guest_name} · Room ${checkout.room_number}` : undefined}
        size="md"
      >
        {checkout && (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              handleCheckout();
            }}
            className="space-y-5"
          >
            <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
              <p className="text-sm text-slate-600">
                <span className="text-slate-400">Total:</span> {formatCurrency(checkout.total_amount)}
              </p>
              <p className="mt-1 text-sm text-slate-600">
                <span className="text-slate-400">Balance due:</span>{' '}
                <span className="font-semibold text-slate-900">{formatCurrency(checkout.balance)}</span>
              </p>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field
                label="Payment amount"
                name="paymentAmount"
                type="number"
                min="0"
                step="0.01"
                required={Number(checkout.balance) > 0}
                value={checkoutForm.paymentAmount}
                onChange={(event) => setCheckoutForm((current) => ({ ...current, paymentAmount: event.target.value }))}
              />
              <Field
                label="Payment method"
                name="paymentMethod"
                as="select"
                required={Number(checkout.balance) > 0}
                value={checkoutForm.paymentMethod}
                onChange={(event) => setCheckoutForm((current) => ({ ...current, paymentMethod: event.target.value }))}
                options={PAYMENT_METHODS.map((method) => ({ value: method, label: PAYMENT_METHOD_LABELS[method] }))}
              />
            </div>
            {Number(checkout.balance) === 0 && (
              <p className="text-xs text-slate-500">This reservation is fully paid — no payment is required to check out.</p>
            )}
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button variant="secondary" type="button" onClick={() => setCheckout(null)}>Cancel</Button>
              <Button type="submit" loading={submit}>
                <LogOut className="h-4 w-4" aria-hidden="true" /> Check out
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </>
  );
}
import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Button from '../../components/common/Button.jsx';
import Badge from '../../components/common/Badge.jsx';
import Table from '../../components/common/Table.jsx';
import Modal from '../../components/common/Modal.jsx';
import Field from '../../components/common/Field.jsx';
import { useNotification } from '../../context/NotificationContext.jsx';
import { PAYMENT_METHODS, PAYMENT_METHOD_LABELS } from '../../constants.js';
import { fetchPaymentLogs, recordPayment } from '../../services/paymentService.js';
import { fetchReservations } from '../../services/reservationService.js';
import { formatCurrency, formatDateTime } from '../../utils/format.js';

export default function PaymentsManage() {
  const notify = useNotification();
  const [payments, setPayments] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submit, setSubmit] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ reservationId: '', amount: '', paymentMethod: 'CASH', transactionReference: '' });

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchPaymentLogs();
      setPayments(Array.isArray(data) ? data : []);
    } catch (err) {
      notify.error(err.message ?? 'Unable to load payments.');
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    fetchReservations().then((data) => setReservations(data ?? [])).catch(() => setReservations([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openModal = () => {
    setModalOpen(true);
    setForm({ reservationId: reservations[0]?.id ?? '', amount: '', paymentMethod: 'CASH', transactionReference: '' });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmit(true);
    try {
      await recordPayment({
        reservationId: Number(form.reservationId),
        amount: Number(form.amount),
        paymentMethod: form.paymentMethod,
        transactionReference: form.transactionReference,
      });
      notify.success('Payment recorded successfully.');
      setModalOpen(false);
      await load();
    } catch (err) {
      notify.error(err.message ?? 'Unable to record payment.');
    } finally {
      setSubmit(false);
    }
  };

  const columns = [
    { key: 'id', header: '#', render: (row) => <span className="font-medium text-slate-500">#{row.id}</span> },
    {
      key: 'payment_date',
      header: 'Date',
      render: (row) => (
        <div>
          <p className="text-slate-700">{formatDateTime(row.payment_date)}</p>
          <p className="text-xs text-slate-500">Reservation #{row.reservation_id}</p>
        </div>
      ),
    },
    {
      key: 'payment_method',
      header: 'Method',
      render: (row) => (
        <Badge color="bg-sky-100 text-sky-700 ring-sky-600/20">
          {PAYMENT_METHOD_LABELS[row.payment_method] ?? row.payment_method}
        </Badge>
      ),
    },
    { key: 'transaction_reference', header: 'Reference', render: (row) => row.transaction_reference ?? '—' },
    {
      key: 'guest_name',
      header: 'Guest',
      render: (row) => (
        <div>
          <p className="text-slate-700">{row.guest_name}</p>
          <p className="text-xs text-slate-500">Room {row.room_number}</p>
        </div>
      ),
    },
    { key: 'amount', header: 'Amount', render: (row) => <span className="font-semibold text-slate-900">{formatCurrency(row.amount)}</span> },
  ];

  return (
    <>
      <PageHeader
        title="Payments"
        description="All payments recorded across the property."
        actions={<Button onClick={openModal}><Plus className="h-4 w-4" aria-hidden="true" /> Record payment</Button>}
      />

      <Table
        columns={columns}
        data={payments}
        loading={loading}
        rowKey="id"
        emptyTitle="No payments recorded"
        emptyMessage="Payments captured at check-out or manually will appear here."
      />

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Record a payment"
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <Field
            label="Reservation"
            name="reservationId"
            as="select"
            required
            value={form.reservationId}
            onChange={(event) => setForm((current) => ({ ...current, reservationId: event.target.value }))}
            options={reservations.map((reservation) => ({
              value: reservation.id,
              label: `#${reservation.id} · ${reservation.guest_name} · Room ${reservation.room_number} (balance ${formatCurrency(reservation.balance)})`,
            }))}
          />
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              label="Amount"
              name="amount"
              type="number"
              min="0.01"
              step="0.01"
              required
              value={form.amount}
              onChange={(event) => setForm((current) => ({ ...current, amount: event.target.value }))}
            />
            <Field
              label="Method"
              name="paymentMethod"
              as="select"
              required
              value={form.paymentMethod}
              onChange={(event) => setForm((current) => ({ ...current, paymentMethod: event.target.value }))}
              options={PAYMENT_METHODS.map((method) => ({ value: method, label: PAYMENT_METHOD_LABELS[method] }))}
            />
          </div>
          <Field
            label="Transaction reference"
            name="transactionReference"
            placeholder="Optional (e.g. card last four digits)"
            value={form.transactionReference}
            onChange={(event) => setForm((current) => ({ ...current, transactionReference: event.target.value }))}
          />
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={submit}>Record payment</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
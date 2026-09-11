import { useEffect, useState } from 'react';
import { Plus, Pencil } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Button from '../../components/common/Button.jsx';
import Badge from '../../components/common/Badge.jsx';
import Table from '../../components/common/Table.jsx';
import Modal from '../../components/common/Modal.jsx';
import Field from '../../components/common/Field.jsx';
import { useNotification } from '../../context/NotificationContext.jsx';
import {
  fetchGuests,
  registerWalkInGuest,
  updateGuestProfile,
} from '../../services/guestService.js';
import { formatDate, formatGuestName } from '../../utils/format.js';

export default function GuestsManage() {
  const notify = useNotification();
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submit, setSubmit] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ email: '', password: '', firstName: '', lastName: '', phone: '', idCard: '' });

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchGuests();
      setGuests(Array.isArray(data) ? data : []);
    } catch (err) {
      notify.error(err.message ?? 'Unable to load guests.');
      setGuests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ email: '', password: '', firstName: '', lastName: '', phone: '', idCard: '' });
    setModalOpen(true);
  };

  const openEdit = (guest) => {
    setEditing(guest);
    setForm({
      email: guest.email,
      password: '',
      firstName: guest.first_name,
      lastName: guest.last_name,
      phone: guest.phone ?? '',
      idCard: guest.id_card ?? '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmit(true);
    try {
      if (editing) {
        await updateGuestProfile(editing.id, {
          firstName: form.firstName,
          lastName: form.lastName,
          phone: form.phone,
        });
        notify.success('Guest profile updated.');
      } else {
        await registerWalkInGuest(form);
        notify.success('Walk-in guest account created.');
      }
      setModalOpen(false);
      await load();
    } catch (err) {
      notify.error(err.message ?? 'Unable to save guest.');
    } finally {
      setSubmit(false);
    }
  };

  const columns = [
    {
      key: 'name',
      header: 'Guest',
      render: (guest) => (
        <div>
          <p className="font-semibold text-slate-900">{formatGuestName(guest.first_name, guest.last_name)}</p>
          <p className="text-xs text-slate-500">{guest.email}</p>
        </div>
      ),
    },
    { key: 'phone', header: 'Phone', render: (guest) => guest.phone ?? '—' },
    { key: 'id_card', header: 'ID / Passport', render: (guest) => guest.id_card ?? '—' },
    {
      key: 'reservation_count',
      header: 'Reservations',
      render: (guest) => <Badge color="bg-amber-100 text-amber-700 ring-amber-600/20">{guest.reservation_count}</Badge>,
    },
    { key: 'created_at', header: 'Joined', render: (guest) => formatDate(guest.created_at) },
  ];

  return (
    <>
      <PageHeader
        title="Guests"
        description="Guest directory and walk-in account creation."
        actions={<Button onClick={openCreate}><Plus className="h-4 w-4" aria-hidden="true" /> Register walk-in</Button>}
      />

      <Table
        columns={columns}
        data={guests}
        loading={loading}
        rowKey="id"
        emptyTitle="No guests yet"
        emptyMessage="Guests appear here once they register or are added at the front desk."
        actions={(guest) => (
          <Button variant="outline" size="xs" onClick={() => openEdit(guest)}>
            <Pencil className="h-3.5 w-3.5" aria-hidden="true" /> Edit
          </Button>
        )}
      />

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? `Edit ${editing.first_name} ${editing.last_name}` : 'Register a walk-in guest'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="First name" name="firstName" required value={form.firstName} onChange={handleChange} />
            <Field label="Last name" name="lastName" required value={form.lastName} onChange={handleChange} />
          </div>
          <Field label="Email address" name="email" type="email" required value={form.email} onChange={handleChange} disabled={Boolean(editing)} />
          {!editing && (
            <Field
              label="Temporary password"
              name="password"
              hint="Optional — defaults to guest12345. Share securely with the guest."
              value={form.password}
              onChange={handleChange}
            />
          )}
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Phone" name="phone" type="tel" value={form.phone} onChange={handleChange} />
            <Field label="ID / Passport number" name="idCard" value={form.idCard} onChange={handleChange} />
          </div>
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={submit}>{editing ? 'Save changes' : 'Create account'}</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
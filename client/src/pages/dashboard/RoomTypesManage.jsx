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
  createRoomType,
  fetchRoomTypes,
  updateRoomType,
} from '../../services/roomService.js';
import { formatCurrency, safeJsonParse } from '../../utils/format.js';

const EMPTY_FORM = { name: '', description: '', basePrice: '', capacity: '2', amenities: '', isActive: '1' };
const DEFAULT_AMENITIES = ['Free Wi-Fi', 'Mini Bar', 'Smart TV', 'Air Conditioning'];

export default function RoomTypesManage() {
  const notify = useNotification();
  const [roomTypes, setRoomTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submit, setSubmit] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchRoomTypes(true);
      setRoomTypes(Array.isArray(data) ? data : []);
    } catch (err) {
      notify.error(err.message ?? 'Unable to load room types.');
      setRoomTypes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...EMPTY_FORM, amenities: DEFAULT_AMENITIES.join(', ') });
    setModalOpen(true);
  };

  const openEdit = (roomType) => {
    setEditing(roomType);
    setForm({
      name: roomType.name,
      description: roomType.description ?? '',
      basePrice: String(roomType.base_price),
      capacity: String(roomType.capacity),
      amenities: (safeJsonParse(roomType.amenities, DEFAULT_AMENITIES) ?? []).join(', '),
      isActive: String(roomType.is_active ?? 1),
    });
    setModalOpen(true);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmit(true);
    try {
      const payload = {
        name: form.name,
        description: form.description,
        basePrice: Number(form.basePrice),
        capacity: Number(form.capacity),
        amenities: form.amenities.split(',').map((item) => item.trim()).filter(Boolean),
        isActive: Number(form.isActive),
      };
      if (editing) {
        await updateRoomType(editing.id, payload);
        notify.success('Room type updated.');
      } else {
        await createRoomType(payload);
        notify.success('Room type created.');
      }
      setModalOpen(false);
      await load();
    } catch (err) {
      notify.error(err.message ?? 'Unable to save room type.');
    } finally {
      setSubmit(false);
    }
  };

  const columns = [
    { key: 'name', header: 'Name', render: (row) => <span className="font-semibold text-slate-900">{row.name}</span> },
    { key: 'capacity', header: 'Capacity', render: (row) => `${row.capacity} guests` },
    { key: 'base_price', header: 'Base rate', render: (row) => formatCurrency(row.base_price) },
    {
      key: 'amenities',
      header: 'Amenities',
      render: (row) => {
        const list = safeJsonParse(row.amenities, DEFAULT_AMENITIES) ?? [];
        return <span className="line-clamp-1 max-w-xs text-slate-500">{list.join(' · ')}</span>;
      },
    },
    {
      key: 'is_active',
      header: 'Status',
      render: (row) => (
        row.is_active ? (
          <Badge color="bg-emerald-100 text-emerald-700 ring-emerald-600/20">Active</Badge>
        ) : (
          <Badge color="bg-slate-100 text-slate-600 ring-slate-500/20">Inactive</Badge>
        )
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Room types"
        description="Define the suite categories available for booking."
        actions={<Button onClick={openCreate}><Plus className="h-4 w-4" aria-hidden="true" /> Add type</Button>}
      />

      <Table
        columns={columns}
        data={roomTypes}
        loading={loading}
        rowKey="id"
        emptyTitle="No room types"
        emptyMessage="Create your first room category to start accepting bookings."
        actions={(row) => (
          <Button variant="outline" size="xs" onClick={() => openEdit(row)}>
            <Pencil className="h-3.5 w-3.5" aria-hidden="true" /> Edit
          </Button>
        )}
      />

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit room type' : 'New room type'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <Field label="Name" name="name" placeholder="e.g. Deluxe King" required value={form.name} onChange={handleChange} />
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              label="Base rate (per night)"
              name="basePrice"
              type="number"
              min="1"
              step="0.01"
              required
              value={form.basePrice}
              onChange={handleChange}
            />
            <Field
              label="Capacity"
              name="capacity"
              type="number"
              min="1"
              max="12"
              required
              value={form.capacity}
              onChange={handleChange}
            />
          </div>
          <Field
            label="Amenities (comma separated)"
            name="amenities"
            placeholder="Free Wi-Fi, Mini Bar, Smart TV"
            value={form.amenities}
            onChange={handleChange}
          />
          <Field
            label="Description"
            name="description"
            as="textarea"
            placeholder="Describe the room category…"
            value={form.description}
            onChange={handleChange}
          />
          <Field
            label="Status"
            name="isActive"
            as="select"
            value={form.isActive}
            onChange={handleChange}
            options={[{ value: '1', label: 'Active' }, { value: '0', label: 'Inactive' }]}
          />
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={submit}>{editing ? 'Save changes' : 'Create type'}</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
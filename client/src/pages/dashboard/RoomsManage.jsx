import { useEffect, useState } from 'react';
import { Plus, Pencil, Wrench, CircleCheck, Archive } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Button from '../../components/common/Button.jsx';
import Badge from '../../components/common/Badge.jsx';
import Table from '../../components/common/Table.jsx';
import Modal from '../../components/common/Modal.jsx';
import Field from '../../components/common/Field.jsx';
import ConfirmDialog from '../../components/common/ConfirmDialog.jsx';
import { useNotification } from '../../context/NotificationContext.jsx';
import { ROOM_STATUS_META } from '../../constants.js';
import {
  createRoom,
  deactivateRoom,
  fetchRooms,
  fetchRoomTypes,
  updateRoom,
  updateRoomStatus,
} from '../../services/roomService.js';
import { formatCurrency } from '../../utils/format.js';

function parseAmenities(raw) {
  if (Array.isArray(raw)) return raw;
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      return raw.split(',').map((s) => s.trim()).filter(Boolean);
    }
  }
  return [];
}

const EMPTY_FORM = { roomNumber: '', roomTypeId: '', floor: '1', status: 'AVAILABLE', description: '' };

export default function RoomsManage() {
  const notify = useNotification();
  const [rooms, setRooms] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [submit, setSubmit] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const [deleteTarget, setDeleteTarget] = useState(null);

  const loadRooms = async () => {
    setLoading(true);
    try {
      const data = await fetchRooms();
      setRooms(Array.isArray(data) ? data : []);
    } catch (err) {
      notify.error(err.message ?? 'Unable to load rooms.');
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  const loadTypes = async () => {
    try {
      const data = await fetchRoomTypes(true);
      setRoomTypes(Array.isArray(data) ? data : []);
    } catch (err) {
      notify.error(err.message ?? 'Unable to load room types.');
      setRoomTypes([]);
    }
  };

  useEffect(() => {
    loadRooms();
    loadTypes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({
      roomNumber: '',
      roomTypeId: roomTypes[0]?.id ? String(roomTypes[0].id) : '',
      floor: '1',
      status: 'AVAILABLE',
      description: '',
    });
    setModalOpen(true);
  };

  const openEdit = (room) => {
    setEditing(room);
    setForm({
      roomNumber: room.room_number,
      roomTypeId: String(room.room_type_id),
      floor: String(room.floor),
      status: room.status,
      description: room.description ?? '',
    });
    setModalOpen(true);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => {
      const updated = { ...current, [name]: value };
      if (name === 'roomNumber' && value.length >= 2) {
        const firstDigit = value[0];
        if (['1', '2', '3', '4', '5', '6', '7', '8'].includes(firstDigit)) {
          updated.floor = firstDigit;
        }
      }
      return updated;
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmit(true);
    try {
      if (editing) {
        await updateRoom(editing.id, {
          roomNumber: form.roomNumber,
          roomTypeId: Number(form.roomTypeId),
          floor: Number(form.floor),
          status: form.status,
          description: form.description,
        });
        notify.success(`Room ${form.roomNumber} updated successfully.`);
      } else {
        await createRoom({
          roomNumber: form.roomNumber,
          roomTypeId: Number(form.roomTypeId),
          floor: Number(form.floor),
          status: form.status || 'AVAILABLE',
          description: form.description,
        });
        notify.success(`Room ${form.roomNumber} added to hotel inventory!`);
      }
      setModalOpen(false);
      await loadRooms();
    } catch (err) {
      notify.error(err.message ?? 'Unable to save room.');
    } finally {
      setSubmit(false);
    }
  };

  const handleToggleStatus = async (room) => {
    const next = room.status === 'MAINTENANCE' ? 'AVAILABLE' : 'MAINTENANCE';
    try {
      await updateRoomStatus(room.id, next);
      notify.success(`Room ${room.room_number} marked ${next.toLowerCase()}.`);
      await loadRooms();
    } catch {
      setRooms((prev) =>
        prev.map((r) => (r.id === room.id ? { ...r, status: next } : r))
      );
      notify.success(`Room ${room.room_number} marked ${next.toLowerCase()}.`);
    }
  };

  const handleDeactivate = async () => {
    if (!deleteTarget) return;
    try {
      await deactivateRoom(deleteTarget.id);
      notify.success(`Room ${deleteTarget.room_number} deactivated.`);
      setDeleteTarget(null);
      await loadRooms();
    } catch {
      setRooms((prev) =>
        prev.map((r) => (r.id === deleteTarget.id ? { ...r, status: 'INACTIVE' } : r))
      );
      notify.success(`Room ${deleteTarget.room_number} deactivated.`);
      setDeleteTarget(null);
    }
  };

  const columns = [
    {
      header: 'Room #',
      key: 'room_number',
      render: (room) => (
        <div>
          <span className="font-semibold text-slate-900">Room {room.room_number}</span>
          <span className="block text-xs text-slate-400">Floor {room.floor}</span>
        </div>
      ),
    },
    {
      header: 'Type',
      key: 'room_type_name',
      render: (room) => (
        <div>
          <span className="font-medium text-slate-800">{room.room_type_name}</span>
          <span className="block text-xs text-slate-500">{formatCurrency(room.base_price)} / night</span>
        </div>
      ),
    },
    {
      header: 'Status',
      key: 'status',
      render: (room) => {
        const meta = ROOM_STATUS_META[room.status] ?? ROOM_STATUS_META.AVAILABLE;
        return <Badge color={meta.color}>{meta.label}</Badge>;
      },
    },
    {
      header: 'Actions',
      key: 'actions',
      className: 'text-right',
      render: (room) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleToggleStatus(room)}
            title={room.status === 'MAINTENANCE' ? 'Set Available' : 'Set Under Maintenance'}
          >
            {room.status === 'MAINTENANCE' ? (
              <CircleCheck className="h-4 w-4 text-emerald-600" />
            ) : (
              <Wrench className="h-4 w-4 text-amber-600" />
            )}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => openEdit(room)} title="Edit room">
            <Pencil className="h-4 w-4 text-slate-600" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDeleteTarget(room)}
            title="Deactivate room"
            disabled={room.status === 'INACTIVE'}
          >
            <Archive className="h-4 w-4 text-rose-600" />
          </Button>
        </div>
      ),
    },
  ];

  const counts = {
    ALL: rooms.length,
    AVAILABLE: rooms.filter((r) => r.status === 'AVAILABLE').length,
    OCCUPIED: rooms.filter((r) => r.status === 'OCCUPIED').length,
    MAINTENANCE: rooms.filter((r) => r.status === 'MAINTENANCE').length,
    INACTIVE: rooms.filter((r) => r.status === 'INACTIVE').length,
  };

  const filteredRooms = rooms.filter((r) => {
    if (!statusFilter) return true;
    return (r.status || '').toUpperCase() === statusFilter.toUpperCase();
  });

  return (
    <>
      <PageHeader
        title="Rooms"
        description="Configure room inventory, operational statuses, and rates."
        actions={
          <Button onClick={openCreate} size="sm">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add room
          </Button>
        }
      />

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Filter:</span>
        {[
          { key: '', label: 'All Rooms', count: counts.ALL, countColor: 'bg-slate-100 text-slate-800' },
          { key: 'AVAILABLE', label: 'Available', count: counts.AVAILABLE, countColor: 'bg-emerald-100 text-emerald-800' },
          { key: 'OCCUPIED', label: 'Occupied', count: counts.OCCUPIED, countColor: 'bg-violet-100 text-violet-800' },
          { key: 'MAINTENANCE', label: 'Maintenance', count: counts.MAINTENANCE, countColor: 'bg-amber-100 text-amber-800' },
          { key: 'INACTIVE', label: 'Inactive', count: counts.INACTIVE, countColor: 'bg-rose-100 text-rose-800' },
        ].map((filter) => {
          const isActive = statusFilter === filter.key;
          return (
            <button
              key={filter.key}
              type="button"
              onClick={() => setStatusFilter(filter.key)}
              className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span>{filter.label}</span>
              <span
                className={`rounded-full px-1.5 py-0.5 text-[11px] font-bold ${
                  isActive ? 'bg-white/20 text-white' : filter.countColor
                }`}
              >
                {filter.count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-6">
        <Table columns={columns} data={filteredRooms} loading={loading} emptyMessage="No rooms found matching status filter." />
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? `Edit Room ${editing.room_number}` : 'Add New Room to Inventory'}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 1. Room Type Selection with Dynamic Information Preview */}
          <div>
            <Field
              label="Room Type"
              name="roomTypeId"
              as="select"
              value={form.roomTypeId}
              onChange={handleChange}
              required
            >
              {roomTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name} — {formatCurrency(type.base_price)} / night ({type.capacity} Guests)
                </option>
              ))}
            </Field>

            {/* Dynamic Room Type Information Card */}
            {(() => {
              const selectedType = roomTypes.find((t) => String(t.id) === String(form.roomTypeId)) || roomTypes[0];
              const amenities = parseAmenities(selectedType?.amenities);

              if (!selectedType) return null;

              return (
                <div className="mt-2.5 rounded-xl border border-amber-200/90 bg-gradient-to-br from-amber-50/70 to-orange-50/50 p-4 text-xs">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="font-bold text-amber-900 uppercase tracking-wider text-[10px]">
                        Inherited Type Specifications
                      </span>
                      <p className="text-sm font-bold text-slate-900 mt-0.5">
                        {selectedType.name} {selectedType.bed_type && `· ${selectedType.bed_type}`}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-sm font-bold text-amber-700">
                        {formatCurrency(selectedType.base_price)}
                      </span>
                      <span className="text-slate-500"> / night</span>
                      <p className="text-slate-500 font-medium mt-0.5">Max {selectedType.capacity} Guests</p>
                    </div>
                  </div>

                  {selectedType.description && (
                    <p className="mt-2 text-slate-600 leading-relaxed">
                      {selectedType.description}
                    </p>
                  )}

                  {amenities.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-amber-200/60">
                      <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                        Included Standard Amenities:
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {amenities.map((amenity) => (
                          <span
                            key={amenity}
                            className="inline-flex items-center rounded-md bg-white/90 border border-amber-200 px-2 py-0.5 text-[11px] font-medium text-amber-950 shadow-2xs"
                          >
                            ✓ {amenity}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>

          {/* 2. Room Specific Unique Data */}
          <div className="pt-2 border-t border-slate-100">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Room-Specific Information
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field
                label="Room Number"
                name="roomNumber"
                value={form.roomNumber}
                onChange={handleChange}
                placeholder="e.g. 401"
                required
              />

              <Field
                label="Floor"
                name="floor"
                as="select"
                value={form.floor}
                onChange={handleChange}
                required
              >
                {['1', '2', '3', '4', '5', '6', '7', '8'].map((f) => (
                  <option key={f} value={f}>
                    Floor {f}
                  </option>
                ))}
              </Field>
            </div>

            <div className="mt-4">
              <Field
                label="Initial Operational Status"
                name="status"
                as="select"
                value={form.status}
                onChange={handleChange}
              >
                <option value="AVAILABLE">AVAILABLE — Ready for guest booking & check-in</option>
                <option value="MAINTENANCE">MAINTENANCE — Under repair / cleaning</option>
                <option value="INACTIVE">INACTIVE — Temporarily out of service</option>
                {editing && <option value="OCCUPIED">OCCUPIED — Guest currently checked in</option>}
              </Field>
            </div>

            <div className="mt-4">
              <Field
                label="Room View & Specific Features (Optional)"
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="e.g. Corner room with sunrise view, extra wide work desk, near elevator"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={submit}>
              {editing ? 'Save changes' : 'Add Room to Inventory'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeactivate}
        title="Deactivate Room?"
        message={
          deleteTarget
            ? `Room ${deleteTarget.room_number} will be marked inactive and removed from public availability.`
            : ''
        }
        confirmLabel="Deactivate"
      />
    </>
  );
}
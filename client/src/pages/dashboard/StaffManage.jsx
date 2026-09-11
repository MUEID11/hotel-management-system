import { useEffect, useState } from 'react';
import { Plus, Ban, UserCheck } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Button from '../../components/common/Button.jsx';
import Badge from '../../components/common/Badge.jsx';
import Table from '../../components/common/Table.jsx';
import Modal from '../../components/common/Modal.jsx';
import Field from '../../components/common/Field.jsx';
import ConfirmDialog from '../../components/common/ConfirmDialog.jsx';
import { useNotification } from '../../context/NotificationContext.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import {
  createStaffAccount,
  deactivateStaffAccount,
  fetchStaffList,
} from '../../services/reportService.js';
import { formatDate, formatGuestName } from '../../utils/format.js';

export default function StaffManage() {
  const notify = useNotification();
  const { user } = useAuth();
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submit, setSubmit] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ email: '', password: '', role: 'RECEPTIONIST', firstName: '', lastName: '', phone: '', position: '' });

  const [deactivateTarget, setDeactivateTarget] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchStaffList();
      setStaff(Array.isArray(data) ? data : []);
    } catch (err) {
      notify.error(err.message ?? 'Unable to load staff.');
      setStaff([]);
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

  const handleCreate = async (event) => {
    event.preventDefault();
    setSubmit(true);
    try {
      await createStaffAccount(form);
      notify.success('Staff account created.');
      setModalOpen(false);
      setForm({ email: '', password: '', role: 'RECEPTIONIST', firstName: '', lastName: '', phone: '', position: '' });
      await load();
    } catch (err) {
      notify.error(err.message ?? 'Unable to create staff account.');
    } finally {
      setSubmit(false);
    }
  };

  const handleDeactivate = async () => {
    if (!deactivateTarget) return;
    try {
      await deactivateStaffAccount(deactivateTarget.user_id);
      notify.success('Staff account deactivated.');
      setDeactivateTarget(null);
      await load();
    } catch (err) {
      notify.error(err.message ?? 'Unable to deactivate staff account.');
    }
  };

  const columns = [
    {
      key: 'name',
      header: 'Staff member',
      render: (row) => (
        <div>
          <p className="font-semibold text-slate-900">{formatGuestName(row.first_name, row.last_name)}</p>
          <p className="text-xs text-slate-500">{row.email}</p>
        </div>
      ),
    },
    {
      key: 'role_name',
      header: 'Role',
      render: (row) => (
        row.role_name === 'ADMIN' ? (
          <Badge color="bg-violet-100 text-violet-700 ring-violet-600/20">Administrator</Badge>
        ) : (
          <Badge color="bg-sky-100 text-sky-700 ring-sky-600/20">Front Desk</Badge>
        )
      ),
    },
    { key: 'position', header: 'Position', render: (row) => row.position ?? '—' },
    { key: 'phone', header: 'Phone', render: (row) => row.phone ?? '—' },
    { key: 'hire_date', header: 'Hired', render: (row) => formatDate(row.hire_date) },
    {
      key: 'staff_is_active',
      header: 'Status',
      render: (row) => (
        row.staff_is_active ? (
          <Badge color="bg-emerald-100 text-emerald-700 ring-emerald-600/20">Active</Badge>
        ) : (
          <Badge color="bg-rose-100 text-rose-700 ring-rose-600/20">Deactivated</Badge>
        )
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Staff"
        description="Front desk and administrator accounts."
        actions={<Button onClick={() => setModalOpen(true)}><Plus className="h-4 w-4" aria-hidden="true" /> Add staff</Button>}
      />

      <Table
        columns={columns}
        data={staff}
        loading={loading}
        rowKey="user_id"
        emptyTitle="No staff yet"
        emptyMessage="Add your first front desk member to get started."
        actions={(row) => row.staff_is_active ? (
          <Button
            variant="danger"
            size="xs"
            onClick={() => setDeactivateTarget(row)}
            disabled={row.user_id === user?.userId}
            title={row.user_id === user?.userId ? 'You cannot deactivate your own account' : undefined}
          >
            <Ban className="h-3.5 w-3.5" aria-hidden="true" /> Deactivate
          </Button>
        ) : (
          <Badge color="bg-slate-100 text-slate-500 ring-slate-400/30">
            <UserCheck className="mr-1 h-3.5 w-3.5" aria-hidden="true" /> Inactive
          </Badge>
        )}
      />

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Create staff account"
        size="md"
      >
        <form onSubmit={handleCreate} className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="First name" name="firstName" required value={form.firstName} onChange={handleChange} />
            <Field label="Last name" name="lastName" required value={form.lastName} onChange={handleChange} />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Email address" name="email" type="email" required value={form.email} onChange={handleChange} />
            <Field label="Password" name="password" type="password" required hint="At least 8 characters." value={form.password} onChange={handleChange} />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              label="Role"
              name="role"
              as="select"
              required
              value={form.role}
              onChange={handleChange}
              options={[{ value: 'RECEPTIONIST', label: 'Front Desk (Receptionist)' }, { value: 'ADMIN', label: 'Administrator' }]}
            />
            <Field
              label="Position"
              name="position"
              placeholder="e.g. Front Desk Manager"
              value={form.position}
              onChange={handleChange}
            />
          </div>
          <Field label="Phone" name="phone" type="tel" value={form.phone} onChange={handleChange} />
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={submit}>Create account</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deactivateTarget)}
        onClose={() => setDeactivateTarget(null)}
        onConfirm={handleDeactivate}
        title="Deactivate staff account?"
        message={deactivateTarget ? `${deactivateTarget.first_name} ${deactivateTarget.last_name} will lose access to this portal.` : ''}
        confirmLabel="Deactivate"
      />
    </>
  );
}
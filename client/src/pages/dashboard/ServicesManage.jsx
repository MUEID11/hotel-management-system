import { useEffect, useState } from 'react';
import {
  Plus,
  Pencil,
  ShoppingCart,
  CheckCircle2,
  Clock,
  Check,
  RefreshCw,
  BellRing,
  BookOpen,
  Filter,
  Wrench,
  AlertCircle,
  MessageSquare,
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Button from '../../components/common/Button.jsx';
import Badge from '../../components/common/Badge.jsx';
import Table from '../../components/common/Table.jsx';
import Modal from '../../components/common/Modal.jsx';
import Field from '../../components/common/Field.jsx';
import { useNotification } from '../../context/NotificationContext.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import {
  createService,
  fetchAllServiceOrders,
  fetchServices,
  placeServiceOrder,
  updateService,
  updateServiceOrderStatus,
} from '../../services/serviceService.js';
import { fetchIssues, updateIssueStatus } from '../../services/issueService.js';
import { fetchActiveReservations } from '../../services/reservationService.js';
import { formatCurrency, formatGuestName } from '../../utils/format.js';

const EMPTY_FORM = { name: '', description: '', price: '' };

const CATEGORY_NAMES = {
  AC_HEATING: 'Air Conditioning & Heating',
  PLUMBING: 'Plumbing & Water',
  ELECTRICAL: 'Lighting & Electrical',
  CLEANLINESS: 'Housekeeping & Cleaning',
  WIFI_TECH: 'Wi-Fi & Entertainment',
  OTHER: 'General Room Issue',
};

export default function ServicesManage() {
  const notify = useNotification();
  const { isAdmin } = useAuth();

  // Tab: 'orders' (Live Orders) | 'issues' (Room Issues) | 'catalog' (Amenity list)
  const [activeTab, setActiveTab] = useState('orders');

  // Service Catalog state
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Live Orders state
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [orderFilter, setOrderFilter] = useState('ALL'); // 'ALL' | 'PENDING' | 'DELIVERED'
  const [statusUpdating, setStatusUpdating] = useState(null);

  // Room Issues state
  const [issues, setIssues] = useState([]);
  const [issuesLoading, setIssuesLoading] = useState(true);
  const [issueFilter, setIssueFilter] = useState('ALL'); // 'ALL' | 'OPEN' | 'IN_PROGRESS' | 'RESOLVED'
  const [issueUpdating, setIssueUpdating] = useState(null);
  const [resolveTarget, setResolveTarget] = useState(null);
  const [resolveNote, setResolveNote] = useState('');

  const [activeReservations, setActiveReservations] = useState([]);
  const [submit, setSubmit] = useState(false);

  // Edit / Create modal state
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  // Place order modal state
  const [orderOpen, setOrderOpen] = useState(false);
  const [orderForm, setOrderForm] = useState({ reservationId: '', serviceId: '', quantity: '1' });

  const loadServices = async () => {
    setLoading(true);
    try {
      const data = await fetchServices(true);
      setServices(Array.isArray(data) ? data : []);
    } catch (err) {
      notify.error(err.message ?? 'Unable to load services.');
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  const loadOrders = async () => {
    setOrdersLoading(true);
    try {
      const data = await fetchAllServiceOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      notify.error(err.message ?? 'Unable to load service orders.');
      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  };

  const loadIssues = async () => {
    setIssuesLoading(true);
    try {
      const data = await fetchIssues();
      setIssues(Array.isArray(data) ? data : []);
    } catch (err) {
      notify.error(err.message ?? 'Unable to load room issues.');
      setIssues([]);
    } finally {
      setIssuesLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
    loadServices();
    loadIssues();
    fetchActiveReservations()
      .then((data) => setActiveReservations(data ?? []))
      .catch(() => setActiveReservations([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setEditOpen(true);
  };

  const openEdit = (service) => {
    setEditing(service);
    setForm({ name: service.name, description: service.description ?? '', price: String(service.price) });
    setEditOpen(true);
  };

  const openOrder = () => {
    setOrderForm({
      reservationId: activeReservations[0]?.id ?? '',
      serviceId: services[0]?.id ? String(services[0].id) : '',
      quantity: '1',
    });
    setOrderOpen(true);
  };

  const openOrderForService = (service) => {
    setOrderForm({
      reservationId: activeReservations[0]?.id ?? '',
      serviceId: String(service.id),
      quantity: '1',
    });
    setOrderOpen(true);
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setSubmit(true);
    try {
      if (editing) {
        await updateService(editing.id, {
          description: form.description,
          price: Number(form.price),
          isActive: editing.is_active ?? 1,
        });
        notify.success('Service updated.');
      } else {
        await createService({
          name: form.name,
          description: form.description,
          price: Number(form.price),
        });
        notify.success('Service created.');
      }
      setEditOpen(false);
      await loadServices();
    } catch (err) {
      notify.error(err.message ?? 'Unable to save service.');
    } finally {
      setSubmit(false);
    }
  };

  const handleOrder = async (event) => {
    event.preventDefault();
    setSubmit(true);
    try {
      await placeServiceOrder({
        reservationId: Number(orderForm.reservationId),
        serviceId: Number(orderForm.serviceId),
        quantity: Number(orderForm.quantity),
      });
      notify.success('Service order placed and added to guest folio.');
      setOrderOpen(false);
      await loadOrders();
      setActiveTab('orders');
    } catch (err) {
      notify.error(err.message ?? 'Unable to place the service order.');
    } finally {
      setSubmit(false);
    }
  };

  const handleToggleStatus = async (order, newStatus) => {
    setStatusUpdating(order.id);
    try {
      await updateServiceOrderStatus(order.id, newStatus);
      notify.success(
        newStatus === 'DELIVERED'
          ? `Order #${order.id} for Room ${order.room_number} marked as Done!`
          : `Order #${order.id} reopened as Waiting.`
      );
      await loadOrders();
    } catch (err) {
      notify.error(err.message ?? 'Unable to update order status.');
    } finally {
      setStatusUpdating(null);
    }
  };

  const handleUpdateIssue = async (issue, targetStatus, notes = null) => {
    setIssueUpdating(issue.id);
    try {
      await updateIssueStatus(issue.id, targetStatus, notes);
      notify.success(
        targetStatus === 'RESOLVED'
          ? `Issue #${issue.id} (Room ${issue.room_number}) marked as Resolved!`
          : `Issue #${issue.id} marked as In Progress.`
      );
      setResolveTarget(null);
      setResolveNote('');
      await loadIssues();
    } catch (err) {
      notify.error(err.message ?? 'Unable to update issue.');
    } finally {
      setIssueUpdating(null);
    }
  };

  // ---------------------------------------------------------------------------
  // Columns & Actions: Live Orders
  // ---------------------------------------------------------------------------
  const pendingOrdersCount = orders.filter((o) => (o.status || o.order_status) === 'PENDING').length;

  const filteredOrders = orders.filter((o) => {
    const status = (o.status || o.order_status || '').toUpperCase();
    if (orderFilter === 'ALL') return true;
    return status === orderFilter;
  });

  const orderColumns = [
    {
      key: 'order_id',
      header: 'Order #',
      render: (row) => <span className="font-semibold text-slate-900">#{row.id || row.order_id}</span>,
    },
    {
      key: 'room_number',
      header: 'Room',
      render: (row) => (
        <span className="inline-flex items-center rounded-md bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-900 ring-1 ring-inset ring-amber-500/20">
          Room {row.room_number}
        </span>
      ),
    },
    {
      key: 'guest_name',
      header: 'Guest',
      render: (row) => (
        <span className="font-medium text-slate-800">{formatGuestName(row.guest_name)}</span>
      ),
    },
    {
      key: 'service_name',
      header: 'Service Requested',
      render: (row) => (
        <div>
          <span className="font-semibold text-slate-900">{row.service_name}</span>
          <span className="ml-2 inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
            Qty: {row.quantity}
          </span>
        </div>
      ),
    },
    {
      key: 'total_amount',
      header: 'Billed',
      render: (row) => (
        <span className="font-semibold text-slate-900">{formatCurrency(row.total_amount)}</span>
      ),
    },
    {
      key: 'order_date',
      header: 'Requested At',
      render: (row) => {
        const date = new Date(row.order_date);
        return (
          <span className="text-xs text-slate-500">
            {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {date.toLocaleDateString()}
          </span>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => {
        const status = (row.status || row.order_status || 'PENDING').toUpperCase();
        if (status === 'PENDING') {
          return (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800 ring-1 ring-inset ring-amber-600/20">
              <Clock className="h-3.5 w-3.5 text-amber-600" /> Waiting
            </span>
          );
        }
        if (status === 'DELIVERED') {
          return (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800 ring-1 ring-inset ring-emerald-600/20">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Done (Delivered)
            </span>
          );
        }
        return <Badge color="bg-slate-100 text-slate-600 ring-slate-500/20">{status}</Badge>;
      },
    },
  ];

  const orderActions = (row) => {
    const status = (row.status || row.order_status || 'PENDING').toUpperCase();
    const isPending = status === 'PENDING';
    const isUpdating = statusUpdating === row.id;

    return (
      <div className="flex items-center gap-2">
        {isPending ? (
          <Button
            size="xs"
            loading={isUpdating}
            onClick={() => handleToggleStatus(row, 'DELIVERED')}
            className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
          >
            <Check className="h-3.5 w-3.5 mr-1" /> Mark Done
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="xs"
            loading={isUpdating}
            onClick={() => handleToggleStatus(row, 'PENDING')}
            className="text-slate-500 hover:text-slate-700 text-xs"
            title="Reopen order as Waiting"
          >
            <RefreshCw className="h-3 w-3 mr-1" /> Reopen
          </Button>
        )}
      </div>
    );
  };

  // ---------------------------------------------------------------------------
  // Columns & Actions: Room Issues
  // ---------------------------------------------------------------------------
  const openIssuesCount = issues.filter((i) => i.status === 'OPEN' || i.status === 'IN_PROGRESS').length;

  const filteredIssues = issues.filter((i) => {
    if (issueFilter === 'ALL') return true;
    return i.status === issueFilter;
  });

  const issueColumns = [
    {
      key: 'id',
      header: 'Ticket #',
      render: (row) => <span className="font-semibold text-slate-900">#{row.id}</span>,
    },
    {
      key: 'room_number',
      header: 'Room',
      render: (row) => (
        <span className="inline-flex items-center rounded-md bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-900 ring-1 ring-inset ring-rose-500/20">
          Room {row.room_number}
        </span>
      ),
    },
    {
      key: 'guest_name',
      header: 'Reported By',
      render: (row) => (
        <div>
          <span className="font-medium text-slate-800">{formatGuestName(row.guest_name)}</span>
          {row.guest_phone && <p className="text-[11px] text-slate-400">{row.guest_phone}</p>}
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category & Priority',
      render: (row) => {
        const priorityColors = {
          URGENT: 'bg-rose-100 text-rose-800 border-rose-300',
          HIGH: 'bg-orange-100 text-orange-800 border-orange-300',
          MEDIUM: 'bg-amber-100 text-amber-800 border-amber-300',
          LOW: 'bg-slate-100 text-slate-700 border-slate-300',
        };
        return (
          <div>
            <p className="font-semibold text-slate-900 text-xs">
              {CATEGORY_NAMES[row.category] || row.category}
            </p>
            <span className={`mt-0.5 inline-block rounded border px-1.5 py-0.2 text-[10px] font-bold uppercase ${priorityColors[row.priority] || priorityColors.MEDIUM}`}>
              {row.priority}
            </span>
          </div>
        );
      },
    },
    {
      key: 'description',
      header: 'Problem Description',
      render: (row) => (
        <div className="max-w-xs">
          <p className="text-xs text-slate-700 line-clamp-2">{row.description}</p>
          {row.resolution_notes && (
            <p className="mt-1 text-[11px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
              <strong>Fixed:</strong> {row.resolution_notes}
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'created_at',
      header: 'Reported At',
      render: (row) => {
        const date = new Date(row.created_at);
        return (
          <span className="text-xs text-slate-500">
            {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {date.toLocaleDateString()}
          </span>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => {
        const status = (row.status || 'OPEN').toUpperCase();
        if (status === 'OPEN') {
          return (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800 ring-1 ring-inset ring-amber-600/20">
              <Clock className="h-3.5 w-3.5 text-amber-600" /> Open / Waiting
            </span>
          );
        }
        if (status === 'IN_PROGRESS') {
          return (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-100 px-2.5 py-1 text-xs font-semibold text-sky-800 ring-1 ring-inset ring-sky-600/20">
              <Wrench className="h-3.5 w-3.5 text-sky-600" /> In Progress
            </span>
          );
        }
        if (status === 'RESOLVED') {
          return (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800 ring-1 ring-inset ring-emerald-600/20">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Resolved
            </span>
          );
        }
        return <Badge color="bg-slate-100 text-slate-600 ring-slate-500/20">{status}</Badge>;
      },
    },
  ];

  const issueActions = (row) => {
    const isUpdating = issueUpdating === row.id;
    if (row.status === 'OPEN') {
      return (
        <Button
          size="xs"
          loading={isUpdating}
          onClick={() => handleUpdateIssue(row, 'IN_PROGRESS')}
          className="bg-sky-600 hover:bg-sky-700 text-white text-xs shadow-sm"
        >
          <Wrench className="h-3.5 w-3.5 mr-1" /> Start Fix
        </Button>
      );
    }
    if (row.status === 'IN_PROGRESS') {
      return (
        <Button
          size="xs"
          loading={isUpdating}
          onClick={() => {
            setResolveTarget(row);
            setResolveNote('');
          }}
          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs shadow-sm"
        >
          <Check className="h-3.5 w-3.5 mr-1" /> Resolve
        </Button>
      );
    }
    return (
      <Button
        variant="ghost"
        size="xs"
        loading={isUpdating}
        onClick={() => handleUpdateIssue(row, 'IN_PROGRESS')}
        className="text-slate-500 hover:text-slate-700 text-xs"
        title="Reopen issue"
      >
        <RefreshCw className="h-3 w-3 mr-1" /> Reopen
      </Button>
    );
  };

  // ---------------------------------------------------------------------------
  // Columns & Actions: Service Catalog
  // ---------------------------------------------------------------------------
  const catalogColumns = [
    { key: 'name', header: 'Service', render: (row) => <span className="font-semibold text-slate-900">{row.name}</span> },
    { key: 'description', header: 'Description', render: (row) => row.description ?? '—' },
    { key: 'price', header: 'Price', render: (row) => formatCurrency(row.price) },
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

  const catalogActions = (row) => (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="xs"
        onClick={() => openOrderForService(row)}
        className="text-amber-800 hover:text-amber-900 border-amber-300 hover:bg-amber-50"
      >
        <ShoppingCart className="h-3.5 w-3.5 mr-1 text-amber-600" /> Order for Room
      </Button>
      {isAdmin && (
        <Button variant="outline" size="xs" onClick={() => openEdit(row)}>
          <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
        </Button>
      )}
    </div>
  );

  return (
    <>
      <PageHeader
        title="Services & Guest Assistance"
        description="Fulfill in-stay guest service orders, resolve reported room problems, and manage amenity rates."
        actions={
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={openOrder}>
              <ShoppingCart className="h-4 w-4" aria-hidden="true" /> Place order
            </Button>
            {isAdmin && (
              <Button onClick={openCreate}>
                <Plus className="h-4 w-4" aria-hidden="true" /> Add service
              </Button>
            )}
          </div>
        }
      />

      {/* Tab Navigation */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Tab 1: Live Service Orders */}
          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
              activeTab === 'orders'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <BellRing className="h-4 w-4" />
            <span>Live Service Orders</span>
            {pendingOrdersCount > 0 && (
              <span className="rounded-full bg-amber-500 px-2 py-0.5 text-xs font-bold text-white">
                {pendingOrdersCount} waiting
              </span>
            )}
          </button>

          {/* Tab 2: Room Issues */}
          <button
            type="button"
            onClick={() => setActiveTab('issues')}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
              activeTab === 'issues'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Wrench className="h-4 w-4" />
            <span>Reported Room Problems</span>
            {openIssuesCount > 0 && (
              <span className="rounded-full bg-rose-500 px-2 py-0.5 text-xs font-bold text-white">
                {openIssuesCount} open
              </span>
            )}
          </button>

          {/* Tab 3: Catalog */}
          <button
            type="button"
            onClick={() => setActiveTab('catalog')}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
              activeTab === 'catalog'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <BookOpen className="h-4 w-4" />
            <span>Service Catalog</span>
            <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs text-slate-700">
              {services.length}
            </span>
          </button>
        </div>

        {/* Filter Controls for Orders */}
        {activeTab === 'orders' && (
          <div className="flex items-center gap-1.5 text-xs">
            <Filter className="h-3.5 w-3.5 text-slate-400 mr-1" />
            {[
              { id: 'ALL', label: 'All Orders' },
              { id: 'PENDING', label: `Waiting (${pendingOrdersCount})` },
              { id: 'DELIVERED', label: 'Done' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setOrderFilter(tab.id)}
                className={`rounded-md px-2.5 py-1 font-medium transition-colors ${
                  orderFilter === tab.id
                    ? 'bg-amber-100 text-amber-900 font-semibold ring-1 ring-amber-400/40'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {/* Filter Controls for Issues */}
        {activeTab === 'issues' && (
          <div className="flex items-center gap-1.5 text-xs">
            <Filter className="h-3.5 w-3.5 text-slate-400 mr-1" />
            {[
              { id: 'ALL', label: 'All Tickets' },
              { id: 'OPEN', label: 'Waiting' },
              { id: 'IN_PROGRESS', label: 'In Progress' },
              { id: 'RESOLVED', label: 'Resolved' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setIssueFilter(tab.id)}
                className={`rounded-md px-2.5 py-1 font-medium transition-colors ${
                  issueFilter === tab.id
                    ? 'bg-rose-100 text-rose-900 font-semibold ring-1 ring-rose-400/40'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Tab View */}
      {activeTab === 'orders' && (
        <Table
          columns={orderColumns}
          data={filteredOrders}
          loading={ordersLoading}
          rowKey="id"
          emptyTitle="No service orders waiting"
          emptyMessage={
            orderFilter === 'PENDING'
              ? '🌟 Great service! Keep up the good work — all guest service orders have been fulfilled!'
              : 'No service orders found. Click "Place order" to bill an amenity to an active guest room.'
          }
          actions={orderActions}
        />
      )}

      {activeTab === 'issues' && (
        <Table
          columns={issueColumns}
          data={filteredIssues}
          loading={issuesLoading}
          rowKey="id"
          emptyTitle="No room problems reported"
          emptyMessage={
            issueFilter === 'OPEN'
              ? '🌟 All clear! No open room maintenance issues reported by guests.'
              : 'No reported problems found under this filter.'
          }
          actions={issueActions}
        />
      )}

      {activeTab === 'catalog' && (
        <Table
          columns={catalogColumns}
          data={services}
          loading={loading}
          rowKey="id"
          emptyTitle="No services in catalog"
          emptyMessage="Add amenities like room service or laundry to offer on stays."
          actions={catalogActions}
        />
      )}

      {/* Resolve Issue Notes Modal */}
      <Modal
        open={Boolean(resolveTarget)}
        onClose={() => setResolveTarget(null)}
        title={resolveTarget ? `Resolve Problem · Room ${resolveTarget.room_number}` : 'Resolve Problem'}
        description="Add optional resolution notes to inform the guest of what was fixed."
        size="md"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleUpdateIssue(resolveTarget, 'RESOLVED', resolveNote);
          }}
          className="space-y-4"
        >
          <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-700 border border-slate-200">
            <p className="font-semibold text-slate-900">
              {CATEGORY_NAMES[resolveTarget?.category] || resolveTarget?.category}
            </p>
            <p className="mt-1 text-slate-600">{resolveTarget?.description}</p>
          </div>

          <Field
            label="Resolution details / Notes"
            name="notes"
            as="textarea"
            rows="3"
            placeholder="e.g. AC thermostat reset and filters cleaned. Heating restored."
            value={resolveNote}
            onChange={(e) => setResolveNote(e.target.value)}
          />

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="secondary" type="button" onClick={() => setResolveTarget(null)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white">
              <Check className="h-4 w-4 mr-1.5" /> Mark as Resolved
            </Button>
          </div>
        </form>
      </Modal>

      {/* Create / Edit Service Modal */}
      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title={editing ? 'Edit service' : 'New service'}
        size="md"
      >
        <form onSubmit={handleSave} className="space-y-5">
          <Field
            label="Service name"
            name="name"
            disabled={Boolean(editing)}
            required
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
          />
          <Field
            label="Price"
            name="price"
            type="number"
            min="0"
            step="0.01"
            required
            value={form.price}
            onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))}
          />
          <Field
            label="Description"
            name="description"
            as="textarea"
            value={form.description}
            onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
          />
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button type="submit" loading={submit}>{editing ? 'Save changes' : 'Create service'}</Button>
          </div>
        </form>
      </Modal>

      {/* Place Order Modal */}
      <Modal
        open={orderOpen}
        onClose={() => setOrderOpen(false)}
        title="Place a service order"
        description="Bill the service to a currently active reservation."
        size="md"
      >
        <form onSubmit={handleOrder} className="space-y-5">
          <Field
            label="Reservation / Room"
            name="reservationId"
            as="select"
            required
            value={orderForm.reservationId}
            onChange={(event) => setOrderForm((current) => ({ ...current, reservationId: event.target.value }))}
            options={activeReservations.map((reservation) => ({
              value: reservation.id,
              label: `#${reservation.id} · ${formatGuestName(reservation.guest_name || `${reservation.first_name || ''} ${reservation.last_name || ''}`)} · Room ${reservation.room_number}`,
            }))}
          />
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              label="Service"
              name="serviceId"
              as="select"
              required
              value={orderForm.serviceId}
              onChange={(event) => setOrderForm((current) => ({ ...current, serviceId: event.target.value }))}
              options={services.map((service) => ({
                value: service.id,
                label: `${service.name} (${formatCurrency(service.price)})`,
              }))}
            />
            <Field
              label="Quantity"
              name="quantity"
              type="number"
              min="1"
              required
              value={orderForm.quantity}
              onChange={(event) => setOrderForm((current) => ({ ...current, quantity: event.target.value }))}
            />
          </div>
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setOrderOpen(false)}>Cancel</Button>
            <Button type="submit" loading={submit}>
              <ShoppingCart className="h-4 w-4" aria-hidden="true" /> Place order
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
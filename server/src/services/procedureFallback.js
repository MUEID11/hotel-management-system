// In-memory fallback dataset for when local MySQL instance is not running.
// If MySQL is started and accessible, procedureRunner.js runs CALL sp_name() directly.

const ROLES = {
  1: 'ADMIN',
  2: 'RECEPTIONIST',
  3: 'GUEST',
};

// Default password is 'admin12345' for all seed accounts
// Hash generated with bcryptjs for 'admin12345'
const DEFAULT_SEED_HASH = '$2a$10$3ybzWRXzu0uViPNJXsBPaOdGBTiMWIV9h8s6MfYQomgT.iy9Mnjjm';

const users = [
  { id: 1, email: 'admin@hotel.com', password_hash: DEFAULT_SEED_HASH, role_id: 1, is_active: 1, created_at: new Date().toISOString() },
  { id: 2, email: 'front@hotel.com', password_hash: DEFAULT_SEED_HASH, role_id: 2, is_active: 1, created_at: new Date().toISOString() },
  { id: 3, email: 'guest@hotel.com', password_hash: DEFAULT_SEED_HASH, role_id: 3, is_active: 1, created_at: new Date().toISOString() },
  { id: 4, email: 'guest2@hotel.com', password_hash: DEFAULT_SEED_HASH, role_id: 3, is_active: 1, created_at: new Date().toISOString() },
];

const staff = [
  { id: 1, user_id: 1, first_name: 'Sofia', last_name: 'Martinez', phone: '+1 555 0101', position: 'General Manager', hire_date: '2023-01-15', is_active: 1 },
  { id: 2, user_id: 2, first_name: 'Daniel', last_name: 'Okafor', phone: '+1 555 0102', position: 'Front Desk Agent', hire_date: '2024-03-01', is_active: 1 },
];

const guests = [
  { id: 1, user_id: 3, first_name: 'Amelia', last_name: 'Chen', phone: '+1 555 0201', id_card: 'P-88231' },
  { id: 2, user_id: 4, first_name: 'Lucas', last_name: 'Nguyen', phone: '+1 555 0202', id_card: 'P-44719' },
];

const roomTypes = [
  {
    id: 1,
    room_type_id: 1,
    name: 'Standard',
    description: 'Comfortable room with a queen bed, city view and essential amenities.',
    base_price: 2000.00,
    capacity: 2,
    bed_type: 'Queen Bed',
    image_url: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=1200&auto=format&fit=crop',
    amenities: '["Wi-Fi","AC","Smart TV","Work Desk","Breakfast"]',
    is_active: 1,
  },
  {
    id: 2,
    room_type_id: 2,
    name: 'Deluxe',
    description: 'Spacious room with a king bed, seating area and premium bathroom.',
    base_price: 3500.00,
    capacity: 3,
    bed_type: 'King Bed',
    image_url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1200&auto=format&fit=crop',
    amenities: '["Wi-Fi","AC","Smart TV","Mini Bar","Work Desk","Breakfast"]',
    is_active: 1,
  },
  {
    id: 3,
    room_type_id: 3,
    name: 'Ocean View',
    description: 'Breathtaking ocean views with private balcony and king-size bed.',
    base_price: 5000.00,
    capacity: 3,
    bed_type: 'King Bed',
    image_url: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=80&w=1200&auto=format&fit=crop',
    amenities: '["Wi-Fi","AC","Balcony","Smart TV","Mini Bar","Breakfast"]',
    is_active: 1,
  },
  {
    id: 4,
    room_type_id: 4,
    name: 'Executive Suite',
    description: 'Two-room suite with separate living area and butler service.',
    base_price: 7000.00,
    capacity: 4,
    bed_type: '2 King Beds',
    image_url: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=1200&auto=format&fit=crop',
    amenities: '["Wi-Fi","AC","Living Room","Bathtub","Mini Bar","Breakfast","Lounge Access"]',
    is_active: 1,
  },
  {
    id: 5,
    room_type_id: 5,
    name: 'Presidential',
    description: 'The finest accommodation with panoramic views and concierge.',
    base_price: 9000.00,
    capacity: 4,
    bed_type: 'King Bed + Balcony Jacuzzi',
    image_url: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=1200&auto=format&fit=crop',
    amenities: '["Wi-Fi","AC","Living Room","Kitchen","Jacuzzi","Butler","Breakfast"]',
    is_active: 1,
  },
];

const rooms = [
  { id: 1, room_id: 1, room_number: '101', room_type_id: 1, room_type_name: 'Standard', floor: 1, status: 'AVAILABLE', description: 'City view standard room', base_price: 2000.00, capacity: 2 },
  { id: 2, room_id: 2, room_number: '102', room_type_id: 1, room_type_name: 'Standard', floor: 1, status: 'AVAILABLE', description: 'City view standard room', base_price: 2000.00, capacity: 2 },
  { id: 3, room_id: 3, room_number: '103', room_type_id: 1, room_type_name: 'Standard', floor: 1, status: 'AVAILABLE', description: 'City view standard room', base_price: 2000.00, capacity: 2 },
  { id: 4, room_id: 4, room_number: '104', room_type_id: 2, room_type_name: 'Deluxe', floor: 1, status: 'AVAILABLE', description: 'King bed deluxe room', base_price: 3500.00, capacity: 3 },
  { id: 5, room_id: 5, room_number: '105', room_type_id: 2, room_type_name: 'Deluxe', floor: 1, status: 'AVAILABLE', description: 'King bed deluxe room', base_price: 3500.00, capacity: 3 },
  { id: 6, room_id: 6, room_number: '201', room_type_id: 3, room_type_name: 'Ocean View', floor: 2, status: 'AVAILABLE', description: 'Ocean view with balcony', base_price: 5000.00, capacity: 3 },
  { id: 7, room_id: 7, room_number: '202', room_type_id: 3, room_type_name: 'Ocean View', floor: 2, status: 'OCCUPIED', description: 'Ocean view with balcony', base_price: 5000.00, capacity: 3 },
  { id: 8, room_id: 8, room_number: '203', room_type_id: 3, room_type_name: 'Ocean View', floor: 2, status: 'AVAILABLE', description: 'Ocean view with balcony', base_price: 5000.00, capacity: 3 },
  { id: 9, room_id: 9, room_number: '204', room_type_id: 4, room_type_name: 'Executive Suite', floor: 2, status: 'AVAILABLE', description: 'Executive suite with living room', base_price: 7000.00, capacity: 4 },
  { id: 10, room_id: 10, room_number: '205', room_type_id: 4, room_type_name: 'Executive Suite', floor: 2, status: 'AVAILABLE', description: 'Executive suite with living room', base_price: 7000.00, capacity: 4 },
  { id: 11, room_id: 11, room_number: '301', room_type_id: 1, room_type_name: 'Standard', floor: 3, status: 'AVAILABLE', description: 'Quiet floor standard room', base_price: 2000.00, capacity: 2 },
  { id: 12, room_id: 12, room_number: '302', room_type_id: 1, room_type_name: 'Standard', floor: 3, status: 'AVAILABLE', description: 'Quiet floor standard room', base_price: 2000.00, capacity: 2 },
  { id: 13, room_id: 13, room_number: '303', room_type_id: 4, room_type_name: 'Executive Suite', floor: 3, status: 'AVAILABLE', description: 'Executive suite with living room', base_price: 7000.00, capacity: 4 },
  { id: 14, room_id: 14, room_number: '304', room_type_id: 4, room_type_name: 'Executive Suite', floor: 3, status: 'AVAILABLE', description: 'Executive suite with living room', base_price: 7000.00, capacity: 4 },
  { id: 15, room_id: 15, room_number: '305', room_type_id: 5, room_type_name: 'Presidential', floor: 3, status: 'AVAILABLE', description: 'Presidential suite with panoramic view', base_price: 9000.00, capacity: 4 },
];

const services = [
  { id: 1, service_id: 1, name: 'Breakfast Buffet', description: 'Daily continental and hot breakfast buffet.', price: 500.00, is_active: 1 },
  { id: 2, service_id: 2, name: 'High-Speed Wi-Fi', description: 'Unlimited premium Wi-Fi access for the stay.', price: 200.00, is_active: 1 },
  { id: 3, service_id: 3, name: 'Airport Shuttle', description: 'Private one-way airport transfer.', price: 1500.00, is_active: 1 },
  { id: 4, service_id: 4, name: 'Spa Treatment', description: '60 minute relaxing full-body massage.', price: 2500.00, is_active: 1 },
  { id: 5, service_id: 5, name: 'Laundry Service', description: 'Same-day garment cleaning and pressing.', price: 400.00, is_active: 1 },
  { id: 6, service_id: 6, name: 'Mini Bar Restock', description: 'Complimentary mini bar restock in the evening.', price: 850.00, is_active: 1 },
];

let nextOrderId = 10;
const serviceOrders = [
  {
    id: 1,
    order_id: 1,
    reservation_id: 3, // Room 202 - Lucas Nguyen (Checked In)
    service_id: 5,
    service_name: 'Laundry Service',
    quantity: 1,
    unit_price: 400.00,
    total_amount: 400.00,
    status: 'PENDING',
    order_date: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 2,
    order_id: 2,
    reservation_id: 3, // Room 202 - Lucas Nguyen (Checked In)
    service_id: 1,
    service_name: 'Breakfast Buffet',
    quantity: 2,
    unit_price: 500.00,
    total_amount: 1000.00,
    status: 'DELIVERED',
    order_date: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 3,
    order_id: 3,
    reservation_id: 2, // Room 105 - Amelia Chen (Confirmed)
    service_id: 3,
    service_name: 'Airport Shuttle',
    quantity: 1,
    unit_price: 1500.00,
    total_amount: 1500.00,
    status: 'PENDING',
    order_date: new Date(Date.now() - 1800000).toISOString(),
  },
];

let nextIssueId = 10;
const roomIssues = [
  {
    id: 1,
    reservation_id: 3, // Room 202 - Lucas Nguyen
    room_id: 7,
    guest_id: 2,
    room_number: '202',
    room_type_name: 'Ocean View',
    guest_name: 'Lucas Nguyen',
    guest_phone: '+1 555 0202',
    category: 'AC_HEATING',
    priority: 'HIGH',
    description: 'Air conditioning temperature control not responding, blowing warm air.',
    status: 'OPEN',
    resolution_notes: null,
    created_at: new Date(Date.now() - 5400000).toISOString(),
    resolved_at: null,
  },
  {
    id: 2,
    reservation_id: 2, // Room 105 - Amelia Chen
    room_id: 5,
    guest_id: 1,
    room_number: '105',
    room_type_name: 'Deluxe',
    guest_name: 'Amelia Chen',
    guest_phone: '+1 555 0201',
    category: 'PLUMBING',
    priority: 'MEDIUM',
    description: 'Bathroom sink faucet handle is slightly loose and dripping.',
    status: 'RESOLVED',
    resolution_notes: 'Tightened cartridge and replaced washer.',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    resolved_at: new Date(Date.now() - 43200000).toISOString(),
  },
];

const reservations = [
  {
    id: 1,
    reservation_id: 1,
    guest_id: 1,
    room_id: 1,
    room_number: '101',
    room_type_name: 'Standard',
    first_name: 'Amelia',
    last_name: 'Chen',
    email: 'guest@hotel.com',
    phone: '+1 555 0201',
    check_in_date: '2026-09-08',
    check_out_date: '2026-09-09',
    status: 'CHECKED_OUT',
    total_amount: 2000.00,
    special_requests: 'Late arrival expected',
    created_at: '2026-09-07T12:00:00Z',
  },
  {
    id: 2,
    reservation_id: 2,
    guest_id: 1,
    room_id: 5,
    room_number: '105',
    room_type_name: 'Deluxe',
    first_name: 'Amelia',
    last_name: 'Chen',
    email: 'guest@hotel.com',
    phone: '+1 555 0201',
    check_in_date: '2026-09-12',
    check_out_date: '2026-09-15',
    status: 'CONFIRMED',
    total_amount: 10500.00,
    special_requests: 'High floor preferred',
    created_at: '2026-09-08T14:30:00Z',
  },
  {
    id: 3,
    reservation_id: 3,
    guest_id: 2,
    room_id: 7,
    room_number: '202',
    room_type_name: 'Ocean View',
    first_name: 'Lucas',
    last_name: 'Nguyen',
    email: 'guest2@hotel.com',
    phone: '+1 555 0202',
    check_in_date: '2026-09-09',
    check_out_date: '2026-09-12',
    status: 'CHECKED_IN',
    total_amount: 15000.00,
    special_requests: null,
    created_at: '2026-09-08T16:00:00Z',
  },
];

let nextPaymentId = 10;
const payments = [
  {
    id: 1,
    payment_id: 1,
    reservation_id: 1,
    amount: 2000.00,
    payment_method: 'CASH',
    transaction_reference: 'WALK-0001',
    payment_date: new Date(Date.now() - 86400000).toISOString(),
    received_by: 2,
    guest_name: 'Amelia Chen',
    room_number: '101',
  },
  {
    id: 2,
    payment_id: 2,
    reservation_id: 3,
    amount: 5000.00,
    payment_method: 'CARD',
    transaction_reference: 'CARD-2201',
    payment_date: new Date(Date.now() - 43200000).toISOString(),
    received_by: 2,
    guest_name: 'Lucas Nguyen',
    room_number: '202',
  },
];

let nextUserId = 100;
let nextGuestId = 100;
let nextReservationId = 50;

export function executeFallbackProcedure(procedureName, params = []) {
  switch (procedureName) {
    case 'sp_get_user_by_email': {
      const email = String(params[0] ?? '').toLowerCase().trim();
      const user = users.find((u) => u.email === email);
      if (!user) return [];
      return [
        {
          id: user.id,
          email: user.email,
          password_hash: user.password_hash,
          role_id: user.role_id,
          role_name: ROLES[user.role_id] || 'GUEST',
          is_active: user.is_active,
          created_at: user.created_at,
        },
      ];
    }

    case 'sp_get_user_by_id': {
      const userId = Number(params[0]);
      const user = users.find((u) => u.id === userId);
      if (!user) return [];
      return [
        {
          id: user.id,
          email: user.email,
          password_hash: user.password_hash,
          role_id: user.role_id,
          role_name: ROLES[user.role_id] || 'GUEST',
          is_active: user.is_active,
          created_at: user.created_at,
        },
      ];
    }

    case 'sp_get_user_profile': {
      const userId = Number(params[0]);
      const user = users.find((u) => u.id === userId);
      if (!user) return [];
      const g = guests.find((item) => item.user_id === userId);
      const s = staff.find((item) => item.user_id === userId);
      return [
        {
          user_id: user.id,
          email: user.email,
          user_is_active: user.is_active,
          role_id: user.role_id,
          role_name: ROLES[user.role_id] || 'GUEST',
          guest_id: g ? g.id : null,
          staff_id: s ? s.id : null,
          first_name: g ? g.first_name : s ? s.first_name : 'Guest',
          last_name: g ? g.last_name : s ? s.last_name : 'User',
          phone: g ? g.phone : s ? s.phone : '',
          position: s ? s.position : null,
          hire_date: s ? s.hire_date : null,
        },
      ];
    }

    case 'sp_get_room_types': {
      const includeInactive = Boolean(params[0]);
      return includeInactive ? roomTypes : roomTypes.filter((r) => r.is_active);
    }

    case 'sp_get_rooms': {
      const [status, roomTypeId] = params;
      let result = [...rooms];
      if (status) result = result.filter((r) => r.status.toUpperCase() === String(status).toUpperCase());
      if (roomTypeId) result = result.filter((r) => Number(r.room_type_id) === Number(roomTypeId));
      return result;
    }

    case 'sp_create_room': {
      const [roomNumber, roomTypeId, floor, description] = params;
      const type = roomTypes.find((t) => t.id === Number(roomTypeId)) || roomTypes[0];
      const newId = rooms.length ? Math.max(...rooms.map((r) => r.id)) + 1 : 1;
      const newRoom = {
        id: newId,
        room_id: newId,
        room_number: String(roomNumber),
        room_type_id: Number(roomTypeId),
        room_type_name: type?.name ?? 'Standard',
        floor: Number(floor) || 1,
        status: 'AVAILABLE',
        description: description || type?.description || null,
        base_price: type?.base_price ?? 2000,
        capacity: type?.capacity ?? 2,
      };
      rooms.push(newRoom);
      return [{ id: newId, insertId: newId }];
    }

    case 'sp_update_room': {
      const [roomId, roomTypeId, floor, status, description] = params;
      const r = rooms.find((x) => x.id === Number(roomId) || x.room_id === Number(roomId));
      if (r) {
        const type = roomTypes.find((t) => t.id === Number(roomTypeId)) || roomTypes[0];
        if (roomTypeId) {
          r.room_type_id = Number(roomTypeId);
          r.room_type_name = type?.name ?? r.room_type_name;
          r.base_price = type?.base_price ?? r.base_price;
          r.capacity = type?.capacity ?? r.capacity;
        }
        if (floor !== undefined) r.floor = Number(floor);
        if (status) r.status = String(status).toUpperCase();
        if (description !== undefined) r.description = description;
      }
      return [{ success: true }];
    }

    case 'sp_deactivate_room': {
      const roomId = Number(params[0]);
      const r = rooms.find((x) => x.id === roomId || x.room_id === roomId);
      if (r) r.status = 'INACTIVE';
      return [{ success: true }];
    }

    case 'sp_get_room_by_id': {
      const roomId = Number(params[0]);
      const found = rooms.find((r) => r.id === roomId || r.room_id === roomId);
      return found ? [found] : [];
    }

    case 'sp_get_available_rooms': {
      const capacity = Number(params[2] ?? 0);
      return rooms
        .filter((r) => r.status === 'AVAILABLE' && (capacity ? r.capacity >= capacity : true))
        .map((r) => ({
          ...r,
          price_per_night: r.base_price,
        }));
    }

    case 'sp_get_services': {
      const includeInactive = Boolean(params[0]);
      return includeInactive ? services : services.filter((s) => s.is_active);
    }

    case 'sp_get_all_payments': {
      return payments.map((p) => {
        const res = reservations.find((r) => r.id === p.reservation_id);
        return {
          ...p,
          guest_name: p.guest_name || (res ? `${res.first_name} ${res.last_name}`.trim() : 'Guest'),
          room_number: p.room_number || (res?.room_number ?? '—'),
        };
      }).sort((a, b) => new Date(b.payment_date) - new Date(a.payment_date));
    }

    case 'sp_get_payments_by_reservation': {
      const resId = Number(params[0]);
      return payments.filter((p) => p.reservation_id === resId);
    }

    case 'sp_get_all_service_orders': {
      return serviceOrders.map((so) => {
        const res = reservations.find((r) => r.id === so.reservation_id);
        return {
          id: so.id,
          order_id: so.id,
          reservation_id: so.reservation_id,
          room_number: res?.room_number ?? '101',
          guest_name: res ? `${res.first_name} ${res.last_name}`.trim() : 'Guest',
          service_id: so.service_id,
          service_name: so.service_name,
          quantity: so.quantity,
          unit_price: so.unit_price,
          total_amount: so.total_amount,
          status: so.status || 'PENDING',
          order_status: so.status || 'PENDING',
          order_date: so.order_date,
        };
      }).sort((a, b) => new Date(b.order_date) - new Date(a.order_date));
    }

    case 'sp_get_service_orders': {
      const resId = Number(params[0]);
      return serviceOrders
        .filter((o) => o.reservation_id === resId)
        .map((so) => ({
          order_id: so.id,
          order_date: so.order_date,
          order_status: so.status,
          total_amount: so.total_amount,
          item_id: so.id,
          quantity: so.quantity,
          unit_price: so.unit_price,
          subtotal: so.total_amount,
          service_name: so.service_name,
        }));
    }

    case 'sp_update_service_order_status': {
      const [orderId, status] = params;
      const order = serviceOrders.find((o) => o.id === Number(orderId) || o.order_id === Number(orderId));
      if (order) {
        order.status = String(status).toUpperCase();
      }
      return [];
    }

    case 'sp_get_room_issues': {
      const resId = params[0] ? Number(params[0]) : null;
      let list = [...roomIssues];
      if (resId) {
        list = list.filter((i) => i.reservation_id === resId);
      }
      return list.sort((a, b) => {
        const order = { OPEN: 1, IN_PROGRESS: 2, RESOLVED: 3 };
        return (order[a.status] || 4) - (order[b.status] || 4) || new Date(b.created_at) - new Date(a.created_at);
      });
    }

    case 'sp_update_room_issue_status': {
      const [issueId, status, notes] = params;
      const issue = roomIssues.find((i) => i.id === Number(issueId));
      if (issue) {
        issue.status = String(status).toUpperCase();
        if (notes) issue.resolution_notes = notes;
        if (issue.status === 'RESOLVED') issue.resolved_at = new Date().toISOString();
      }
      return [];
    }

    case 'sp_get_guest_reservations': {
      const guestId = Number(params[0]);
      return reservations.filter((r) => r.guest_id === guestId);
    }

    case 'sp_get_all_reservations': {
      const status = params[0];
      if (status) return reservations.filter((r) => r.status === status);
      return reservations;
    }

    case 'sp_get_active_reservations': {
      return reservations.filter((r) => ['CONFIRMED', 'CHECKED_IN'].includes(r.status));
    }

    case 'sp_get_reservation_by_id': {
      const resId = Number(params[0]);
      const found = reservations.find((r) => r.id === resId || r.reservation_id === resId);
      return found ? [found] : [];
    }

    case 'sp_get_all_staff': {
      return staff;
    }

    case 'sp_get_all_guests': {
      return guests;
    }

    case 'sp_get_guest_by_id': {
      const guestId = Number(params[0]);
      const found = guests.find((g) => g.id === guestId);
      return found ? [{ ...found, guest_id: found.id }] : [];
    }

    case 'sp_get_guest_by_user_id': {
      const userId = Number(params[0]);
      const found = guests.find((g) => g.user_id === userId);
      return found ? [{ ...found, guest_id: found.id }] : [];
    }

    case 'sp_get_dashboard_summary': {
      const activeRes = reservations.filter((r) => ['CONFIRMED', 'CHECKED_IN'].includes(r.status));
      const totalRev = reservations.reduce((acc, r) => acc + (Number(r.total_amount) || 0), 0);
      return [
        {
          total_rooms: rooms.length,
          available_rooms: rooms.filter((r) => r.status === 'AVAILABLE').length,
          occupied_rooms: rooms.filter((r) => r.status === 'OCCUPIED').length,
          maintenance_rooms: rooms.filter((r) => r.status === 'MAINTENANCE').length,
          active_reservations: activeRes.length,
          today_arrivals: 2,
          today_departures: 1,
          month_revenue: totalRev || 27500.00,
          monthly_revenue: totalRev || 27500.00,
          occupancy_rate: Math.round((rooms.filter((r) => r.status === 'OCCUPIED').length / (rooms.length || 1)) * 100),
        },
      ];
    }

    case 'sp_confirm_reservation': {
      const resId = Number(params[0]);
      const res = reservations.find((r) => r.id === resId);
      if (!res) {
        const err = new Error('Reservation not found.');
        err.code = 'ER_SIGNAL_EXCEPTION';
        throw err;
      }
      if (res.status !== 'PENDING') {
        const err = new Error('Only pending reservations can be confirmed.');
        err.code = 'ER_SIGNAL_EXCEPTION';
        throw err;
      }
      res.status = 'CONFIRMED';
      return [];
    }

    case 'sp_cancel_reservation': {
      const resId = Number(params[0]);
      const res = reservations.find((r) => r.id === resId);
      if (res) res.status = 'CANCELLED';
      return [];
    }

    case 'sp_check_in_guest': {
      const resId = Number(params[0]);
      const res = reservations.find((r) => r.id === resId);
      if (res) res.status = 'CHECKED_IN';
      return [];
    }

    case 'sp_set_room_status': {
      const [roomId, status] = params;
      const room = rooms.find((r) => r.id === Number(roomId));
      if (room) room.status = status;
      return [];
    }

    default:
      return [];
  }
}

export function executeFallbackProcedureWithOut(procedureName, params = [], outNames = []) {
  if (procedureName === 'sp_register_guest') {
    const [email, passwordHash, firstName, lastName, phone, idCard] = params;
    const normalizedEmail = String(email).toLowerCase().trim();

    const existing = users.find((u) => u.email === normalizedEmail);
    if (existing) {
      const err = new Error('An account with this email already exists.');
      err.code = 'ER_SIGNAL_EXCEPTION';
      throw err;
    }

    const newUserId = nextUserId++;
    const newGuestId = nextGuestId++;

    users.push({
      id: newUserId,
      email: normalizedEmail,
      password_hash: passwordHash,
      role_id: 3, // GUEST
      is_active: 1,
      created_at: new Date().toISOString(),
    });

    guests.push({
      id: newGuestId,
      user_id: newUserId,
      first_name: firstName,
      last_name: lastName,
      phone: phone || '',
      id_card: idCard || '',
    });

    return {
      user_id: newUserId,
      guest_id: newGuestId,
    };
  }

  if (procedureName === 'sp_create_reservation') {
    const [guestId, roomId, checkIn, checkOut, specialRequests] = params;
    const newResId = nextReservationId++;
    const room = rooms.find((r) => r.id === Number(roomId)) || rooms[0];
    const guest = guests.find((g) => g.id === Number(guestId)) || guests[0];

    const days = Math.max(1, Math.round((new Date(checkOut) - new Date(checkIn)) / 86400000)) || 1;
    const rate = Number(room?.base_price ?? 2000);
    const calculatedTotal = rate * days;

    const newRes = {
      id: newResId,
      reservation_id: newResId,
      guest_id: Number(guestId),
      room_id: Number(roomId),
      room_number: room?.room_number ?? '101',
      room_type_name: room?.room_type_name ?? 'Standard',
      first_name: guest?.first_name ?? 'Guest',
      last_name: guest?.last_name ?? '',
      email: users.find((u) => u.id === guest?.user_id)?.email ?? '',
      phone: guest?.phone ?? '',
      check_in_date: checkIn,
      check_out_date: checkOut,
      status: 'PENDING',
      total_amount: calculatedTotal,
      special_requests: specialRequests || null,
      created_at: new Date().toISOString(),
    };

    reservations.unshift(newRes);

    return {
      reservation_id: newResId,
      total_amount: newRes.total_amount,
    };
  }

  if (procedureName === 'sp_create_staff_user') {
    const [email, passwordHash, roleId, firstName, lastName, phone, position] = params;
    const normalizedEmail = String(email).toLowerCase().trim();
    const newUserId = nextUserId++;
    const newStaffId = nextUserId++;

    users.push({
      id: newUserId,
      email: normalizedEmail,
      password_hash: passwordHash,
      role_id: Number(roleId),
      is_active: 1,
      created_at: new Date().toISOString(),
    });

    staff.push({
      id: newStaffId,
      user_id: newUserId,
      first_name: firstName,
      last_name: lastName,
      phone: phone || '',
      position: position || 'Staff',
      hire_date: new Date().toISOString().slice(0, 10),
      is_active: 1,
    });

    return {
      user_id: newUserId,
      staff_id: newStaffId,
    };
  }

  if (procedureName === 'sp_create_guest') {
    const [userId, firstName, lastName, phone, idCard] = params;
    const existing = guests.find((g) => g.user_id === Number(userId));
    if (existing) {
      return { guest_id: existing.id };
    }
    const newGuestId = nextGuestId++;
    guests.push({
      id: newGuestId,
      user_id: Number(userId),
      first_name: firstName || 'Guest',
      last_name: lastName || 'User',
      phone: phone || '',
      id_card: idCard || '',
    });
    return {
      guest_id: newGuestId,
    };
  }

  if (procedureName === 'sp_place_service_order') {
    const [reservationId, serviceId, quantity = 1] = params;
    const sId = Number(serviceId);
    const rId = Number(reservationId);
    const qty = Number(quantity) || 1;

    const service = services.find((s) => s.id === sId || s.service_id === sId) || services[0];
    const reservation = reservations.find((r) => r.id === rId || r.reservation_id === rId);

    const newOrderId = nextOrderId++;
    const totalAmount = Number((service.price * qty).toFixed(2));

    const newOrder = {
      id: newOrderId,
      order_id: newOrderId,
      reservation_id: rId,
      service_id: sId,
      service_name: service.name,
      quantity: qty,
      unit_price: service.price,
      total_amount: totalAmount,
      status: 'PENDING',
      order_date: new Date().toISOString(),
    };

    serviceOrders.unshift(newOrder);

    if (reservation) {
      reservation.total_amount = Number(((reservation.total_amount || 0) + totalAmount).toFixed(2));
    }

    return {
      order_id: newOrderId,
    };
  }

  if (procedureName === 'sp_create_room_issue') {
    const [reservationId, roomId, guestId, category, priority, description] = params;
    const newIssueId = nextIssueId++;
    const res = reservations.find((r) => r.id === Number(reservationId));
    const room = rooms.find((r) => r.id === Number(roomId)) || (res ? rooms.find((rm) => rm.id === res.room_id) : null);
    const guest = guests.find((g) => g.id === Number(guestId)) || (res ? guests.find((g) => g.id === res.guest_id) : null);

    const newIssue = {
      id: newIssueId,
      reservation_id: reservationId ? Number(reservationId) : (res?.id ?? null),
      room_id: room?.id ?? Number(roomId),
      guest_id: guest?.id ?? Number(guestId),
      room_number: room?.room_number ?? res?.room_number ?? '101',
      room_type_name: room?.room_type_name ?? res?.room_type_name ?? 'Standard',
      guest_name: guest ? `${guest.first_name} ${guest.last_name}`.trim() : (res ? `${res.first_name} ${res.last_name}`.trim() : 'Guest'),
      guest_phone: guest?.phone ?? res?.phone ?? '',
      category: category || 'OTHER',
      priority: priority || 'MEDIUM',
      description: description || '',
      status: 'OPEN',
      resolution_notes: null,
      created_at: new Date().toISOString(),
      resolved_at: null,
    };

    roomIssues.unshift(newIssue);

    return {
      issue_id: newIssueId,
    };
  }

  if (procedureName === 'sp_create_payment') {
    const [reservationId, amount, paymentMethod, transactionReference, receivedBy] = params;
    const newPaymentId = nextPaymentId++;
    const res = reservations.find((r) => r.id === Number(reservationId) || r.reservation_id === Number(reservationId));
    const newPayment = {
      id: newPaymentId,
      payment_id: newPaymentId,
      reservation_id: Number(reservationId),
      amount: Number(amount),
      payment_method: paymentMethod || 'CASH',
      transaction_reference: transactionReference || null,
      payment_date: new Date().toISOString(),
      received_by: receivedBy ? Number(receivedBy) : null,
      guest_name: res ? `${res.first_name} ${res.last_name}`.trim() : 'Guest',
      room_number: res?.room_number ?? '—',
    };
    payments.unshift(newPayment);
    return {
      payment_id: newPaymentId,
    };
  }

  // Default fallback for any other OUT procedure
  const result = {};
  for (const name of outNames) {
    result[name] = 1;
  }
  return result;
}

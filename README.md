# Grand Horizon Hotel Management System (HMS)

A full-stack **Hotel Management System** with a React + Tailwind CSS client, an Express.js REST API, and a MySQL database. All database interactions go exclusively through **MySQL stored procedures** — no ORM, no raw SQL in application code.

---

## Architecture

```text
Client (React + Tailwind CSS + Lucide Icons)
      ↓ (HTTP / REST API)
Express.js (JWT authentication, RBAC, request validation)
      ↓ (CALL sp_name(?, ?))
MySQL 8.0+ Database (stored procedures, triggers, views, functions)
```

1. **Zero ORM**: native `mysql2/promise` only.
2. **Zero raw SQL in Node.js**: every query is `CALL sp_*`.
3. Database objects live in ready-to-run `.sql` files executed in **MySQL Workbench**.

---

## Database Setup (MySQL Workbench)

Open MySQL Workbench, connect to a MySQL 8.0+ instance, and run the files in `/database/` in order:

1. `schema.sql` — database `hotel_management` and all normalized tables with constraints
2. `indexes.sql` — performance indexes
3. `functions.sql` — scalar helper functions
4. `views.sql` — reporting views
5. `triggers.sql` — audit and room-state triggers
6. `procedures.sql` — all stored procedures used by the API
7. `seed.sql` — roles, users, room types, rooms, services, and sample data

---

## Test Accounts

All seeded passwords are `admin12345`.

| Role         | Email                 |
| :----------- | :-------------------- |
| Administrator | `admin@hotel.com`    |
| Receptionist  | `front@hotel.com`    |
| Guest         | `guest@hotel.com`    |
| Guest         | `guest2@hotel.com`   |

---

## Running Locally

### 1. Backend (Express API)

```bash
cd server
npm install
npm run dev
```

Server listens on `http://localhost:5000`. Configure credentials in `server/.env`:

```env
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=hotel_management
JWT_SECRET=create_your_secret
JWT_EXPIRES_IN=24h
CLIENT_URL=http://localhost:5173
```

### 2. Frontend (React client)

```bash
cd client
npm install
npm run dev
```

Open `http://localhost:5173`. The API base URL is `VITE_API_URL` (see `client/.env.example`), defaulting to `http://localhost:5000/api`.

---

## REST API Reference

Read-only guest-facing endpoints (`GET /api/rooms`, `/api/rooms/available`, `/api/rooms/types`) are public; everything else requires a JWT and, where noted, a role.

### Auth
- `POST /api/auth/register` — register a guest account
- `POST /api/auth/login` — sign in, returns JWT
- `GET /api/auth/me` — current profile

### Rooms
- `GET /api/rooms` — list rooms (filters: `status`, `roomTypeId`)
- `GET /api/rooms/available?checkIn&checkOut&capacity` — availability search
- `GET /api/rooms/types` — room categories
- `GET /api/rooms/:id` — room detail
- `POST /api/rooms`, `PUT /api/rooms/:id`, `PUT /api/rooms/:id/status`, `DELETE /api/rooms/:id` *(Admin)*
- `POST /api/rooms/types`, `PUT /api/rooms/types/:id` *(Admin)*

### Reservations
- `GET /api/reservations` *(Staff)* — all reservations
- `GET /api/reservations/my` *(Guest)* — personal bookings
- `GET /api/reservations/active` *(Staff)* — checked-in / confirmed
- `GET /api/reservations/:id`
- `POST /api/reservations` — create (transaction + row locks prevent double booking)
- `PUT /api/reservations/:id/confirm` *(Staff)*
- `PUT /api/reservations/:id/cancel`
- `POST /api/reservations/:id/check-in` *(Staff)*
- `POST /api/reservations/:id/check-out` *(Staff)* — settles balance, room → maintenance

### Payments & Services
- `POST /api/payments`, `GET /api/payments` *(Admin)*, `GET /api/payments/reservation/:reservationId`
- `GET /api/services/services` — public catalog
- `POST /api/services/services`, `PUT /api/services/services/:id` *(Admin)*
- `POST /api/services/service-orders` *(Staff)* — order a service for a stay
- `GET /api/services/service-orders/reservation/:reservationId`

### Staff (Admin)
- `GET /api/staff`, `POST /api/staff`, `PUT /api/staff/:id/deactivate`

### Reports
- `GET /api/reports/dashboard-summary` *(Admin)* — occupancy & revenue KPIs
- `GET /api/reports/daily-reservations?date=YYYY-MM-DD` *(Staff)* — front-desk roster
- `GET /api/reports/monthly-revenue?year&month` *(Admin)*
- `GET /api/reports/occupancy?startDate&endDate` *(Admin)*

---

## Client Structure

```text
client/src/
  context/        Auth, notifications (toasts)
  services/       typed API wrappers over /api
  hooks/          useAuth, useFetch
  components/
    common/       Button, Field, Modal, Table, Badge, cards, skeletons…
    layout/       Navbar, Footer, DashboardLayout
    routing/      ProtectedRoute (role-aware), GuestOnlyRoute
    landing/      Hero, BookingBar, RoomShowcase, RoomCard, Amenities, Testimonials
  pages/          Landing, Booking, Login, Register, MyBookings, NotFound
  pages/dashboard/ Overview, Rooms, Room Types, Guests, Reservations,
                   Payments, Services, Staff, Reports
```

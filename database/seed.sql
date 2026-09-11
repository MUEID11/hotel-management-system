-- =============================================================================
-- Hotel Management System - Seed Data
-- -----------------------------------------------------------------------------
-- Execute last, after procedures.sql, in MySQL Workbench.
--
-- Default test accounts (password = admin12345 for all users):
--   admin@hotel.com   -> Administrator
--   front@hotel.com   -> Receptionist
--   guest@hotel.com   -> Guest
--   guest2@hotel.com  -> Guest
--
-- Dates are generated relative to CURDATE(), so the dashboard and reports
-- always contain meaningful sample data regardless of when the seed runs.
-- =============================================================================

USE hotel_management;

-- -----------------------------------------------------------------------------
-- Roles
-- -----------------------------------------------------------------------------
INSERT IGNORE INTO roles (id, name, description) VALUES
  (1, 'ADMIN',        'System administrator with full access'),
  (2, 'RECEPTIONIST', 'Front desk staff managing reservations and stays'),
  (3, 'GUEST',        'Registered guest with self-service portal access');

-- -----------------------------------------------------------------------------
-- Users (bcrypt hashes for password "admin12345", salt rounds = 10)
-- -----------------------------------------------------------------------------
INSERT IGNORE INTO users (id, email, password_hash, role_id, is_active) VALUES
  (1, 'admin@hotel.com',   '$2a$10$3ybzWRXzu0uViPNJXsBPaOdGBTiMWIV9h8s6MfYQomgT.iy9Mnjjm', 1, 1),
  (2, 'front@hotel.com',   '$2a$10$3ybzWRXzu0uViPNJXsBPaOdGBTiMWIV9h8s6MfYQomgT.iy9Mnjjm', 2, 1),
  (3, 'guest@hotel.com',   '$2a$10$3ybzWRXzu0uViPNJXsBPaOdGBTiMWIV9h8s6MfYQomgT.iy9Mnjjm', 3, 1),
  (4, 'guest2@hotel.com',  '$2a$10$3ybzWRXzu0uViPNJXsBPaOdGBTiMWIV9h8s6MfYQomgT.iy9Mnjjm', 3, 1);

-- -----------------------------------------------------------------------------
-- Staff
-- -----------------------------------------------------------------------------
INSERT IGNORE INTO staff (id, user_id, first_name, last_name, phone, position, hire_date, is_active) VALUES
  (1, 1, 'Sofia',  'Martinez',   '+1 555 0101', 'General Manager',     DATE_SUB(CURDATE(), INTERVAL 900 DAY), 1),
  (2, 2, 'Daniel', 'Okafor',     '+1 555 0102', 'Front Desk Agent',    DATE_SUB(CURDATE(), INTERVAL 200 DAY), 1);

-- -----------------------------------------------------------------------------
-- Guests
-- -----------------------------------------------------------------------------
INSERT IGNORE INTO guests (id, user_id, first_name, last_name, phone, id_card) VALUES
  (1, 3, 'Amelia', 'Chen',   '+1 555 0201', 'P-88231'),
  (2, 4, 'Lucas',  'Nguyen', '+1 555 0202', 'P-44719');

-- -----------------------------------------------------------------------------
-- Room types
-- -----------------------------------------------------------------------------
INSERT IGNORE INTO room_types (id, name, description, base_price, capacity, amenities, is_active) VALUES
  (1, 'Standard',   'Comfortable room with a queen bed, city view and essential amenities.', 2000.00, 2,
   '["Wi-Fi","AC","Smart TV","Work Desk","Breakfast"]', 1),
  (2, 'Deluxe',     'Spacious room with a king bed, seating area and premium bathroom.',      3500.00, 3,
   '["Wi-Fi","AC","Smart TV","Mini Bar","Work Desk","Breakfast"]', 1),
  (3, 'Ocean View', 'Breathtaking ocean views with private balcony and king-size bed.',       5000.00, 3,
   '["Wi-Fi","AC","Balcony","Smart TV","Mini Bar","Breakfast"]', 1),
  (4, 'Executive Suite', 'Two-room suite with separate living area and butler service.',      7000.00, 4,
   '["Wi-Fi","AC","Living Room","Bathtub","Mini Bar","Breakfast","Lounge Access"]', 1),
  (5, 'Presidential',    'The finest accommodation with panoramic views and concierge.',      9000.00, 4,
   '["Wi-Fi","AC","Living Room","Kitchen","Jacuzzi","Butler","Breakfast"]', 1);

-- -----------------------------------------------------------------------------
-- Rooms (13 rooms, floors 1-3)
-- -----------------------------------------------------------------------------
INSERT IGNORE INTO rooms (id, room_number, room_type_id, floor, status, description) VALUES
  (1,  '101', 1, 1, 'MAINTENANCE', 'City view standard room'),
  (2,  '102', 1, 1, 'MAINTENANCE', 'City view standard room'),
  (3,  '103', 1, 1, 'AVAILABLE',   'City view standard room'),
  (4,  '104', 2, 1, 'AVAILABLE',   'King bed deluxe room'),
  (5,  '105', 2, 1, 'AVAILABLE',   'King bed deluxe room'),
  (6,  '201', 3, 2, 'AVAILABLE',   'Ocean view with balcony'),
  (7,  '202', 3, 2, 'OCCUPIED',    'Ocean view with balcony'),
  (8,  '203', 3, 2, 'AVAILABLE',   'Ocean view with balcony'),
  (9,  '204', 4, 2, 'AVAILABLE',   'Executive suite with living room'),
  (10, '205', 4, 2, 'AVAILABLE',   'Executive suite with living room'),
  (11, '301', 1, 3, 'AVAILABLE',   'Quiet floor standard room'),
  (12, '302', 1, 3, 'AVAILABLE',   'Quiet floor standard room'),
  (13, '303', 4, 3, 'AVAILABLE',   'Executive suite with living room'),
  (14, '304', 4, 3, 'AVAILABLE',   'Executive suite with living room'),
  (15, '305', 5, 3, 'AVAILABLE',   'Presidential suite with panoramic view');

-- -----------------------------------------------------------------------------
-- Services (amenities guests can order during their stay)
-- -----------------------------------------------------------------------------
INSERT IGNORE INTO services (id, name, description, price, is_active) VALUES
  (1, 'Breakfast Buffet', 'Daily continental and hot breakfast buffet.', 500.00, 1),
  (2, 'High-Speed Wi-Fi', 'Unlimited premium Wi-Fi access for the stay.', 200.00, 1),
  (3, 'Airport Shuttle',  'Private one-way airport transfer.', 1500.00, 1),
  (4, 'Spa Treatment',    '60 minute relaxing full-body massage.', 2500.00, 1),
  (5, 'Laundry Service',  'Same-day garment cleaning and pressing.', 400.00, 1),
  (6, 'Mini Bar Restock', 'Complimentary mini bar restock in the evening.', 850.00, 1);

-- -----------------------------------------------------------------------------
-- Sample reservations
-- -----------------------------------------------------------------------------
-- Reservation 1: Amelia checked out yesterday (1 night Standard 101, fully paid).
INSERT IGNORE INTO reservations
  (id, guest_id, room_id, check_in_date, check_out_date, status, total_amount, special_requests)
VALUES
  (1, 1, 1, DATE_SUB(CURDATE(), INTERVAL 1 DAY), CURDATE(), 'CHECKED_OUT', 2000.00, 'Late arrival expected');

INSERT IGNORE INTO reservation_guests (reservation_id, guest_id) VALUES
  (1, 1);

INSERT IGNORE INTO payments (id, reservation_id, amount, payment_method, transaction_reference, payment_date, received_by) VALUES
  (1, 1, 2000.00, 'CASH', 'WALK-0001', DATE_SUB(CURDATE(), INTERVAL 1 DAY), 2);

-- Reservation 2: Amelia upcoming confirmed Deluxe 105 (3 nights, unpaid).
INSERT IGNORE INTO reservations
  (id, guest_id, room_id, check_in_date, check_out_date, status, total_amount, special_requests)
VALUES
  (2, 1, 5, DATE_ADD(CURDATE(), INTERVAL 2 DAY), DATE_ADD(CURDATE(), INTERVAL 5 DAY), 'CONFIRMED', 10500.00, 'High floor preferred');

INSERT IGNORE INTO reservation_guests (reservation_id, guest_id) VALUES
  (2, 1);

-- Reservation 3: Lucas currently checked in Ocean View 202 (3 nights, partial payment).
INSERT IGNORE INTO reservations
  (id, guest_id, room_id, check_in_date, check_out_date, status, total_amount, special_requests)
VALUES
  (3, 2, 7, DATE_SUB(CURDATE(), INTERVAL 1 DAY), DATE_ADD(CURDATE(), INTERVAL 2 DAY), 'CHECKED_IN', 15000.00, NULL);

INSERT IGNORE INTO reservation_guests (reservation_id, guest_id) VALUES
  (3, 2);

INSERT IGNORE INTO payments (id, reservation_id, amount, payment_method, transaction_reference, payment_date, received_by) VALUES
  (2, 3, 5000.00, 'CARD', 'CARD-2201', DATE_SUB(CURDATE(), INTERVAL 1 DAY), 2);

-- Reservation 4: Lucas upcoming pending Executive Suite 303 (2 nights).
INSERT IGNORE INTO reservations
  (id, guest_id, room_id, check_in_date, check_out_date, status, total_amount, special_requests)
VALUES
  (4, 2, 13, DATE_ADD(CURDATE(), INTERVAL 10 DAY), DATE_ADD(CURDATE(), INTERVAL 12 DAY), 'PENDING', 14000.00, 'Birthday celebration');

INSERT IGNORE INTO reservation_guests (reservation_id, guest_id) VALUES
  (4, 2);

-- Reservation 5: Amelia historical checkout with hotel services (2 nights Standard 102).
INSERT IGNORE INTO reservations
  (id, guest_id, room_id, check_in_date, check_out_date, status, total_amount, special_requests)
VALUES
  (5, 1, 2, DATE_SUB(CURDATE(), INTERVAL 6 DAY), DATE_SUB(CURDATE(), INTERVAL 4 DAY), 'CHECKED_OUT', 4000.00, NULL);

INSERT IGNORE INTO reservation_guests (reservation_id, guest_id) VALUES
  (5, 1);

-- Service order for reservation 5: breakfast x2 + wi-fi x1 = 1200.00
INSERT IGNORE INTO service_orders (id, reservation_id, order_date, status, total_amount) VALUES
  (1, 5, DATE_SUB(CURDATE(), INTERVAL 5 DAY), 'DELIVERED', 1000.00 + 200.00);

INSERT IGNORE INTO service_order_items (id, service_order_id, service_id, quantity, unit_price, subtotal) VALUES
  (1, 1, 1, 2, 500.00, 1000.00),
  (2, 1, 2, 1, 200.00, 200.00);

INSERT IGNORE INTO payments (id, reservation_id, amount, payment_method, transaction_reference, payment_date, received_by) VALUES
  (3, 5, 5200.00, 'MOBILE_TRANSFER', 'MPS-9912', DATE_SUB(CURDATE(), INTERVAL 4 DAY), 2);
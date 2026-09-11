-- ============================================================================
-- HOTEL MANAGEMENT SYSTEM (HMS)
-- Database Indexes: Performance Optimizations & Availability Lookups
-- Designed for execution in MySQL Workbench 8.0+
-- ============================================================================

USE hotel_management;

-- Room lookups by type and status
CREATE INDEX idx_rooms_room_type ON rooms(room_type_id);
CREATE INDEX idx_rooms_status ON rooms(status);

-- Reservation date overlap and status queries
CREATE INDEX idx_reservations_dates ON reservations(check_in_date, check_out_date);
CREATE INDEX idx_reservations_status ON reservations(status);
CREATE INDEX idx_reservations_guest ON reservations(guest_id);
CREATE INDEX idx_reservations_room ON reservations(room_id);

-- Payment queries by reservation
CREATE INDEX idx_payments_reservation ON payments(reservation_id);

-- Service orders by reservation
CREATE INDEX idx_service_orders_res ON service_orders(reservation_id);
CREATE INDEX idx_service_order_items_order ON service_order_items(order_id);
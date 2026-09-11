-- ============================================================================
-- HOTEL MANAGEMENT SYSTEM (HMS)
-- Database Views: Reporting and Inventory Join Views
-- Designed for execution in MySQL Workbench 8.0+
-- ============================================================================

USE hotel_management;

-- ----------------------------------------------------------------------------
-- 1. Active Reservations View
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW vw_active_reservations AS
SELECT 
    r.reservation_id,
    r.guest_id,
    CONCAT(g.first_name, ' ', g.last_name) AS guest_full_name,
    g.phone AS guest_phone,
    u.email AS guest_email,
    r.room_id,
    rm.room_number,
    rt.name AS room_type_name,
    rt.bed_type,
    r.check_in_date,
    r.check_out_date,
    r.total_amount,
    r.status AS reservation_status,
    rm.status AS room_status,
    fn_get_reservation_balance(r.reservation_id) AS remaining_balance,
    r.created_at
FROM reservations r
JOIN guests g ON r.guest_id = g.guest_id
LEFT JOIN users u ON g.user_id = u.user_id
JOIN rooms rm ON r.room_id = rm.room_id
JOIN room_types rt ON rm.room_type_id = rt.room_type_id
WHERE r.status IN ('CONFIRMED', 'CHECKED_IN');

-- ----------------------------------------------------------------------------
-- 2. Room Inventory View
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW vw_room_inventory AS
SELECT 
    rm.room_id,
    rm.room_number,
    rm.floor,
    rm.status AS current_status,
    rm.description AS room_description,
    rt.room_type_id,
    rt.name AS room_type_name,
    rt.description AS room_type_description,
    rt.base_price,
    rt.capacity,
    rt.bed_type,
    rt.image_url,
    rm.created_at,
    rm.updated_at
FROM rooms rm
JOIN room_types rt ON rm.room_type_id = rt.room_type_id;

-- ----------------------------------------------------------------------------
-- 3. Payment Summary View
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW vw_payment_summary AS
SELECT 
    r.reservation_id,
    r.guest_id,
    CONCAT(g.first_name, ' ', g.last_name) AS guest_name,
    r.room_id,
    rm.room_number,
    r.status AS reservation_status,
    r.total_amount AS room_charge,
    COALESCE(SUM(CASE WHEN p.status = 'SUCCESS' THEN p.amount ELSE 0 END), 0.00) AS total_paid,
    fn_get_reservation_balance(r.reservation_id) AS balance_due,
    COUNT(p.payment_id) AS payment_count,
    MAX(p.payment_date) AS last_payment_date
FROM reservations r
JOIN guests g ON r.guest_id = g.guest_id
JOIN rooms rm ON r.room_id = rm.room_id
LEFT JOIN payments p ON r.reservation_id = p.reservation_id
GROUP BY 
    r.reservation_id, 
    r.guest_id, 
    g.first_name, 
    g.last_name, 
    r.room_id, 
    rm.room_number, 
    r.status, 
    r.total_amount;
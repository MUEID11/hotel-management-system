-- ============================================================================
-- HOTEL MANAGEMENT SYSTEM (HMS)
-- Stored Functions: Reusable Scalar Calculations
-- Designed for execution in MySQL Workbench 8.0+
-- ============================================================================

USE hotel_management;

DROP FUNCTION IF EXISTS fn_calculate_total_nights;
DROP FUNCTION IF EXISTS fn_calculate_room_charge;
DROP FUNCTION IF EXISTS fn_get_reservation_balance;

DELIMITER //

-- ----------------------------------------------------------------------------
-- 1. Calculate Total Nights between Check-In and Check-Out
-- ----------------------------------------------------------------------------
CREATE FUNCTION fn_calculate_total_nights(
    p_check_in DATE,
    p_check_out DATE
) 
RETURNS INT
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE v_nights INT;
    SET v_nights = DATEDIFF(p_check_out, p_check_in);
    IF v_nights < 1 THEN
        SET v_nights = 1;
    END IF;
    RETURN v_nights;
END //

-- ----------------------------------------------------------------------------
-- 2. Calculate Base Room Charge for given nights and price
-- ----------------------------------------------------------------------------
CREATE FUNCTION fn_calculate_room_charge(
    p_price_per_night DECIMAL(10, 2),
    p_nights INT
)
RETURNS DECIMAL(10, 2)
DETERMINISTIC
NO SQL
BEGIN
    IF p_nights < 1 THEN
        SET p_nights = 1;
    END IF;
    RETURN ROUND(p_price_per_night * p_nights, 2);
END //

-- ----------------------------------------------------------------------------
-- 3. Calculate Outstanding Reservation Balance
-- Formula: (Reservation Total Amount + Delivered Services) - (Successful Payments)
-- ----------------------------------------------------------------------------
CREATE FUNCTION fn_get_reservation_balance(
    p_reservation_id INT
)
RETURNS DECIMAL(10, 2)
READS SQL DATA
BEGIN
    DECLARE v_room_charge DECIMAL(10, 2) DEFAULT 0.00;
    DECLARE v_service_total DECIMAL(10, 2) DEFAULT 0.00;
    DECLARE v_paid_total DECIMAL(10, 2) DEFAULT 0.00;
    DECLARE v_balance DECIMAL(10, 2) DEFAULT 0.00;

    -- Get base reservation room charge
    SELECT COALESCE(total_amount, 0.00) INTO v_room_charge
    FROM reservations
    WHERE reservation_id = p_reservation_id;

    -- Get total delivered services
    SELECT COALESCE(SUM(total_service_amount), 0.00) INTO v_service_total
    FROM service_orders
    WHERE reservation_id = p_reservation_id
      AND status = 'DELIVERED';

    -- Get total successful payments
    SELECT COALESCE(SUM(amount), 0.00) INTO v_paid_total
    FROM payments
    WHERE reservation_id = p_reservation_id
      AND status = 'SUCCESS';

    SET v_balance = (v_room_charge + v_service_total) - v_paid_total;
    RETURN ROUND(v_balance, 2);
END //

DELIMITER ;
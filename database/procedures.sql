-- =============================================================================
-- Hotel Management System - Stored Procedures
-- -----------------------------------------------------------------------------
-- Execute after schema.sql, indexes.sql, functions.sql, views.sql and
-- triggers.sql in MySQL Workbench.
--
-- The Node.js application NEVER executes raw SQL. Every database operation is
-- exposed by these procedures and invoked with `CALL sp_name(?, ?)`.
-- =============================================================================

USE hotel_management;

DELIMITER //

-- =============================================================================
-- AUTHENTICATION & USERS
-- =============================================================================

DROP PROCEDURE IF EXISTS sp_create_user//
CREATE PROCEDURE sp_create_user(
  IN  p_email         VARCHAR(191),
  IN  p_password_hash VARCHAR(255),
  IN  p_role_id       INT UNSIGNED,
  OUT p_user_id       INT UNSIGNED
)
BEGIN
  DECLARE v_existing_count INT DEFAULT 0;

  SELECT COUNT(*) INTO v_existing_count
    FROM users
   WHERE email = LOWER(TRIM(p_email));

  IF v_existing_count > 0 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'An account with this email already exists.';
  END IF;

  INSERT INTO users (email, password_hash, role_id)
  VALUES (LOWER(TRIM(p_email)), p_password_hash, p_role_id);

  SET p_user_id = LAST_INSERT_ID();
END//

DROP PROCEDURE IF EXISTS sp_register_guest//
CREATE PROCEDURE sp_register_guest(
  IN  p_email         VARCHAR(191),
  IN  p_password_hash VARCHAR(255),
  IN  p_first_name    VARCHAR(100),
  IN  p_last_name     VARCHAR(100),
  IN  p_phone         VARCHAR(30),
  IN  p_id_card       VARCHAR(50),
  OUT p_user_id       INT UNSIGNED,
  OUT p_guest_id      INT UNSIGNED
)
label_register_guest: BEGIN
  DECLARE v_role_id INT UNSIGNED;
  DECLARE v_existing_count INT DEFAULT 0;

  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;

  SELECT COUNT(*) INTO v_existing_count
    FROM users
   WHERE email = LOWER(TRIM(p_email));

  IF v_existing_count > 0 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'An account with this email already exists.';
  END IF;

  SELECT id INTO v_role_id FROM roles WHERE name = 'GUEST';
  IF v_role_id IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'GUEST role is not configured.';
  END IF;

  START TRANSACTION;

  INSERT INTO users (email, password_hash, role_id)
  VALUES (LOWER(TRIM(p_email)), p_password_hash, v_role_id);
  SET p_user_id = LAST_INSERT_ID();

  INSERT INTO guests (user_id, first_name, last_name, phone, id_card)
  VALUES (p_user_id, p_first_name, p_last_name, p_phone, p_id_card);
  SET p_guest_id = LAST_INSERT_ID();

  COMMIT;
END//

DROP PROCEDURE IF EXISTS sp_create_staff_user//
CREATE PROCEDURE sp_create_staff_user(
  IN  p_email         VARCHAR(191),
  IN  p_password_hash VARCHAR(255),
  IN  p_role_id       INT UNSIGNED,
  IN  p_first_name    VARCHAR(100),
  IN  p_last_name     VARCHAR(100),
  IN  p_phone         VARCHAR(30),
  IN  p_position      VARCHAR(100),
  OUT p_user_id       INT UNSIGNED,
  OUT p_staff_id      INT UNSIGNED
)
BEGIN
  DECLARE v_existing_count INT DEFAULT 0;

  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;

  SELECT COUNT(*) INTO v_existing_count
    FROM users
   WHERE email = LOWER(TRIM(p_email));

  IF v_existing_count > 0 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'An account with this email already exists.';
  END IF;

  START TRANSACTION;

  INSERT INTO users (email, password_hash, role_id)
  VALUES (LOWER(TRIM(p_email)), p_password_hash, p_role_id);
  SET p_user_id = LAST_INSERT_ID();

  INSERT INTO staff (user_id, first_name, last_name, phone, position)
  VALUES (p_user_id, p_first_name, p_last_name, p_phone, p_position);
  SET p_staff_id = LAST_INSERT_ID();

  COMMIT;
END//

DROP PROCEDURE IF EXISTS sp_get_user_by_email//
CREATE PROCEDURE sp_get_user_by_email(IN p_email VARCHAR(191))
BEGIN
  SELECT
    u.id,
    u.email,
    u.password_hash,
    u.role_id,
    r.name AS role_name,
    u.is_active,
    u.created_at
  FROM users u
  INNER JOIN roles r ON r.id = u.role_id
  WHERE u.email = LOWER(TRIM(p_email))
  LIMIT 1;
END//

DROP PROCEDURE IF EXISTS sp_get_user_by_id//
CREATE PROCEDURE sp_get_user_by_id(IN p_user_id INT UNSIGNED)
BEGIN
  SELECT
    u.id,
    u.email,
    u.password_hash,
    u.role_id,
    r.name AS role_name,
    u.is_active,
    u.created_at
  FROM users u
  INNER JOIN roles r ON r.id = u.role_id
  WHERE u.id = p_user_id
  LIMIT 1;
END//

DROP PROCEDURE IF EXISTS sp_get_user_profile//
CREATE PROCEDURE sp_get_user_profile(IN p_user_id INT UNSIGNED)
BEGIN
  SELECT
    u.id            AS user_id,
    u.email,
    u.is_active     AS user_is_active,
    u.role_id,
    r.name          AS role_name,
    g.id            AS guest_id,
    s.id            AS staff_id,
    COALESCE(g.first_name, s.first_name) AS first_name,
    COALESCE(g.last_name,  s.last_name)  AS last_name,
    COALESCE(g.phone,      s.phone)      AS phone,
    s.position,
    s.hire_date
  FROM users u
  INNER JOIN roles r ON r.id = u.role_id
  LEFT JOIN guests g ON g.user_id = u.id
  LEFT JOIN staff  s ON s.user_id = u.id
  WHERE u.id = p_user_id
  LIMIT 1;
END//

-- =============================================================================
-- STAFF MANAGEMENT
-- =============================================================================

DROP PROCEDURE IF EXISTS sp_get_all_staff//
CREATE PROCEDURE sp_get_all_staff(IN p_limit INT, IN p_offset INT)
BEGIN
  SELECT
    st.id,
    st.user_id,
    st.first_name,
    st.last_name,
    st.phone,
    st.position,
    st.hire_date,
    st.is_active AS staff_is_active,
    u.email,
    r.name AS role_name
  FROM staff st
  INNER JOIN users u ON u.id = st.user_id
  INNER JOIN roles r ON r.id = u.role_id
  ORDER BY st.id ASC
  LIMIT p_offset, p_limit;
END//

DROP PROCEDURE IF EXISTS sp_deactivate_staff_user//
CREATE PROCEDURE sp_deactivate_staff_user(IN p_user_id INT UNSIGNED)
BEGIN
  UPDATE users SET is_active = 0 WHERE id = p_user_id;
  UPDATE staff SET is_active = 0 WHERE user_id = p_user_id;

  IF ROW_COUNT() = 0 AND NOT EXISTS (SELECT 1 FROM users WHERE id = p_user_id) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Staff user not found.';
  END IF;
END//

-- =============================================================================
-- GUESTS
-- =============================================================================

DROP PROCEDURE IF EXISTS sp_create_guest//
CREATE PROCEDURE sp_create_guest(
  IN  p_user_id    INT UNSIGNED,
  IN  p_first_name VARCHAR(100),
  IN  p_last_name  VARCHAR(100),
  IN  p_phone      VARCHAR(30),
  IN  p_id_card    VARCHAR(50),
  OUT p_guest_id   INT UNSIGNED
)
BEGIN
  DECLARE v_existing INT DEFAULT 0;

  -- A user may only own a single guest profile.
  SELECT COUNT(*) INTO v_existing FROM guests WHERE user_id = p_user_id;

  IF v_existing > 0 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'This account already has a guest profile.';
  END IF;

  INSERT INTO guests (user_id, first_name, last_name, phone, id_card)
  VALUES (p_user_id, p_first_name, p_last_name, p_phone, p_id_card);

  SET p_guest_id = LAST_INSERT_ID();
END//

DROP PROCEDURE IF EXISTS sp_get_guest_by_id//
CREATE PROCEDURE sp_get_guest_by_id(IN p_guest_id INT UNSIGNED)
BEGIN
  SELECT
    g.id,
    g.user_id,
    g.first_name,
    g.last_name,
    g.phone,
    g.id_card,
    g.created_at,
    g.updated_at,
    u.email,
    u.is_active AS user_is_active
  FROM guests g
  INNER JOIN users u ON u.id = g.user_id
  WHERE g.id = p_guest_id
  LIMIT 1;
END//

DROP PROCEDURE IF EXISTS sp_get_guest_by_user_id//
CREATE PROCEDURE sp_get_guest_by_user_id(IN p_user_id INT UNSIGNED)
BEGIN
  SELECT
    g.id,
    g.user_id,
    g.first_name,
    g.last_name,
    g.phone,
    g.id_card,
    g.created_at,
    g.updated_at,
    u.email,
    u.is_active AS user_is_active
  FROM guests g
  INNER JOIN users u ON u.id = g.user_id
  WHERE g.user_id = p_user_id
  LIMIT 1;
END//

DROP PROCEDURE IF EXISTS sp_get_all_guests//
CREATE PROCEDURE sp_get_all_guests(IN p_limit INT, IN p_offset INT)
BEGIN
  SELECT
    g.id,
    g.user_id,
    g.first_name,
    g.last_name,
    g.phone,
    g.id_card,
    g.created_at,
    u.email,
    u.is_active AS user_is_active,
    (SELECT COUNT(*) FROM reservations r WHERE r.guest_id = g.id) AS reservation_count
  FROM guests g
  INNER JOIN users u ON u.id = g.user_id
  ORDER BY g.created_at DESC
  LIMIT p_offset, p_limit;
END//

DROP PROCEDURE IF EXISTS sp_update_guest//
CREATE PROCEDURE sp_update_guest(
  IN p_guest_id   INT UNSIGNED,
  IN p_first_name VARCHAR(100),
  IN p_last_name  VARCHAR(100),
  IN p_phone      VARCHAR(30)
)
BEGIN
  UPDATE guests
     SET first_name = p_first_name,
         last_name  = p_last_name,
         phone      = p_phone
   WHERE id = p_guest_id;

  IF ROW_COUNT() = 0 AND NOT EXISTS (SELECT 1 FROM guests WHERE id = p_guest_id) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Guest not found.';
  END IF;
END//

-- =============================================================================
-- ROOM TYPES & ROOMS
-- =============================================================================

DROP PROCEDURE IF EXISTS sp_create_room_type//
CREATE PROCEDURE sp_create_room_type(
  IN  p_name        VARCHAR(100),
  IN  p_description TEXT,
  IN  p_base_price  DECIMAL(10, 2),
  IN  p_capacity    INT UNSIGNED,
  IN  p_amenities   TEXT,
  OUT p_room_type_id INT UNSIGNED
)
BEGIN
  INSERT INTO room_types (name, description, base_price, capacity, amenities)
  VALUES (p_name, p_description, p_base_price, p_capacity, p_amenities);

  SET p_room_type_id = LAST_INSERT_ID();
END//

DROP PROCEDURE IF EXISTS sp_get_room_types//
CREATE PROCEDURE sp_get_room_types(IN p_include_inactive TINYINT)
BEGIN
  SELECT
    id,
    name,
    description,
    base_price,
    capacity,
    amenities,
    is_active
  FROM room_types
  WHERE p_include_inactive = 1 OR is_active = 1
  ORDER BY base_price ASC, id ASC;
END//

DROP PROCEDURE IF EXISTS sp_update_room_type//
CREATE PROCEDURE sp_update_room_type(
  IN p_room_type_id INT UNSIGNED,
  IN p_name         VARCHAR(100),
  IN p_description  TEXT,
  IN p_base_price   DECIMAL(10, 2),
  IN p_capacity     INT UNSIGNED,
  IN p_amenities    TEXT,
  IN p_is_active    TINYINT
)
BEGIN
  UPDATE room_types
     SET name        = p_name,
         description = p_description,
         base_price  = p_base_price,
         capacity    = p_capacity,
         amenities   = p_amenities,
         is_active   = p_is_active
   WHERE id = p_room_type_id;

  IF ROW_COUNT() = 0 AND NOT EXISTS (SELECT 1 FROM room_types WHERE id = p_room_type_id) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Room type not found.';
  END IF;
END//

DROP PROCEDURE IF EXISTS sp_create_room//
CREATE PROCEDURE sp_create_room(
  IN  p_room_number  VARCHAR(10),
  IN  p_room_type_id INT UNSIGNED,
  IN  p_floor        INT UNSIGNED,
  IN  p_description  VARCHAR(500),
  OUT p_room_id      INT UNSIGNED
)
BEGIN
  DECLARE v_existing INT DEFAULT 0;

  SELECT COUNT(*) INTO v_existing FROM rooms WHERE room_number = p_room_number;

  IF v_existing > 0 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'A room with this room number already exists.';
  END IF;

  INSERT INTO rooms (room_number, room_type_id, floor, status, description)
  VALUES (p_room_number, p_room_type_id, p_floor, 'AVAILABLE', p_description);

  SET p_room_id = LAST_INSERT_ID();
END//

DROP PROCEDURE IF EXISTS sp_get_rooms//
CREATE PROCEDURE sp_get_rooms(
  IN p_status        VARCHAR(20),
  IN p_room_type_id  INT UNSIGNED
)
BEGIN
  SELECT
    ro.id,
    ro.room_number,
    ro.floor,
    ro.status,
    ro.description,
    ro.room_type_id,
    rt.name            AS room_type_name,
    rt.base_price      AS price_per_night,
    rt.capacity,
    rt.amenities
  FROM rooms ro
  INNER JOIN room_types rt ON rt.id = ro.room_type_id
  WHERE (p_status IS NULL OR p_status = '' OR ro.status = p_status)
    AND (p_room_type_id IS NULL OR ro.room_type_id = p_room_type_id)
  ORDER BY rt.base_price ASC, ro.room_number ASC;
END//

DROP PROCEDURE IF EXISTS sp_get_room_by_id//
CREATE PROCEDURE sp_get_room_by_id(IN p_room_id INT UNSIGNED)
BEGIN
  SELECT
    ro.id,
    ro.room_number,
    ro.floor,
    ro.status,
    ro.description,
    ro.room_type_id,
    rt.name          AS room_type_name,
    rt.base_price    AS price_per_night,
    rt.capacity,
    rt.amenities
  FROM rooms ro
  INNER JOIN room_types rt ON rt.id = ro.room_type_id
  WHERE ro.id = p_room_id
  LIMIT 1;
END//

DROP PROCEDURE IF EXISTS sp_update_room//
CREATE PROCEDURE sp_update_room(
  IN p_room_id      INT UNSIGNED,
  IN p_room_type_id INT UNSIGNED,
  IN p_floor        INT UNSIGNED,
  IN p_status       VARCHAR(20),
  IN p_description  VARCHAR(500)
)
BEGIN
  IF p_status NOT IN ('AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'INACTIVE') THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invalid room status provided.';
  END IF;

  UPDATE rooms
     SET room_type_id = p_room_type_id,
         floor        = p_floor,
         status       = p_status,
         description  = p_description
   WHERE id = p_room_id;

  IF ROW_COUNT() = 0 AND NOT EXISTS (SELECT 1 FROM rooms WHERE id = p_room_id) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Room not found.';
  END IF;
END//

DROP PROCEDURE IF EXISTS sp_deactivate_room//
CREATE PROCEDURE sp_deactivate_room(IN p_room_id INT UNSIGNED)
BEGIN
  DECLARE v_status VARCHAR(20);

  SELECT status INTO v_status FROM rooms WHERE id = p_room_id;

  IF v_status IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Room not found.';
  END IF;

  IF v_status = 'OCCUPIED' THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'An occupied room cannot be deactivated.';
  END IF;

  IF v_status = 'INACTIVE' THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Room is already inactive.';
  END IF;

  -- Soft deletion: historical reservations are preserved.
  UPDATE rooms SET status = 'INACTIVE' WHERE id = p_room_id;
END//

DROP PROCEDURE IF EXISTS sp_set_room_status//
CREATE PROCEDURE sp_set_room_status(
  IN p_room_id INT UNSIGNED,
  IN p_status  VARCHAR(20)
)
BEGIN
  IF p_status NOT IN ('AVAILABLE', 'MAINTENANCE') THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Only AVAILABLE or MAINTENANCE may be set directly.';
  END IF;

  UPDATE rooms SET status = p_status WHERE id = p_room_id;

  IF ROW_COUNT() = 0 AND NOT EXISTS (SELECT 1 FROM rooms WHERE id = p_room_id) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Room not found.';
  END IF;
END//

-- -----------------------------------------------------------------------------
-- Availability search. Excludes rooms with overlapping CONFIRMED / CHECKED_IN /
-- non-expired PENDING reservations. Cancelled and checked-out stays never block.
-- -----------------------------------------------------------------------------
DROP PROCEDURE IF EXISTS sp_get_available_rooms//
CREATE PROCEDURE sp_get_available_rooms(
  IN p_check_in_date  DATE,
  IN p_check_out_date DATE,
  IN p_capacity       INT UNSIGNED
)
BEGIN
  IF p_check_out_date <= p_check_in_date THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Check-out date must be after check-in date.';
  END IF;

  SELECT
    ro.id  AS room_id,
    ro.room_number,
    ro.floor,
    rt.id  AS room_type_id,
    rt.name       AS room_type_name,
    rt.base_price AS price_per_night,
    rt.capacity,
    rt.amenities
  FROM rooms ro
  INNER JOIN room_types rt ON rt.id = ro.room_type_id
  WHERE ro.status <> 'INACTIVE'
    AND rt.is_active = 1
    AND (p_capacity IS NULL OR rt.capacity >= p_capacity)
    AND NOT EXISTS (
      SELECT 1
      FROM reservations res
      WHERE res.room_id = ro.id
        AND res.status IN ('CONFIRMED', 'CHECKED_IN')
        AND res.check_in_date  < p_check_out_date
        AND res.check_out_date > p_check_in_date
    )
    AND NOT EXISTS (
      SELECT 1
      FROM reservations res
      WHERE res.room_id = ro.id
        AND res.status = 'PENDING'
        AND res.check_in_date >= CURDATE()
        AND res.check_in_date  < p_check_out_date
        AND res.check_out_date > p_check_in_date
    )
  ORDER BY rt.base_price ASC, ro.room_number ASC;
END//

-- =============================================================================
-- RESERVATIONS
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Atomic reservation creation. Double-booking is prevented at the database
-- layer: the target room row is locked FOR UPDATE and overlapping active
-- reservations are detected inside the transaction.
-- -----------------------------------------------------------------------------
DROP PROCEDURE IF EXISTS sp_create_reservation//
CREATE PROCEDURE sp_create_reservation(
  IN  p_guest_id         INT UNSIGNED,
  IN  p_room_id          INT UNSIGNED,
  IN  p_check_in_date    DATE,
  IN  p_check_out_date   DATE,
  IN  p_special_requests VARCHAR(500),
  OUT p_reservation_id   INT UNSIGNED,
  OUT p_total_amount     DECIMAL(10, 2)
)
proc: BEGIN
  DECLARE v_room_status  VARCHAR(20);
  DECLARE v_price        DECIMAL(10, 2);
  DECLARE v_nights       INT;
  DECLARE v_conflict     INT DEFAULT 0;
  DECLARE v_guest_exists INT DEFAULT 0;

  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;

  -- Defensive validation at the database boundary as well as the API.
  IF p_check_out_date <= p_check_in_date THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Check-out date must be after check-in date.';
  END IF;

  IF p_check_in_date < CURDATE() THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Check-in date cannot be in the past.';
  END IF;

  SELECT COUNT(*) INTO v_guest_exists FROM guests WHERE id = p_guest_id;
  IF v_guest_exists = 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Guest not found.';
  END IF;

  START TRANSACTION;

  -- Row-level lock on the requested room serialises concurrent booking attempts.
  SELECT status INTO v_room_status
    FROM rooms
   WHERE id = p_room_id
   FOR UPDATE;

  IF v_room_status IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Room not found.';
  END IF;

  IF v_room_status = 'INACTIVE' THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'The room is inactive and cannot be reserved.';
  END IF;

  -- Overlap: existing_check_in < requested_check_out
  --        AND existing_check_out > requested_check_in
  SELECT COUNT(*) INTO v_conflict
    FROM reservations res
   WHERE res.room_id = p_room_id
     AND res.status IN ('CONFIRMED', 'CHECKED_IN')
     AND res.check_in_date  < p_check_out_date
     AND res.check_out_date > p_check_in_date
   FOR UPDATE;

  IF v_conflict = 0 THEN
    SELECT COUNT(*) INTO v_conflict
      FROM reservations res
     WHERE res.room_id = p_room_id
       AND res.status  = 'PENDING'
       AND res.check_in_date >= CURDATE()
       AND res.check_in_date  < p_check_out_date
       AND res.check_out_date > p_check_in_date
     FOR UPDATE;
  END IF;

  IF v_conflict > 0 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'The selected room is already reserved for those dates.';
  END IF;

  -- Total amount is always derived from the database price, never client input.
  SELECT rt.base_price INTO v_price
    FROM rooms ro
    INNER JOIN room_types rt ON rt.id = ro.room_type_id
   WHERE ro.id = p_room_id;

  SET v_nights  = fn_calculate_total_nights(p_check_in_date, p_check_out_date);
  SET p_total_amount = fn_calculate_room_charge(v_price, v_nights);

  INSERT INTO reservations (
    guest_id, room_id, check_in_date, check_out_date,
    status, total_amount, special_requests
  ) VALUES (
    p_guest_id, p_room_id, p_check_in_date, p_check_out_date,
    'PENDING', p_total_amount, p_special_requests
  );

  SET p_reservation_id = LAST_INSERT_ID();

  -- Attach the primary guest.
  INSERT INTO reservation_guests (reservation_id, guest_id)
  VALUES (p_reservation_id, p_guest_id);

  COMMIT;
END//

DROP PROCEDURE IF EXISTS sp_get_reservation_by_id//
CREATE PROCEDURE sp_get_reservation_by_id(IN p_reservation_id INT UNSIGNED)
BEGIN
  SELECT
    r.id,
    r.guest_id,
    r.room_id,
    r.check_in_date,
    r.check_out_date,
    r.status,
    r.total_amount,
    r.special_requests,
    r.created_at,
    CONCAT(g.first_name, ' ', g.last_name) AS guest_name,
    g.phone AS guest_phone,
    u.email AS guest_email,
    ro.room_number,
    ro.floor,
    rt.name AS room_type_name,
    fn_get_reservation_balance(r.id) AS balance,
    (SELECT COALESCE(SUM(p.amount), 0.00)
       FROM payments p
      WHERE p.reservation_id = r.id) AS paid_amount
  FROM reservations r
  INNER JOIN guests g      ON g.id  = r.guest_id
  INNER JOIN users u       ON u.id  = g.user_id
  INNER JOIN rooms ro      ON ro.id = r.room_id
  INNER JOIN room_types rt ON rt.id = ro.room_type_id
  WHERE r.id = p_reservation_id
  LIMIT 1;
END//

DROP PROCEDURE IF EXISTS sp_get_guest_reservations//
CREATE PROCEDURE sp_get_guest_reservations(IN p_guest_id INT UNSIGNED)
BEGIN
  SELECT
    r.id,
    r.room_id,
    r.check_in_date,
    r.check_out_date,
    r.status,
    r.total_amount,
    r.special_requests,
    r.created_at,
    ro.room_number,
    rt.name AS room_type_name,
    fn_get_reservation_balance(r.id) AS balance,
    (SELECT COALESCE(SUM(p.amount), 0.00)
       FROM payments p
      WHERE p.reservation_id = r.id) AS paid_amount
  FROM reservations r
  INNER JOIN rooms ro      ON ro.id = r.room_id
  INNER JOIN room_types rt ON rt.id = ro.room_type_id
  WHERE r.guest_id = p_guest_id
  ORDER BY r.created_at DESC;
END//

DROP PROCEDURE IF EXISTS sp_get_all_reservations//
CREATE PROCEDURE sp_get_all_reservations(
  IN p_status VARCHAR(20),
  IN p_limit  INT,
  IN p_offset INT
)
BEGIN
  SELECT
    r.id,
    r.guest_id,
    r.room_id,
    r.check_in_date,
    r.check_out_date,
    r.status,
    r.total_amount,
    r.special_requests,
    r.created_at,
    CONCAT(g.first_name, ' ', g.last_name) AS guest_name,
    g.phone AS guest_phone,
    ro.room_number,
    rt.name AS room_type_name,
    fn_get_reservation_balance(r.id) AS balance
  FROM reservations r
  INNER JOIN guests g      ON g.id  = r.guest_id
  INNER JOIN rooms ro      ON ro.id = r.room_id
  INNER JOIN room_types rt ON rt.id = ro.room_type_id
  WHERE (p_status IS NULL OR p_status = '' OR r.status = p_status)
  ORDER BY r.created_at DESC
  LIMIT p_offset, p_limit;
END//

DROP PROCEDURE IF EXISTS sp_get_active_reservations//
CREATE PROCEDURE sp_get_active_reservations()
BEGIN
  SELECT *
    FROM vw_active_reservations
   ORDER BY check_in_date ASC;
END//

DROP PROCEDURE IF EXISTS sp_confirm_reservation//
CREATE PROCEDURE sp_confirm_reservation(IN p_reservation_id INT UNSIGNED)
BEGIN
  DECLARE v_status        VARCHAR(20);
  DECLARE v_room_id       INT UNSIGNED;
  DECLARE v_check_in      DATE;
  DECLARE v_check_out     DATE;
  DECLARE v_room_status   VARCHAR(20);
  DECLARE v_conflict      INT DEFAULT 0;

  SELECT status, room_id, check_in_date, check_out_date
    INTO v_status, v_room_id, v_check_in, v_check_out
    FROM reservations
   WHERE id = p_reservation_id;

  IF v_status IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Reservation not found.';
  END IF;

  IF v_status <> 'PENDING' THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Only pending reservations can be confirmed.';
  END IF;

  -- Re-verify availability at confirmation time (excluding this reservation).
  SELECT COUNT(*) INTO v_conflict
    FROM reservations res
   WHERE res.room_id = v_room_id
     AND res.id <> p_reservation_id
     AND res.status IN ('CONFIRMED', 'CHECKED_IN')
     AND res.check_in_date  < v_check_out
     AND res.check_out_date > v_check_in;

  IF v_conflict > 0 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'The room is no longer available for these dates.';
  END IF;

  SELECT status INTO v_room_status FROM rooms WHERE id = v_room_id;

  IF v_room_status = 'INACTIVE' THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'The room has been deactivated and cannot be confirmed.';
  END IF;

  UPDATE reservations SET status = 'CONFIRMED' WHERE id = p_reservation_id;
END//

DROP PROCEDURE IF EXISTS sp_cancel_reservation//
CREATE PROCEDURE sp_cancel_reservation(IN p_reservation_id INT UNSIGNED)
BEGIN
  DECLARE v_status VARCHAR(20);

  SELECT status INTO v_status FROM reservations WHERE id = p_reservation_id;

  IF v_status IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Reservation not found.';
  END IF;

  IF v_status NOT IN ('PENDING', 'CONFIRMED') THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Only pending or confirmed reservations can be cancelled.';
  END IF;

  UPDATE reservations SET status = 'CANCELLED' WHERE id = p_reservation_id;
END//

-- -----------------------------------------------------------------------------
-- Check-in transaction: CONFIRMED -> CHECKED_IN, room -> OCCUPIED.
-- -----------------------------------------------------------------------------
DROP PROCEDURE IF EXISTS sp_check_in_guest//
CREATE PROCEDURE sp_check_in_guest(IN p_reservation_id INT UNSIGNED)
BEGIN
  DECLARE v_status      VARCHAR(20);
  DECLARE v_room_id     INT UNSIGNED;
  DECLARE v_check_in    DATE;
  DECLARE v_room_status VARCHAR(20);

  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;

  START TRANSACTION;

  SELECT status, room_id, check_in_date
    INTO v_status, v_room_id, v_check_in
    FROM reservations
   WHERE id = p_reservation_id
   FOR UPDATE;

  IF v_status IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Reservation not found.';
  END IF;

  IF v_status <> 'CONFIRMED' THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Only confirmed reservations can be checked in.';
  END IF;

  IF CURDATE() < v_check_in THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Reservation cannot be checked in before the arrival date.';
  END IF;

  SELECT status INTO v_room_status FROM rooms WHERE id = v_room_id FOR UPDATE;

  IF v_room_status <> 'AVAILABLE' THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'The room is not available for check-in.';
  END IF;

  -- Trigger trg_after_reservation_checkin syncs the room status to OCCUPIED.
  UPDATE reservations SET status = 'CHECKED_IN' WHERE id = p_reservation_id;

  COMMIT;
END//

-- -----------------------------------------------------------------------------
-- Check-out transaction: settle outstanding balance, CHECKED_IN -> CHECKED_OUT,
-- room -> MAINTENANCE. If an outstanding balance exists, a matching payment must
-- accompany the check-out or the transaction is rolled back.
-- -----------------------------------------------------------------------------
DROP PROCEDURE IF EXISTS sp_check_out_guest//
CREATE PROCEDURE sp_check_out_guest(
  IN  p_reservation_id   INT UNSIGNED,
  IN  p_payment_amount   DECIMAL(10, 2),
  IN  p_payment_method   VARCHAR(20),
  IN  p_received_by      INT UNSIGNED,
  OUT p_final_balance    DECIMAL(10, 2)
)
BEGIN
  DECLARE v_status  VARCHAR(20);
  DECLARE v_balance DECIMAL(10, 2);

  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;

  START TRANSACTION;

  SELECT status INTO v_status
    FROM reservations
   WHERE id = p_reservation_id
   FOR UPDATE;

  IF v_status IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Reservation not found.';
  END IF;

  IF v_status <> 'CHECKED_IN' THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Only checked-in stays can be checked out.';
  END IF;

  SET v_balance = fn_get_reservation_balance(p_reservation_id);

  IF p_payment_amount IS NULL THEN
    SET p_payment_amount = 0.00;
  END IF;

  IF p_payment_amount > 0.00 THEN
    IF p_payment_amount < v_balance - 0.005 THEN
      SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Payment does not cover the outstanding balance.';
    END IF;

    IF p_payment_amount > v_balance + 0.005 THEN
      SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Payment exceeds the outstanding balance.';
    END IF;

    IF p_payment_method IS NULL OR TRIM(p_payment_method) = '' THEN
      SET p_payment_method = 'CASH';
    END IF;

    INSERT INTO payments (reservation_id, amount, payment_method, received_by)
    VALUES (p_reservation_id, p_payment_amount, p_payment_method, p_received_by);
  END IF;

  -- Recompute after any payment inserted above.
  SET v_balance = fn_get_reservation_balance(p_reservation_id);
  SET p_final_balance = v_balance;

  IF v_balance > 0.005 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Outstanding balance must be settled before check-out.';
  END IF;

  -- Trigger trg_after_reservation_checkout syncs the room to MAINTENANCE.
  UPDATE reservations SET status = 'CHECKED_OUT' WHERE id = p_reservation_id;

  COMMIT;
END//

-- =============================================================================
-- PAYMENTS
-- =============================================================================

DROP PROCEDURE IF EXISTS sp_create_payment//
CREATE PROCEDURE sp_create_payment(
  IN  p_reservation_id       INT UNSIGNED,
  IN  p_amount               DECIMAL(10, 2),
  IN  p_payment_method       VARCHAR(20),
  IN  p_transaction_reference VARCHAR(100),
  IN  p_received_by          INT UNSIGNED,
  OUT p_payment_id           INT UNSIGNED
)
BEGIN
  DECLARE v_status VARCHAR(20);

  SELECT status INTO v_status FROM reservations WHERE id = p_reservation_id;

  IF v_status IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Reservation not found.';
  END IF;

  IF v_status = 'CANCELLED' THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Payments cannot be recorded for cancelled reservations.';
  END IF;

  IF p_amount <= 0 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Payment amount must be greater than zero.';
  END IF;

  IF p_payment_method NOT IN ('CASH', 'CARD', 'MOBILE_TRANSFER', 'BANK_TRANSFER') THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invalid payment method.';
  END IF;

  INSERT INTO payments (reservation_id, amount, payment_method, transaction_reference, received_by)
  VALUES (p_reservation_id, p_amount, p_payment_method, p_transaction_reference, p_received_by);

  SET p_payment_id = LAST_INSERT_ID();
END//

DROP PROCEDURE IF EXISTS sp_get_payments_by_reservation//
CREATE PROCEDURE sp_get_payments_by_reservation(IN p_reservation_id INT UNSIGNED)
BEGIN
  SELECT
    p.id,
    p.reservation_id,
    p.amount,
    p.payment_method,
    p.transaction_reference,
    p.payment_date,
    p.received_by,
    CONCAT(u.first_name, ' ', u.last_name) AS received_by_name
  FROM payments p
  LEFT JOIN users u ON u.id = p.received_by
  WHERE p.reservation_id = p_reservation_id
  ORDER BY p.payment_date DESC;
END//

DROP PROCEDURE IF EXISTS sp_get_all_payments//
CREATE PROCEDURE sp_get_all_payments(IN p_limit INT, IN p_offset INT)
BEGIN
  SELECT
    p.id,
    p.amount,
    p.payment_method,
    p.transaction_reference,
    p.payment_date,
    p.reservation_id,
    r.status AS reservation_status,
    CONCAT(g.first_name, ' ', g.last_name) AS guest_name,
    ro.room_number
  FROM payments p
  INNER JOIN reservations r ON r.id = p.reservation_id
  INNER JOIN guests g ON g.id = r.guest_id
  INNER JOIN rooms ro ON ro.id = r.room_id
  ORDER BY p.payment_date DESC
  LIMIT p_offset, p_limit;
END//

-- =============================================================================
-- HOTEL SERVICES & SERVICE ORDERS
-- =============================================================================

DROP PROCEDURE IF EXISTS sp_get_services//
CREATE PROCEDURE sp_get_services(IN p_include_inactive TINYINT)
BEGIN
  SELECT id, name, description, price, is_active
    FROM services
   WHERE p_include_inactive = 1 OR is_active = 1
   ORDER BY name ASC;
END//

DROP PROCEDURE IF EXISTS sp_create_service//
CREATE PROCEDURE sp_create_service(
  IN  p_name        VARCHAR(100),
  IN  p_description VARCHAR(500),
  IN  p_price       DECIMAL(10, 2),
  OUT p_service_id  INT UNSIGNED
)
BEGIN
  IF p_price < 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Service price cannot be negative.';
  END IF;

  INSERT INTO services (name, description, price)
  VALUES (p_name, p_description, p_price);

  SET p_service_id = LAST_INSERT_ID();
END//

DROP PROCEDURE IF EXISTS sp_update_service//
CREATE PROCEDURE sp_update_service(
  IN p_service_id INT UNSIGNED,
  IN p_description VARCHAR(500),
  IN p_price       DECIMAL(10, 2),
  IN p_is_active   TINYINT
)
BEGIN
  IF p_price < 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Service price cannot be negative.';
  END IF;

  UPDATE services
     SET description = p_description,
         price       = p_price,
         is_active   = p_is_active
   WHERE id = p_service_id;

  IF ROW_COUNT() = 0 AND NOT EXISTS (SELECT 1 FROM services WHERE id = p_service_id) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Service not found.';
  END IF;
END//

DROP PROCEDURE IF EXISTS sp_place_service_order//
CREATE PROCEDURE sp_place_service_order(
  IN  p_reservation_id INT UNSIGNED,
  IN  p_service_id     INT UNSIGNED,
  IN  p_quantity       INT UNSIGNED,
  OUT p_order_id       INT UNSIGNED
)
BEGIN
  DECLARE v_status   VARCHAR(20);
  DECLARE v_price    DECIMAL(10, 2);
  DECLARE v_order_id INT UNSIGNED;

  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;

  IF p_quantity IS NULL OR p_quantity < 1 THEN
    SET p_quantity = 1;
  END IF;

  START TRANSACTION;

  SELECT status INTO v_status
    FROM reservations
   WHERE id = p_reservation_id
   FOR UPDATE;

  IF v_status IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Reservation not found.';
  END IF;

  IF v_status NOT IN ('CONFIRMED', 'CHECKED_IN') THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Services can only be ordered for active stays.';
  END IF;

  SELECT price INTO v_price
    FROM services
   WHERE id = p_service_id AND is_active = 1;

  IF v_price IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Service not found or inactive.';
  END IF;

  -- Reuse an existing open order for the reservation when possible.
  SELECT id INTO v_order_id
    FROM service_orders
   WHERE reservation_id = p_reservation_id AND status = 'ORDERED'
   ORDER BY id ASC
   LIMIT 1
   FOR UPDATE;

  IF v_order_id IS NULL THEN
    INSERT INTO service_orders (reservation_id, status, total_amount)
    VALUES (p_reservation_id, 'ORDERED', 0.00);
    SET v_order_id = LAST_INSERT_ID();
  END IF;

  IF EXISTS (
    SELECT 1 FROM service_order_items
    WHERE service_order_id = v_order_id AND service_id = p_service_id
  ) THEN
    -- Combine line quantities for the same service within the same open order.
    UPDATE service_order_items
       SET quantity = quantity + p_quantity,
           subtotal = ROUND((quantity + p_quantity) * unit_price, 2)
     WHERE service_order_id = v_order_id AND service_id = p_service_id;
  ELSE
    INSERT INTO service_order_items (service_order_id, service_id, quantity, unit_price, subtotal)
    VALUES (v_order_id, p_service_id, p_quantity, v_price, ROUND(v_price * p_quantity, 2));
  END IF;

  UPDATE service_orders so
     SET so.total_amount = (
       SELECT COALESCE(SUM(soi.subtotal), 0.00)
         FROM service_order_items soi
        WHERE soi.service_order_id = v_order_id
     )
   WHERE so.id = v_order_id;

  SET p_order_id = v_order_id;

  COMMIT;
END//

DROP PROCEDURE IF EXISTS sp_get_service_orders//
CREATE PROCEDURE sp_get_service_orders(IN p_reservation_id INT UNSIGNED)
BEGIN
  SELECT
    so.id          AS order_id,
    so.order_date,
    so.status      AS order_status,
    so.total_amount,
    soi.id         AS item_id,
    soi.quantity,
    soi.unit_price,
    soi.subtotal,
    sv.name        AS service_name
  FROM service_orders so
  LEFT JOIN service_order_items soi ON soi.service_order_id = so.id
  LEFT JOIN services sv ON sv.id = soi.service_id
  WHERE so.reservation_id = p_reservation_id
  ORDER BY so.order_date DESC, soi.id ASC;
END//

DROP PROCEDURE IF EXISTS sp_get_all_service_orders//
CREATE PROCEDURE sp_get_all_service_orders()
BEGIN
  SELECT
    so.id          AS order_id,
    so.id          AS id,
    so.reservation_id,
    rm.room_number,
    CONCAT(g.first_name, ' ', g.last_name) AS guest_name,
    so.order_date,
    so.status      AS order_status,
    so.status      AS status,
    so.total_amount,
    soi.id         AS item_id,
    soi.quantity,
    soi.unit_price,
    soi.subtotal,
    sv.id          AS service_id,
    sv.name        AS service_name
  FROM service_orders so
  JOIN reservations r ON r.id = so.reservation_id
  JOIN guests g ON g.id = r.guest_id
  JOIN rooms rm ON rm.id = r.room_id
  LEFT JOIN service_order_items soi ON soi.service_order_id = so.id
  LEFT JOIN services sv ON sv.id = soi.service_id
  ORDER BY so.order_date DESC, so.id DESC;
END//

DROP PROCEDURE IF EXISTS sp_update_service_order_status//
CREATE PROCEDURE sp_update_service_order_status(
  IN p_order_id INT UNSIGNED,
  IN p_status VARCHAR(20)
)
BEGIN
  UPDATE service_orders
     SET status = p_status
   WHERE id = p_order_id;
END//

-- =============================================================================
-- REPORTS & DASHBOARD
-- =============================================================================

DROP PROCEDURE IF EXISTS sp_get_dashboard_summary//
CREATE PROCEDURE sp_get_dashboard_summary()
BEGIN
  SELECT
    (SELECT COUNT(*) FROM rooms)                          AS total_rooms,
    (SELECT COUNT(*) FROM rooms WHERE status = 'AVAILABLE')    AS available_rooms,
    (SELECT COUNT(*) FROM rooms WHERE status = 'OCCUPIED')     AS occupied_rooms,
    (SELECT COUNT(*) FROM rooms WHERE status = 'MAINTENANCE')  AS maintenance_rooms,
    (SELECT COUNT(*) FROM rooms WHERE status = 'INACTIVE')     AS inactive_rooms,

    (SELECT COUNT(*) FROM reservations
      WHERE status IN ('CONFIRMED', 'CHECKED_IN'))         AS active_reservations,

    (SELECT COUNT(*) FROM reservations
      WHERE check_in_date = CURDATE()
        AND status IN ('CONFIRMED', 'CHECKED_IN'))         AS today_checkins,

    (SELECT COUNT(*) FROM reservations
      WHERE check_out_date = CURDATE()
        AND status IN ('CHECKED_IN', 'CHECKED_OUT'))       AS today_checkouts,

    (SELECT COALESCE(SUM(amount), 0.00) FROM payments
      WHERE DATE_FORMAT(payment_date, '%Y-%m') = DATE_FORMAT(CURDATE(), '%Y-%m'))
                                                           AS monthly_revenue,

    ROUND(
      CASE
        WHEN (SELECT COUNT(*) FROM rooms WHERE status <> 'INACTIVE') = 0 THEN 0
        ELSE (SELECT COUNT(*) FROM rooms WHERE status = 'OCCUPIED') * 100.0
             / (SELECT COUNT(*) FROM rooms WHERE status <> 'INACTIVE')
      END, 2
    )                                                      AS occupancy_rate;
END//

DROP PROCEDURE IF EXISTS sp_get_daily_reservations_report//
CREATE PROCEDURE sp_get_daily_reservations_report(IN p_report_date DATE)
BEGIN
  SELECT
    r.id                AS reservation_id,
    r.status,
    r.check_in_date,
    r.check_out_date,
    CONCAT(g.first_name, ' ', g.last_name) AS guest_name,
    g.phone             AS guest_phone,
    ro.room_number,
    rt.name             AS room_type_name,
    r.total_amount,
    CASE
      WHEN r.check_in_date = p_report_date THEN 'ARRIVAL'
      ELSE 'DEPARTURE'
    END AS event_type
  FROM reservations r
  INNER JOIN guests g      ON g.id  = r.guest_id
  INNER JOIN rooms ro      ON ro.id = r.room_id
  INNER JOIN room_types rt ON rt.id = ro.room_type_id
  WHERE (r.check_in_date = p_report_date AND r.status IN ('PENDING', 'CONFIRMED', 'CHECKED_IN'))
     OR (r.check_out_date = p_report_date AND r.status IN ('CHECKED_IN', 'CHECKED_OUT'))
  ORDER BY event_type ASC, ro.room_number ASC;
END//

DROP PROCEDURE IF EXISTS sp_get_monthly_revenue_report//
CREATE PROCEDURE sp_get_monthly_revenue_report(
  IN p_year  INT,
  IN p_month INT
)
BEGIN
  SELECT
    COUNT(*)                    AS payment_count,
    COALESCE(SUM(p.amount), 0.00)                     AS total_revenue,
    COALESCE(SUM(CASE WHEN p.payment_method = 'CASH' THEN p.amount ELSE 0 END), 0.00)  AS cash_revenue,
    COALESCE(SUM(CASE WHEN p.payment_method = 'CARD' THEN p.amount ELSE 0 END), 0.00)   AS card_revenue,
    COALESCE(SUM(CASE WHEN p.payment_method = 'MOBILE_TRANSFER' THEN p.amount ELSE 0 END), 0.00) AS mobile_revenue,
    COALESCE(SUM(CASE WHEN p.payment_method = 'BANK_TRANSFER' THEN p.amount ELSE 0 END), 0.00)  AS bank_revenue,
    COALESCE(ROUND(AVG(p.amount), 2), 0.00)           AS average_payment,
    COUNT(DISTINCT p.reservation_id)                  AS paying_reservations
  FROM payments p
  WHERE YEAR(p.payment_date)  = p_year
    AND MONTH(p.payment_date) = p_month;
END//

DROP PROCEDURE IF EXISTS sp_get_occupancy_report//
CREATE PROCEDURE sp_get_occupancy_report(
  IN p_start_date DATE,
  IN p_end_date   DATE
)
BEGIN
  DECLARE v_period_nights      INT;
  DECLARE v_operational_rooms  INT;
  DECLARE v_occupied_nights    INT;

  IF p_end_date <= p_start_date THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'End date must be after the start date.';
  END IF;

  SELECT DATEDIFF(p_end_date, p_start_date) INTO v_period_nights;

  SELECT COUNT(*) INTO v_operational_rooms
    FROM rooms
   WHERE status <> 'INACTIVE';

  -- Nights each active stay overlaps the requested window.
  SELECT COALESCE(SUM(
           DATEDIFF(
             LEAST(p_end_date, res.check_out_date),
             GREATEST(p_start_date, res.check_in_date)
           )
         ), 0)
    INTO v_occupied_nights
    FROM reservations res
   WHERE res.status IN ('CONFIRMED', 'CHECKED_IN')
     AND res.check_in_date  < p_end_date
     AND res.check_out_date > p_start_date;

  SELECT
    p_start_date     AS start_date,
    p_end_date       AS end_date,
    v_period_nights  AS period_nights,
    v_operational_rooms          AS operational_rooms,
    v_operational_rooms * v_period_nights AS potential_room_nights,
    v_occupied_nights            AS occupied_room_nights,
    ROUND(
      CASE WHEN v_operational_rooms * v_period_nights = 0 THEN 0
           ELSE v_occupied_nights * 100.0 / (v_operational_rooms * v_period_nights)
      END, 2
    ) AS occupancy_rate;
END//

-- =============================================================================
-- ROOM ISSUES & MAINTENANCE
-- =============================================================================

DROP PROCEDURE IF EXISTS sp_create_room_issue//
CREATE PROCEDURE sp_create_room_issue(
  IN p_reservation_id INT UNSIGNED,
  IN p_room_id INT UNSIGNED,
  IN p_guest_id INT UNSIGNED,
  IN p_category VARCHAR(50),
  IN p_priority VARCHAR(20),
  IN p_description TEXT,
  OUT p_issue_id INT UNSIGNED
)
BEGIN
  INSERT INTO room_issues (reservation_id, room_id, guest_id, category, priority, description, status)
  VALUES (p_reservation_id, p_room_id, p_guest_id, p_category, p_priority, p_description, 'OPEN');

  SET p_issue_id = LAST_INSERT_ID();
END//

DROP PROCEDURE IF EXISTS sp_get_room_issues//
CREATE PROCEDURE sp_get_room_issues(IN p_reservation_id INT UNSIGNED)
BEGIN
  SELECT
    ri.id,
    ri.reservation_id,
    ri.room_id,
    ri.guest_id,
    rm.room_number,
    rt.name        AS room_type_name,
    CONCAT(g.first_name, ' ', g.last_name) AS guest_name,
    g.phone        AS guest_phone,
    ri.category,
    ri.priority,
    ri.description,
    ri.status,
    ri.resolution_notes,
    ri.created_at,
    ri.resolved_at
  FROM room_issues ri
  JOIN rooms rm ON rm.id = ri.room_id
  LEFT JOIN room_types rt ON rt.id = rm.room_type_id
  LEFT JOIN reservations r ON r.id = ri.reservation_id
  LEFT JOIN guests g ON g.id = COALESCE(ri.guest_id, r.guest_id)
  WHERE (p_reservation_id IS NULL OR ri.reservation_id = p_reservation_id)
  ORDER BY
    CASE ri.status
      WHEN 'OPEN' THEN 1
      WHEN 'IN_PROGRESS' THEN 2
      WHEN 'RESOLVED' THEN 3
      ELSE 4
    END,
    ri.created_at DESC;
END//

DROP PROCEDURE IF EXISTS sp_update_room_issue_status//
CREATE PROCEDURE sp_update_room_issue_status(
  IN p_issue_id INT UNSIGNED,
  IN p_status VARCHAR(20),
  IN p_resolution_notes TEXT
)
BEGIN
  UPDATE room_issues
     SET status = p_status,
         resolution_notes = COALESCE(p_resolution_notes, resolution_notes),
         resolved_at = CASE WHEN p_status = 'RESOLVED' THEN CURRENT_TIMESTAMP ELSE resolved_at END
   WHERE id = p_issue_id;
END//

DELIMITER ;
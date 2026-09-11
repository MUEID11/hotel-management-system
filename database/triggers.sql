-- =============================================================================
-- Hotel Management System - Triggers
-- -----------------------------------------------------------------------------
-- Execute after schema.sql in MySQL Workbench.
-- Triggers are used only for automatic status consistency and the audit trail.
-- Critical business validation lives in the stored procedures instead.
-- =============================================================================

USE hotel_management;

DROP TRIGGER IF EXISTS trg_after_reservation_checkin;
DROP TRIGGER IF EXISTS trg_after_reservation_checkout;
DROP TRIGGER IF EXISTS trg_reservations_audit_insert;
DROP TRIGGER IF EXISTS trg_reservations_audit_update;

DELIMITER //

-- -----------------------------------------------------------------------------
-- trg_after_reservation_checkin: when a reservation moves to CHECKED_IN the
-- associated room transitions to OCCUPIED automatically.
-- -----------------------------------------------------------------------------
CREATE TRIGGER trg_after_reservation_checkin
AFTER UPDATE ON reservations
FOR EACH ROW
BEGIN
  IF NEW.status = 'CHECKED_IN' AND OLD.status <> 'CHECKED_IN' THEN
    UPDATE rooms
       SET status = 'OCCUPIED'
     WHERE id = NEW.room_id;
  END IF;
END//

-- -----------------------------------------------------------------------------
-- trg_after_reservation_checkout: when a reservation moves to CHECKED_OUT the
-- associated room transitions to MAINTENANCE (cleaning required).
-- -----------------------------------------------------------------------------
CREATE TRIGGER trg_after_reservation_checkout
AFTER UPDATE ON reservations
FOR EACH ROW
BEGIN
  IF NEW.status = 'CHECKED_OUT' AND OLD.status <> 'CHECKED_OUT' THEN
    UPDATE rooms
       SET status = 'MAINTENANCE'
     WHERE id = NEW.room_id;
  END IF;
END//

-- -----------------------------------------------------------------------------
-- Audit trail triggers for reservations.
-- -----------------------------------------------------------------------------
CREATE TRIGGER trg_reservations_audit_insert
AFTER INSERT ON reservations
FOR EACH ROW
BEGIN
  INSERT INTO audit_log (table_name, record_id, action, details)
  VALUES ('reservations', NEW.id, 'INSERT',
          CONCAT('Reservation created for room ', NEW.room_id,
                 ' ', DATE_FORMAT(NEW.check_in_date, '%Y-%m-%d'),
                 ' -> ', DATE_FORMAT(NEW.check_out_date, '%Y-%m-%d')));
END//

CREATE TRIGGER trg_reservations_audit_update
AFTER UPDATE ON reservations
FOR EACH ROW
BEGIN
  IF OLD.status <> NEW.status THEN
    INSERT INTO audit_log (table_name, record_id, action, details)
    VALUES ('reservations', NEW.id, 'UPDATE',
            CONCAT('Status changed from ', OLD.status, ' to ', NEW.status));
  END IF;
END//

DELIMITER ;
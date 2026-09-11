import { callProcedure, callProcedureWithOut } from './procedureRunner.js';

export async function createReservationService(reservationData) {
  return callProcedureWithOut(
    'sp_create_reservation',
    [
      reservationData.guestId,
      reservationData.roomId,
      reservationData.checkInDate,
      reservationData.checkOutDate,
      reservationData.specialRequests ?? null,
    ],
    ['reservation_id', 'total_amount']
  );
}

export async function getReservationByIdService(reservationId) {
  const rows = await callProcedure('sp_get_reservation_by_id', [reservationId]);
  return rows.length > 0 ? rows[0] : null;
}

export async function getGuestReservationsService(guestId) {
  return callProcedure('sp_get_guest_reservations', [guestId]);
}

export async function getAllReservationsService(status = null, limit = 100, offset = 0) {
  return callProcedure('sp_get_all_reservations', [status, limit, offset]);
}

export async function getActiveReservationsService() {
  return callProcedure('sp_get_active_reservations');
}

export async function confirmReservationService(reservationId) {
  await callProcedure('sp_confirm_reservation', [reservationId]);
}

export async function cancelReservationService(reservationId) {
  await callProcedure('sp_cancel_reservation', [reservationId]);
}

export async function checkInGuestService(reservationId) {
  await callProcedure('sp_check_in_guest', [reservationId]);
  return getReservationByIdService(reservationId);
}

export async function checkOutGuestService(reservationId, paymentAmount, paymentMethod, receivedBy) {
  return callProcedureWithOut(
    'sp_check_out_guest',
    [reservationId, paymentAmount, paymentMethod, receivedBy],
    ['final_balance']
  );
}
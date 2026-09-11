import { callProcedure, callProcedureWithOut } from './procedureRunner.js';

export async function createPaymentService(paymentData) {
  const result = await callProcedureWithOut(
    'sp_create_payment',
    [
      paymentData.reservationId,
      paymentData.amount,
      paymentData.paymentMethod,
      paymentData.transactionReference ?? null,
      paymentData.receivedBy ?? null,
    ],
    ['payment_id']
  );

  return { paymentId: Number(result.payment_id) };
}

export async function getPaymentsByReservationService(reservationId) {
  return callProcedure('sp_get_payments_by_reservation', [reservationId]);
}

export async function getAllPaymentsService(limit = 100, offset = 0) {
  return callProcedure('sp_get_all_payments', [limit, offset]);
}
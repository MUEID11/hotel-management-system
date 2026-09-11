import { apiGet, apiPost } from './apiClient.js';

export function recordPayment(paymentData) {
  return apiPost('/payments', paymentData);
}

export const createPaymentApi = recordPayment;

export function fetchPaymentLogs(params = {}) {
  return apiGet('/payments', params);
}

export function fetchPaymentsForReservation(reservationId) {
  return apiGet(`/payments/reservation/${reservationId}`);
}

export const fetchPaymentsByReservation = fetchPaymentsForReservation;
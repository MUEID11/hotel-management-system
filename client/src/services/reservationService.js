import { apiGet, apiPost, apiPut } from './apiClient.js';

export function fetchReservations(params = {}) {
  const query = typeof params === 'string' ? { status: params } : params;
  return apiGet('/reservations', query);
}

export function fetchMyReservations() {
  return apiGet('/reservations/my');
}

export function fetchActiveReservations() {
  return apiGet('/reservations/active');
}

export function fetchReservationById(reservationId) {
  return apiGet(`/reservations/${reservationId}`);
}

export function createReservation(reservationData) {
  return apiPost('/reservations', reservationData);
}

export const createReservationApi = createReservation;

export function confirmReservation(reservationId) {
  return apiPut(`/reservations/${reservationId}/confirm`);
}

export const confirmReservationApi = confirmReservation;

export function cancelReservation(reservationId) {
  return apiPut(`/reservations/${reservationId}/cancel`);
}

export const cancelReservationApi = cancelReservation;

export function checkInReservation(reservationId) {
  return apiPost(`/reservations/${reservationId}/check-in`);
}

export const checkInGuestApi = checkInReservation;

export function checkOutReservation(reservationId, paymentData = {}) {
  return apiPost(`/reservations/${reservationId}/check-out`, {
    paymentAmount: paymentData.amount ?? 0,
    paymentMethod: paymentData.method ?? null,
  });
}

export const checkOutGuestApi = (id) => checkOutReservation(id);

export function fetchPaymentsForReservation(reservationId) {
  return apiGet(`/payments/reservation/${reservationId}`);
}

export function fetchServiceOrdersForReservation(reservationId) {
  return apiGet(`/service-orders/reservation/${reservationId}`);
}
import { apiGet, apiPost, apiPut } from './apiClient.js';

export function fetchGuests(params = {}) {
  return apiGet('/guests', params);
}

export function fetchGuestById(guestId) {
  return apiGet(`/guests/${guestId}`);
}

export function registerWalkInGuest(guestData) {
  return apiPost('/guests', guestData);
}

export const createGuestApi = registerWalkInGuest;

export function updateGuestProfile(guestId, guestData) {
  return apiPut(`/guests/${guestId}`, guestData);
}

export const updateGuestApi = updateGuestProfile;
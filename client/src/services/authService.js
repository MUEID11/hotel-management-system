import { apiGet, apiPost } from './apiClient.js';

export async function registerGuest(guestData) {
  return apiPost('/auth/register', guestData, false);
}

export async function loginUser(credentials) {
  return apiPost('/auth/login', credentials, false);
}

export async function fetchCurrentUser() {
  return apiGet('/auth/me');
}

export const registerApi = registerGuest;
export const loginApi = (email, password) => loginUser({ email, password });
export const getMeApi = fetchCurrentUser;
// Lightweight fetch wrapper handling JSON, JWT headers, and structured errors.
// All endpoints call the Express API which in turn invokes MySQL stored
// procedures exclusively.

export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api';
export const TOKEN_STORAGE_KEY = 'hms_token';

export class ApiError extends Error {
  constructor(message, status, errors = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

function buildHeaders(includeAuth) {
  const headers = { 'Content-Type': 'application/json' };
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  if (includeAuth && token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

export async function apiRequest(
  path,
  { method = 'GET', body, auth = true, params } = {}
) {
  let queryString = '';
  if (params && typeof params === 'object') {
    const cleanEntries = Object.entries(params).filter(
      ([, val]) => val !== undefined && val !== null && val !== ''
    );
    if (cleanEntries.length > 0) {
      queryString = `?${new URLSearchParams(Object.fromEntries(cleanEntries)).toString()}`;
    }
  }

  const response = await fetch(`${API_URL}${path}${queryString}`, {
    method,
    headers: buildHeaders(auth),
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  let payload = null;
  try {
    payload = (await response.json()) ?? null;
  } catch {
    // Response was not JSON; payload stays null.
  }

  if (!response.ok) {
    throw new ApiError(
      payload?.message ?? 'The request could not be completed.',
      response.status,
      payload?.errors ?? null
    );
  }

  return payload?.data ?? payload;
}

export async function apiGet(path, params, auth = true) {
  return apiRequest(path, { method: 'GET', params, auth });
}

export async function apiPost(path, body, auth = true) {
  return apiRequest(path, { method: 'POST', body, auth });
}

export async function apiPut(path, body, auth = true) {
  return apiRequest(path, { method: 'PUT', body, auth });
}

export async function apiDelete(path, auth = true) {
  return apiRequest(path, { method: 'DELETE', auth });
}
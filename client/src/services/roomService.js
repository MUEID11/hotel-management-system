import { apiDelete, apiGet, apiPost, apiPut } from './apiClient.js';

export function fetchRooms(params) {
  const query = typeof params === 'string' ? (params ? { status: params } : {}) : params;
  return apiGet('/rooms', query, false);
}

export function fetchRoomById(roomId) {
  return apiGet(`/rooms/${roomId}`, null, false);
}

export function fetchAvailableRooms(arg1, arg2, arg3) {
  if (typeof arg1 === 'object' && arg1 !== null) {
    return apiGet('/rooms/available', arg1, false);
  }
  return apiGet('/rooms/available', { checkIn: arg1, checkOut: arg2, capacity: arg3 }, false);
}

export function createRoom(roomData) {
  return apiPost('/rooms', roomData);
}

export const createRoomApi = createRoom;

export function updateRoom(roomId, roomData) {
  return apiPut(`/rooms/${roomId}`, roomData);
}

export const updateRoomApi = updateRoom;

export function updateRoomStatus(roomId, status) {
  return apiPut(`/rooms/${roomId}/status`, { status });
}

export function deactivateRoom(roomId) {
  return apiDelete(`/rooms/${roomId}`);
}

export const deactivateRoomApi = deactivateRoom;

export function fetchRoomTypes(includeInactive = false) {
  return apiGet('/rooms/types', null, includeInactive);
}

export function createRoomType(roomTypeData) {
  return apiPost('/rooms/types', roomTypeData);
}

export function updateRoomType(roomTypeId, roomTypeData) {
  return apiPut(`/rooms/types/${roomTypeId}`, roomTypeData);
}
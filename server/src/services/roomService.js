import { callProcedure } from './procedureRunner.js';

export async function createRoomTypeService(typeData) {
  return callProcedure('sp_create_room_type', [
    typeData.name,
    typeData.description,
    typeData.basePrice,
    typeData.capacity,
    typeData.amenities,
  ]);
}

export async function getRoomTypesService(includeInactive = 0) {
  return callProcedure('sp_get_room_types', [includeInactive]);
}

export async function updateRoomTypeService(roomType) {
  await callProcedure('sp_update_room_type', [
    roomType.roomTypeId,
    roomType.name,
    roomType.description,
    roomType.basePrice,
    roomType.capacity,
    roomType.amenities,
    roomType.isActive,
  ]);
}

export async function createRoomService(roomData) {
  return callProcedure('sp_create_room', [
    roomData.roomNumber,
    roomData.roomTypeId,
    roomData.floor,
    roomData.description,
  ]);
}

export async function getRoomsService(status = null, roomTypeId = null) {
  return callProcedure('sp_get_rooms', [status, roomTypeId]);
}

export async function getRoomByIdService(roomId) {
  const rows = await callProcedure('sp_get_room_by_id', [roomId]);
  return rows.length > 0 ? rows[0] : null;
}

export async function updateRoomService(roomId, roomData) {
  await callProcedure('sp_update_room', [
    roomId,
    roomData.roomTypeId,
    roomData.floor,
    roomData.status,
    roomData.description,
  ]);
}

export async function deactivateRoomService(roomId) {
  await callProcedure('sp_deactivate_room', [roomId]);
}

export async function setRoomStatusService(roomId, status) {
  await callProcedure('sp_set_room_status', [roomId, status]);
}

export async function getAvailableRoomsService(checkIn, checkOut, capacity = null) {
  return callProcedure('sp_get_available_rooms', [checkIn, checkOut, capacity]);
}
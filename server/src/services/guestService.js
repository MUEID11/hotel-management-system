import { callProcedure, callProcedureWithOut } from './procedureRunner.js';

export async function getAllGuestsService(limit, offset) {
  return callProcedure('sp_get_all_guests', [limit, offset]);
}

export async function getGuestByIdService(guestId) {
  const rows = await callProcedure('sp_get_guest_by_id', [guestId]);
  return rows.length > 0 ? rows[0] : null;
}

export async function getGuestByUserIdService(userId) {
  const rows = await callProcedure('sp_get_guest_by_user_id', [userId]);
  return rows.length > 0 ? rows[0] : null;
}

export async function createGuestForUserService({
  userId,
  firstName,
  lastName,
  phone = null,
  idCard = null,
}) {
  const result = await callProcedureWithOut(
    'sp_create_guest',
    [userId, firstName, lastName, phone, idCard],
    ['guest_id']
  );
  return {
    guestId: Number(result.guest_id),
    guest_id: Number(result.guest_id),
    id: Number(result.guest_id),
  };
}

export async function updateGuestService(guestId, firstName, lastName, phone) {
  await callProcedure('sp_update_guest', [guestId, firstName, lastName, phone]);
}

export const getGuestByUserId = getGuestByUserIdService;
export const getGuestById = getGuestByIdService;
export const getAllGuests = getAllGuestsService;
export const createGuest = createGuestForUserService;
import { callProcedure } from './procedureRunner.js';

export async function getAllStaffService(limit = 100, offset = 0) {
  return callProcedure('sp_get_all_staff', [limit, offset]);
}

export async function deactivateStaffUserService(userId) {
  await callProcedure('sp_deactivate_staff_user', [userId]);
}
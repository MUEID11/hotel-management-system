import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {
  JWT_EXPIRES_IN,
  JWT_SECRET,
  ROLES,
} from '../utils/constants.js';
import { AppError } from '../utils/errors.js';
import {
  callProcedure,
  callProcedureWithOut,
} from './procedureRunner.js';

export function hashPassword(plainPassword) {
  return bcrypt.hash(plainPassword, 10);
}

export async function registerGuestService({
  email,
  password,
  firstName,
  lastName,
  phone,
  idCard = null,
}) {
  const passwordHash = await hashPassword(password);

  const result = await callProcedureWithOut(
    'sp_register_guest',
    [email, passwordHash, firstName, lastName, phone, idCard],
    ['user_id', 'guest_id']
  );

  return {
    userId: Number(result.user_id),
    guestId: Number(result.guest_id),
  };
}

export async function createStaffUserService({
  email,
  password,
  roleId,
  firstName,
  lastName,
  phone,
  position = null,
}) {
  const passwordHash = await hashPassword(password);

  const result = await callProcedureWithOut(
    'sp_create_staff_user',
    [email, passwordHash, roleId, firstName, lastName, phone, position],
    ['user_id', 'staff_id']
  );

  return {
    userId: Number(result.user_id),
    staffId: Number(result.staff_id),
  };
}

export async function getUserByEmailService(email) {
  const rows = await callProcedure('sp_get_user_by_email', [email]);
  return rows.length > 0 ? rows[0] : null;
}

export async function getUserByIdService(userId) {
  const rows = await callProcedure('sp_get_user_by_id', [userId]);
  return rows.length > 0 ? rows[0] : null;
}

export async function getUserProfileService(userId) {
  const rows = await callProcedure('sp_get_user_profile', [userId]);
  return rows.length > 0 ? rows[0] : null;
}

export function signAccessToken(user) {
  const payload = {
    userId: user.id || user.userId,
    email: user.email,
    role: user.role_name || user.role,
    guestId: user.guestId ?? user.guest_id ?? null,
    staffId: user.staffId ?? user.staff_id ?? null,
    firstName: user.firstName ?? user.first_name ?? null,
    lastName: user.lastName ?? user.last_name ?? null,
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export async function loginService(email, password) {
  const user = await getUserByEmailService(email);

  if (!user) {
    throw new AppError('Invalid email or password.', 401);
  }

  const passwordMatches = await bcrypt.compare(password, user.password_hash);

  if (!passwordMatches) {
    throw new AppError('Invalid email or password.', 401);
  }

  if (!user.is_active) {
    throw new AppError('This account has been deactivated.', 403);
  }

  const profile = await getUserProfileService(user.id);
  const token = signAccessToken({
    id: user.id,
    email: user.email,
    role_name: user.role_name,
    guestId: profile ? profile.guest_id : null,
    staffId: profile ? profile.staff_id : null,
    firstName: profile ? profile.first_name : null,
    lastName: profile ? profile.last_name : null,
  });

  return {
    token,
    user: {
      userId: profile.user_id,
      email: profile.email,
      role: profile.role_name,
      firstName: profile.first_name,
      lastName: profile.last_name,
      phone: profile.phone,
      guestId: profile.guest_id,
      staffId: profile.staff_id,
      position: profile.position,
    },
  };
}

export function isGuestRole(roleName) {
  return roleName === ROLES.GUEST;
}
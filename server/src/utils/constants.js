// Central place for environment/application constants.

export const PORT = Number(process.env.PORT) || 5000;
export const JWT_SECRET = process.env.JWT_SECRET || 'dev_only_change_me';
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
export const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
export const BCRYPT_SALT_ROUNDS = 10;

export const ROLES = Object.freeze({
  ADMIN: 'ADMIN',
  RECEPTIONIST: 'RECEPTIONIST',
  GUEST: 'GUEST',
});

export const DEFAULT_PAGE_SIZE = 15;
export const STANDARD_CHECK_IN_TIME = '14:00';
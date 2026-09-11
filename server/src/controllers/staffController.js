import {
  deactivateStaffUserService,
  getAllStaffService,
} from '../services/staffService.js';
import { createStaffUserService } from '../services/authService.js';
import { AppError } from '../utils/errors.js';
import { errorResponse, successResponse } from '../utils/responseFormatter.js';
import { ROLES } from '../utils/constants.js';
import {
  isValidEmail,
  isPresent,
  sanitizeString,
} from '../utils/validators.js';

const STAFF_ROLES = new Set([ROLES.ADMIN, ROLES.RECEPTIONIST]);

export async function listStaff(request, response, next) {
  try {
    const limit = Number(request.query.limit) || 50;
    const offset = Number(request.query.offset) || 0;

    const staff = await getAllStaffService(limit, offset);

    return response.json(
      successResponse('Staff members retrieved.', staff)
    );
  } catch (error) {
    return next(error);
  }
}

export async function createStaffAccount(request, response, next) {
  try {
    const email = sanitizeString(request.body.email);
    const password = String(request.body.password ?? '');
    const roleName = sanitizeString(request.body.role).toUpperCase();
    const firstName = sanitizeString(request.body.firstName);
    const lastName = sanitizeString(request.body.lastName);
    const phone = sanitizeString(request.body.phone);
    const position = sanitizeString(request.body.position) || null;

    if (!isValidEmail(email)) {
      return response.status(422).json(
        errorResponse('A valid email is required.')
      );
    }

    if (password.length < 8) {
      return response.status(422).json(
        errorResponse('Password must be at least 8 characters.')
      );
    }

    if (!STAFF_ROLES.has(roleName)) {
      return response.status(422).json(
        errorResponse('Role must be ADMIN or RECEPTIONIST.')
      );
    }

    if (!isPresent(firstName) || !isPresent(lastName)) {
      return response.status(422).json(
        errorResponse('Staff first and last name are required.')
      );
    }

    const roleId = roleName === ROLES.ADMIN ? 1 : 2;

    const result = await createStaffUserService({
      email,
      password,
      roleId,
      firstName,
      lastName,
      phone,
      position,
    });

    return response.status(201).json(
      successResponse('Staff account created successfully.', result)
    );
  } catch (error) {
    return next(error);
  }
}

export async function deactivateStaffAccount(request, response, next) {
  try {
    const userId = Number(request.params.id);

    if (userId === request.user.userId) {
      throw new AppError('You cannot deactivate your own account.', 400);
    }

    await deactivateStaffUserService(userId);

    return response.json(
      successResponse('Staff account deactivated successfully.')
    );
  } catch (error) {
    return next(error);
  }
}
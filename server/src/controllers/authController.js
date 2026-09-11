import {
  loginService,
  registerGuestService,
  getUserProfileService,
} from '../services/authService.js';
import { AppError } from '../utils/errors.js';
import { errorResponse, successResponse } from '../utils/responseFormatter.js';
import { isValidEmail, sanitizeString } from '../utils/validators.js';

function extractRegistrationInput(body) {
  return {
    email: sanitizeString(body.email),
    password: String(body.password ?? ''),
    firstName: sanitizeString(body.firstName),
    lastName: sanitizeString(body.lastName),
    phone: sanitizeString(body.phone) || '',
    idCard: sanitizeString(body.idCard || body.documentNumber) || '',
  };
}

function validateRegistrationInput(registrationData) {
  const errors = {};

  if (!isValidEmail(registrationData.email)) {
    errors.email = 'A valid email address is required.';
  }

  if (registrationData.password.length < 6) {
    errors.password = 'Password must be at least 6 characters.';
  }

  if (!registrationData.firstName) {
    errors.firstName = 'First name is required.';
  }

  if (!registrationData.lastName) {
    errors.lastName = 'Last name is required.';
  }

  if (registrationData.phone && !/^\+?[0-9\s-]{7,20}$/.test(registrationData.phone)) {
    errors.phone = 'Please provide a valid phone number.';
  }

  return errors;
}

export async function registerNewGuest(request, response, next) {
  try {
    const registrationData = extractRegistrationInput(request.body);
    const inputErrors = validateRegistrationInput(registrationData);

    if (Object.keys(inputErrors).length > 0) {
      return response.status(422).json(
        errorResponse('Please correct the highlighted fields.', inputErrors)
      );
    }

    const account = await registerGuestService(registrationData);

    return response.status(201).json(
      successResponse(
        'Account created successfully. You can now sign in.',
        account
      )
    );
  } catch (error) {
    return next(error);
  }
}

function extractLoginInput(body) {
  return {
    email: sanitizeString(body.email),
    password: String(body.password ?? ''),
  };
}

export async function loginUser(request, response, next) {
  try {
    const loginInput = extractLoginInput(request.body);

    if (!isValidEmail(loginInput.email) || !loginInput.password) {
      return response.status(400).json(
        errorResponse('Email and password are required.')
      );
    }

    const session = await loginService(loginInput.email, loginInput.password);

    return response.json(
      successResponse('Signed in successfully.', session)
    );
  } catch (error) {
    return next(error);
  }
}

export async function getCurrentUser(request, response, next) {
  try {
    const profile = await getUserProfileService(request.user.userId);

    if (!profile) {
      throw new AppError('Account not found.', 404);
    }

    return response.json(
      successResponse('Current user profile.', {
        userId: profile.user_id,
        email: profile.email,
        role: profile.role_name,
        firstName: profile.first_name,
        lastName: profile.last_name,
        phone: profile.phone,
        guestId: profile.guest_id,
        staffId: profile.staff_id,
        position: profile.position,
      })
    );
  } catch (error) {
    return next(error);
  }
}
import {
  getAllGuestsService,
  getGuestByIdService,
  updateGuestService,
} from '../services/guestService.js';
import {
  registerGuestService,
} from '../services/authService.js';
import { AppError } from '../utils/errors.js';
import { errorResponse, successResponse } from '../utils/responseFormatter.js';
import {
  isValidEmail,
  isPresent,
  sanitizeString,
} from '../utils/validators.js';

export async function listGuests(request, response, next) {
  try {
    const limit = Number(request.query.limit) || 50;
    const offset = Number(request.query.offset) || 0;

    const guests = await getAllGuestsService(limit, offset);

    return response.json(
      successResponse('Guests retrieved.', guests)
    );
  } catch (error) {
    return next(error);
  }
}

export async function getGuest(request, response, next) {
  try {
    const guestId = Number(request.params.id);

    if (request.user && request.user.role === 'GUEST' && guestId !== request.user.guestId) {
      throw new AppError('You can only view your own profile.', 403);
    }

    const guest = await getGuestByIdService(guestId);

    if (!guest) {
      throw new AppError('Guest not found.', 404);
    }

    return response.json(
      successResponse('Guest retrieved.', guest)
    );
  } catch (error) {
    return next(error);
  }
}

// Registration of a walk-in guest by a receptionist.
export async function registerWalkInGuest(request, response, next) {
  try {
    const { email, password, firstName, lastName, phone, idCard } = request.body;

    if (!isValidEmail(email)) {
      return response.status(422).json(
        errorResponse('A valid email is required for the guest account.')
      );
    }

    if (!isPresent(firstName) || !isPresent(lastName)) {
      return response.status(422).json(
        errorResponse('Guest first and last name are required.')
      );
    }

    const account = await registerGuestService({
      email: sanitizeString(email),
      password: password || 'guest12345',
      firstName: sanitizeString(firstName),
      lastName: sanitizeString(lastName),
      phone: sanitizeString(phone),
      idCard: sanitizeString(idCard) || null,
    });

    return response.status(201).json(
      successResponse(
        'Guest account created successfully.',
        account
      )
    );
  } catch (error) {
    return next(error);
  }
}

export async function updateGuest(request, response, next) {
  try {
    const guestId = Number(request.params.id);

    if (request.user && request.user.role === 'GUEST' && guestId !== request.user.guestId) {
      throw new AppError('You can only edit your own profile.', 403);
    }

    const firstName = sanitizeString(request.body.firstName);
    const lastName = sanitizeString(request.body.lastName);
    const phone = sanitizeString(request.body.phone);

    if (!isPresent(firstName) || !isPresent(lastName) || !isPresent(phone)) {
      return response.status(422).json(
        errorResponse('First name, last name and phone are required.')
      );
    }

    await updateGuestService(
      guestId,
      firstName,
      lastName,
      phone
    );

    const updated = await getGuestByIdService(guestId);

    return response.json(
      successResponse('Guest profile updated successfully.', updated)
    );
  } catch (error) {
    return next(error);
  }
}
import {
  cancelReservationService,
  checkInGuestService,
  checkOutGuestService,
  confirmReservationService,
  createReservationService,
  getActiveReservationsService,
  getAllReservationsService,
  getGuestReservationsService,
  getReservationByIdService,
} from '../services/reservationService.js';
import {
  getAvailableRoomsService,
} from '../services/roomService.js';
import {
  createGuestForUserService,
  getGuestByUserIdService,
} from '../services/guestService.js';
import { AppError } from '../utils/errors.js';
import { errorResponse, successResponse } from '../utils/responseFormatter.js';
import {
  isValidDateString,
  isValidPositiveNumber,
  sanitizeString,
} from '../utils/validators.js';

function extractReservationInput(body, defaultGuestId) {
  return {
    guestId: defaultGuestId || Number(body.guestId),
    roomId: Number(body.roomId),
    checkInDate: sanitizeString(body.checkInDate),
    checkOutDate: sanitizeString(body.checkOutDate),
    specialRequests: sanitizeString(body.specialRequests) || null,
  };
}

function getTodayLocalDate() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function validateReservationDates(checkInDate, checkOutDate) {
  if (!isValidDateString(checkInDate) || !isValidDateString(checkOutDate)) {
    return 'Valid check-in and check-out dates are required.';
  }

  const today = getTodayLocalDate();
  if (checkInDate < today) {
    return 'Check-in date cannot be in the past.';
  }

  if (checkOutDate <= checkInDate) {
    return 'Check-out date must be after the check-in date.';
  }

  return null;
}

// Resolves the guest id: guests book for themselves, staff book on behalf of
// a walk-in or registered guest supplied in the body. If an authenticated user
// does not yet have a guest profile, one is automatically created and linked.
async function resolveGuestId(request, body) {
  // 1. Explicit guestId supplied (e.g. staff booking for a walk-in/existing guest)
  if (body.guestId) {
    return Number(body.guestId);
  }

  // 2. Authenticated user booking
  if (request.user) {
    if (request.user.guestId) {
      return Number(request.user.guestId);
    }

    // Attempt to lookup existing guest record by userId
    try {
      const existing = await getGuestByUserIdService(request.user.userId);
      if (existing && (existing.guest_id || existing.id)) {
        const foundId = Number(existing.guest_id || existing.id);
        request.user.guestId = foundId;
        return foundId;
      }
    } catch {
      // Continue to auto-link
    }

    // Automatically create and link guest profile for this authenticated user
    try {
      const created = await createGuestForUserService({
        userId: request.user.userId,
        firstName: request.user.firstName || 'Guest',
        lastName: request.user.lastName || 'User',
        phone: body.phone || '000-000-0000',
        idCard: `AUTO-${request.user.userId}-${Date.now().toString().slice(-4)}`,
      });
      if (created && (created.guest_id || created.guestId || created.id)) {
        const newId = Number(created.guest_id || created.guestId || created.id);
        request.user.guestId = newId;
        return newId;
      }
    } catch (err) {
      throw new AppError(`Unable to link guest profile: ${err.message}`, 500);
    }
  }

  throw new AppError('A guest must be selected or you must be logged in to make a reservation.', 422);
}

export async function listReservations(request, response, next) {
  try {
    const status = sanitizeString(request.query.status) || null;
    const limit = Number(request.query.limit) || 100;
    const offset = Number(request.query.offset) || 0;

    const reservations = await getAllReservationsService(status, limit, offset);

    return response.json(
      successResponse('Reservations retrieved.', reservations)
    );
  } catch (error) {
    return next(error);
  }
}

export async function listMyReservations(request, response, next) {
  try {
    let guestId = request.user?.guestId;

    if (!guestId && request.user?.userId) {
      try {
        const existing = await getGuestByUserIdService(request.user.userId);
        if (existing && (existing.guest_id || existing.id)) {
          guestId = Number(existing.guest_id || existing.id);
          request.user.guestId = guestId;
        }
      } catch {
        // Silently ignore
      }
    }

    // If no guest profile exists yet, return empty array gracefully
    if (!guestId) {
      return response.json(
        successResponse('Your reservations retrieved.', [])
      );
    }

    const reservations = await getGuestReservationsService(guestId);

    return response.json(
      successResponse('Your reservations retrieved.', reservations || [])
    );
  } catch (error) {
    return next(error);
  }
}

export async function listActiveReservations(request, response, next) {
  try {
    const reservations = await getActiveReservationsService();

    return response.json(
      successResponse('Active reservations retrieved.', reservations)
    );
  } catch (error) {
    return next(error);
  }
}

export async function getReservation(request, response, next) {
  try {
    const reservation = await getReservationByIdService(Number(request.params.id));

    if (!reservation) {
      throw new AppError('Reservation not found.', 404);
    }

    if (request.user.role === 'GUEST' && reservation.guest_id !== request.user.guestId) {
      throw new AppError('You can only view your own reservations.', 403);
    }

    return response.json(
      successResponse('Reservation retrieved.', reservation)
    );
  } catch (error) {
    return next(error);
  }
}

export async function createReservation(request, response, next) {
  try {
    const guestId = await resolveGuestId(request, request.body);
    const reservationData = extractReservationInput(request.body, guestId);

    const dateError = validateReservationDates(
      reservationData.checkInDate,
      reservationData.checkOutDate
    );

    if (dateError) {
      return response.status(422).json(errorResponse(dateError));
    }

    if (!reservationData.roomId) {
      return response.status(422).json(
        errorResponse('A room must be selected.')
      );
    }

    // Friendly pre-flight availability check. The stored procedure remains
    // authoritative against double booking.
    const availableRooms = await getAvailableRoomsService(
      reservationData.checkInDate,
      reservationData.checkOutDate
    );

    if (!availableRooms.some((room) => room.room_id === reservationData.roomId)) {
      return response.status(409).json(
        errorResponse('The selected room is not available for those dates.')
      );
    }

    const result = await createReservationService(reservationData);

    const reservation = await getReservationByIdService(
      Number(result.reservation_id)
    );

    return response.status(201).json(
      successResponse('Reservation request submitted successfully. Awaiting approval from Front Desk or Administrator.', {
        reservationId: Number(result.reservation_id),
        totalAmount: Number(result.total_amount),
        status: reservation ? reservation.status : 'PENDING',
      })
    );
  } catch (error) {
    return next(error);
  }
}

export async function confirmReservation(request, response, next) {
  try {
    const reservationId = Number(request.params.id);
    await confirmReservationService(reservationId);

    const updated = await getReservationByIdService(reservationId);

    return response.json(
      successResponse('Reservation confirmed successfully.', updated)
    );
  } catch (error) {
    return next(error);
  }
}

export async function cancelReservation(request, response, next) {
  try {
    const reservationId = Number(request.params.id);

    if (request.user.role === 'GUEST') {
      const reservation = await getReservationByIdService(reservationId);

      if (!reservation) {
        throw new AppError('Reservation not found.', 404);
      }

      if (reservation.guest_id !== request.user.guestId) {
        throw new AppError('You can only cancel your own reservations.', 403);
      }
    }

    await cancelReservationService(reservationId);

    return response.json(
      successResponse('Reservation cancelled successfully.')
    );
  } catch (error) {
    return next(error);
  }
}

export async function checkInReservation(request, response, next) {
  try {
    const reservationId = Number(request.params.id);
    const updated = await checkInGuestService(reservationId);

    return response.json(
      successResponse('Guest checked in successfully.', updated)
    );
  } catch (error) {
    return next(error);
  }
}

export async function checkOutReservation(request, response, next) {
  try {
    const reservationId = Number(request.params.id);
    const paymentAmount = Number(request.body.paymentAmount) || 0;
    const paymentMethod = sanitizeString(request.body.paymentMethod);

    if (paymentAmount > 0 && !isValidPositiveNumber(paymentAmount)) {
      return response.status(422).json(
        errorResponse('Payment amount must be greater than zero.')
      );
    }

    const result = await checkOutGuestService(
      reservationId,
      paymentAmount,
      paymentMethod,
      request.user.userId
    );

    const updated = await getReservationByIdService(reservationId);

    return response.json(
      successResponse('Guest checked out successfully.', {
        reservation: updated,
        finalBalance: Number(result.final_balance),
      })
    );
  } catch (error) {
    return next(error);
  }
}
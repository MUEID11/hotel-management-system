import {
  createIssueService,
  getIssuesService,
  updateIssueStatusService,
} from '../services/issueService.js';
import { getReservationByIdService } from '../services/reservationService.js';
import { AppError } from '../utils/errors.js';
import { errorResponse, successResponse } from '../utils/responseFormatter.js';
import { isPresent, sanitizeString } from '../utils/validators.js';

export async function createIssue(request, response, next) {
  try {
    const reservationId = request.body.reservationId ? Number(request.body.reservationId) : null;
    let roomId = request.body.roomId ? Number(request.body.roomId) : null;
    let guestId = request.user.guestId ?? (request.body.guestId ? Number(request.body.guestId) : null);

    const category = sanitizeString(request.body.category) || 'OTHER';
    const priority = sanitizeString(request.body.priority) || 'MEDIUM';
    const description = sanitizeString(request.body.description);

    if (!isPresent(description)) {
      return response.status(422).json(
        errorResponse('Please provide a description of the problem.')
      );
    }

    if (reservationId) {
      const reservation = await getReservationByIdService(reservationId);
      if (!reservation) {
        throw new AppError('Reservation not found.', 404);
      }
      if (request.user.role === 'GUEST' && reservation.guest_id !== request.user.guestId) {
        throw new AppError('You can only report issues for your own stays.', 403);
      }
      roomId = reservation.room_id;
      guestId = reservation.guest_id;
    }

    if (!roomId) {
      return response.status(422).json(
        errorResponse('A valid room or reservation is required.')
      );
    }

    const result = await createIssueService({
      reservationId,
      roomId,
      guestId,
      category,
      priority,
      description,
    });

    return response.status(201).json(
      successResponse('Problem report submitted. Our team will look into it promptly.', result)
    );
  } catch (error) {
    return next(error);
  }
}

export async function listIssues(request, response, next) {
  try {
    const reservationId = request.query.reservationId ? Number(request.query.reservationId) : null;

    if (request.user.role === 'GUEST') {
      if (reservationId) {
        const reservation = await getReservationByIdService(reservationId);
        if (!reservation || reservation.guest_id !== request.user.guestId) {
          throw new AppError('You can only view issues for your own stays.', 403);
        }
      }
    }

    const issues = await getIssuesService(reservationId);

    // If caller is GUEST and no reservationId filter was passed, filter by guestId
    const filtered = request.user.role === 'GUEST'
      ? issues.filter((i) => i.guest_id === request.user.guestId)
      : issues;

    return response.json(
      successResponse('Room issues retrieved.', filtered)
    );
  } catch (error) {
    return next(error);
  }
}

export async function updateIssueStatus(request, response, next) {
  try {
    const issueId = Number(request.params.id);
    const status = sanitizeString(request.body.status)?.toUpperCase();
    const resolutionNotes = sanitizeString(request.body.resolutionNotes) || null;

    const validStatuses = ['OPEN', 'IN_PROGRESS', 'RESOLVED'];
    if (!status || !validStatuses.includes(status)) {
      return response.status(422).json(
        errorResponse('Invalid status. Must be OPEN, IN_PROGRESS, or RESOLVED.')
      );
    }

    await updateIssueStatusService(issueId, status, resolutionNotes);

    return response.json(
      successResponse(`Issue #${issueId} status updated to ${status}.`)
    );
  } catch (error) {
    return next(error);
  }
}

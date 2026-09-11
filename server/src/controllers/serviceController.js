import {
  createServiceService,
  getAllServiceOrdersService,
  getServiceOrdersService,
  getServicesService,
  placeServiceOrderService,
  updateServiceOrderStatusService,
  updateServiceService,
} from '../services/serviceService.js';
import { getReservationByIdService } from '../services/reservationService.js';
import { AppError } from '../utils/errors.js';
import { errorResponse, successResponse } from '../utils/responseFormatter.js';
import {
  isPresent,
  isValidPositiveNumber,
  isIntegerBetween,
  sanitizeString,
} from '../utils/validators.js';

export async function listServices(request, response, next) {
  try {
    const includeInactive = request.user && request.user.role !== 'GUEST' ? 1 : 0;
    const services = await getServicesService(includeInactive);

    return response.json(
      successResponse('Services retrieved.', services)
    );
  } catch (error) {
    return next(error);
  }
}

export async function createService(request, response, next) {
  try {
    const name = sanitizeString(request.body.name);
    const description = sanitizeString(request.body.description) || null;
    const price = Number(request.body.price);

    if (!isPresent(name)) {
      return response.status(422).json(
        errorResponse('Service name is required.')
      );
    }

    if (!isValidPositiveNumber(price)) {
      return response.status(422).json(
        errorResponse('Service price must be greater than zero.')
      );
    }

    const result = await createServiceService({ name, description, price });

    return response.status(201).json(
      successResponse('Service created successfully.', result)
    );
  } catch (error) {
    return next(error);
  }
}

export async function updateService(request, response, next) {
  try {
    const serviceId = Number(request.params.id);
    const description = sanitizeString(request.body.description) || null;
    const price = Number(request.body.price);
    const isActive = request.body.isActive === undefined ? 1 : Number(request.body.isActive);

    await updateServiceService(serviceId, { description, price, isActive });

    return response.json(
      successResponse('Service updated successfully.')
    );
  } catch (error) {
    return next(error);
  }
}

export async function placeServiceOrder(request, response, next) {
  try {
    const reservationId = Number(request.body.reservationId);
    const serviceId = Number(request.body.serviceId);
    const quantity = Number(request.body.quantity) || 1;

    if (!isIntegerBetween(reservationId, 1, 999999999)) {
      return response.status(422).json(
        errorResponse('A valid reservation is required.')
      );
    }

    if (!isIntegerBetween(serviceId, 1, 999999999)) {
      return response.status(422).json(
        errorResponse('A valid service is required.')
      );
    }

    const reservation = await getReservationByIdService(reservationId);
    if (!reservation) {
      throw new AppError('Reservation not found.', 404);
    }

    if (request.user.role === 'GUEST') {
      if (reservation.guest_id !== request.user.guestId) {
        throw new AppError('You can only order services for your own reservation.', 403);
      }
      if (!['CONFIRMED', 'CHECKED_IN'].includes(reservation.status)) {
        throw new AppError('Services can only be ordered for active or confirmed stays.', 400);
      }
    }

    const result = await placeServiceOrderService({
      reservationId,
      serviceId,
      quantity,
    });

    return response.status(201).json(
      successResponse('Service added to the reservation.', result)
    );
  } catch (error) {
    return next(error);
  }
}

export async function listServiceOrders(request, response, next) {
  try {
    const reservationId = Number(request.params.reservationId);

    if (request.user.role === 'GUEST') {
      const reservation = await getReservationByIdService(reservationId);
      if (!reservation || reservation.guest_id !== request.user.guestId) {
        throw new AppError('You can only view your own reservations.', 403);
      }
    }

    const orders = await getServiceOrdersService(reservationId);

    return response.json(
      successResponse('Service orders retrieved.', orders)
    );
  } catch (error) {
    return next(error);
  }
}

export async function listAllServiceOrders(request, response, next) {
  try {
    const orders = await getAllServiceOrdersService();
    return response.json(
      successResponse('All service orders retrieved.', orders)
    );
  } catch (error) {
    return next(error);
  }
}

export async function updateServiceOrderStatus(request, response, next) {
  try {
    const orderId = Number(request.params.id);
    const status = request.body.status ? String(request.body.status).toUpperCase() : '';

    const validStatuses = ['PENDING', 'DELIVERED', 'CANCELLED'];
    if (!status || !validStatuses.includes(status)) {
      return response.status(422).json(
        errorResponse('Invalid status. Must be PENDING, DELIVERED, or CANCELLED.')
      );
    }

    await updateServiceOrderStatusService(orderId, status);

    return response.json(
      successResponse(`Service order marked as ${status}.`)
    );
  } catch (error) {
    return next(error);
  }
}
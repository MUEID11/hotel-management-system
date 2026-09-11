import {
  createRoomService,
  createRoomTypeService,
  deactivateRoomService,
  getAvailableRoomsService,
  getRoomByIdService,
  getRoomTypesService,
  getRoomsService,
  setRoomStatusService,
  updateRoomService,
  updateRoomTypeService,
} from '../services/roomService.js';
import { AppError } from '../utils/errors.js';
import { errorResponse, successResponse } from '../utils/responseFormatter.js';
import {
  isPresent,
  isValidDateString,
  isValidPositiveNumber,
  isIntegerBetween,
  sanitizeString,
} from '../utils/validators.js';

function extractRoomTypeInput(body) {
  return {
    name: sanitizeString(body.name),
    description: sanitizeString(body.description) || null,
    basePrice: Number(body.basePrice),
    capacity: Number(body.capacity),
    amenities: Array.isArray(body.amenities)
      ? JSON.stringify(body.amenities)
      : null,
    isActive: body.isActive === undefined ? 1 : Number(body.isActive),
  };
}

function validateRoomTypeInput(roomTypeData) {
  const errors = {};

  if (!isPresent(roomTypeData.name)) {
    errors.name = 'Room type name is required.';
  }

  if (!isValidPositiveNumber(roomTypeData.basePrice)) {
    errors.basePrice = 'Base price must be greater than zero.';
  }

  if (!isIntegerBetween(roomTypeData.capacity, 1, 12)) {
    errors.capacity = 'Capacity must be between 1 and 12 guests.';
  }

  return errors;
}

export async function listRoomTypes(request, response, next) {
  try {
    const includeInactive = request.user ? 1 : 0;
    const roomTypes = await getRoomTypesService(includeInactive);

    return response.json(
      successResponse('Room types retrieved.', roomTypes)
    );
  } catch (error) {
    return next(error);
  }
}

export async function createNewRoomType(request, response, next) {
  try {
    const roomTypeData = extractRoomTypeInput(request.body);
    const inputErrors = validateRoomTypeInput(roomTypeData);

    if (Object.keys(inputErrors).length > 0) {
      return response.status(422).json(
        errorResponse('Please correct the highlighted fields.', inputErrors)
      );
    }

    const rows = await createRoomTypeService(roomTypeData);
    const created = rows.length > 0 ? rows[0] : null;

    return response.status(201).json(
      successResponse('Room type created successfully.', created)
    );
  } catch (error) {
    return next(error);
  }
}

export async function updateExistingRoomType(request, response, next) {
  try {
    const roomTypeData = extractRoomTypeInput(request.body);
    roomTypeData.roomTypeId = Number(request.params.id);

    const inputErrors = validateRoomTypeInput(roomTypeData);
    if (Object.keys(inputErrors).length > 0) {
      return response.status(422).json(
        errorResponse('Please correct the highlighted fields.', inputErrors)
      );
    }

    await updateRoomTypeService(roomTypeData);

    return response.json(
      successResponse('Room type updated successfully.')
    );
  } catch (error) {
    return next(error);
  }
}

function extractRoomInput(body) {
  return {
    roomNumber: sanitizeString(body.roomNumber),
    roomTypeId: Number(body.roomTypeId),
    floor: Number(body.floor),
    description: sanitizeString(body.description) || null,
    status: sanitizeString(body.status),
  };
}

function validateRoomInput(roomData) {
  const errors = {};

  if (!isPresent(roomData.roomNumber)) {
    errors.roomNumber = 'Room number is required.';
  }

  if (!isIntegerBetween(roomData.roomTypeId, 1, 999999)) {
    errors.roomTypeId = 'A valid room type is required.';
  }

  if (!isIntegerBetween(roomData.floor, 0, 100)) {
    errors.floor = 'Floor must be between 0 and 100.';
  }

  if (!['AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'INACTIVE'].includes(roomData.status)) {
    errors.status = 'Invalid room status.';
  }

  return errors;
}

export async function listRooms(request, response, next) {
  try {
    const rawStatus = sanitizeString(request.query.status);
    const status =
      rawStatus && !['undefined', 'null', 'all', ''].includes(rawStatus.toLowerCase())
        ? rawStatus.toUpperCase()
        : null;
    const roomTypeId = request.query.roomTypeId
      ? Number(request.query.roomTypeId)
      : null;

    const rooms = await getRoomsService(status, roomTypeId);

    return response.json(
      successResponse('Rooms retrieved.', rooms)
    );
  } catch (error) {
    return next(error);
  }
}

export async function listAvailableRooms(request, response, next) {
  try {
    const checkInDate = sanitizeString(request.query.checkIn);
    const checkOutDate = sanitizeString(request.query.checkOut);
    const capacity = request.query.capacity ? Number(request.query.capacity) : null;

    if (!isValidDateString(checkInDate) || !isValidDateString(checkOutDate)) {
      return response.status(400).json(
        errorResponse('Valid check-in and check-out dates are required.')
      );
    }

    const rooms = await getAvailableRoomsService(checkInDate, checkOutDate, capacity);

    return response.json(
      successResponse('Available rooms retrieved.', rooms)
    );
  } catch (error) {
    return next(error);
  }
}

export async function getSingleRoom(request, response, next) {
  try {
    const room = await getRoomByIdService(Number(request.params.id));

    if (!room) {
      throw new AppError('Room not found.', 404);
    }

    return response.json(
      successResponse('Room retrieved.', room)
    );
  } catch (error) {
    return next(error);
  }
}

export async function createNewRoom(request, response, next) {
  try {
    const roomData = extractRoomInput(request.body);
    const inputErrors = validateRoomInput(roomData);

    if (Object.keys(inputErrors).length > 0) {
      return response.status(422).json(
        errorResponse('Please correct the highlighted fields.', inputErrors)
      );
    }

    const rows = await createRoomService(roomData);
    const created = rows.length > 0 ? rows[0] : null;

    return response.status(201).json(
      successResponse('Room created successfully.', created)
    );
  } catch (error) {
    return next(error);
  }
}

export async function updateExistingRoom(request, response, next) {
  try {
    const roomData = extractRoomInput(request.body);
    const inputErrors = validateRoomInput(roomData);

    if (Object.keys(inputErrors).length > 0) {
      return response.status(422).json(
        errorResponse('Please correct the highlighted fields.', inputErrors)
      );
    }

    await updateRoomService(Number(request.params.id), roomData);

    return response.json(
      successResponse('Room updated successfully.')
    );
  } catch (error) {
    return next(error);
  }
}

export async function deactivateRoom(request, response, next) {
  try {
    await deactivateRoomService(Number(request.params.id));

    return response.json(
      successResponse('Room deactivated successfully.')
    );
  } catch (error) {
    return next(error);
  }
}

const MANUAL_ROOM_STATUSES = new Set(['AVAILABLE', 'MAINTENANCE']);

export async function changeRoomStatus(request, response, next) {
  try {
    const status = sanitizeString(request.body.status);

    if (!MANUAL_ROOM_STATUSES.has(status)) {
      return response.status(400).json(
        errorResponse('Only AVAILABLE or MAINTENANCE can be set manually.')
      );
    }

    await setRoomStatusService(Number(request.params.id), status);

    return response.json(
      successResponse(`Room marked as ${status.toLowerCase()}.`)
    );
  } catch (error) {
    return next(error);
  }
}
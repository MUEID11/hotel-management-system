import {
  createPaymentService,
  getAllPaymentsService,
  getPaymentsByReservationService,
} from '../services/paymentService.js';
import { AppError } from '../utils/errors.js';
import { errorResponse, successResponse } from '../utils/responseFormatter.js';
import {
  isValidPositiveNumber,
  sanitizeString,
} from '../utils/validators.js';

const PAYMENT_METHODS = new Set(['CASH', 'CARD', 'MOBILE_TRANSFER', 'BANK_TRANSFER']);

export async function recordPayment(request, response, next) {
  try {
    const reservationId = Number(request.body.reservationId);
    const amount = Number(request.body.amount);
    const paymentMethod = sanitizeString(request.body.paymentMethod);
    const transactionReference = sanitizeString(request.body.transactionReference) || null;

    if (!reservationId) {
      return response.status(422).json(
        errorResponse('A reservation is required.')
      );
    }

    if (!isValidPositiveNumber(amount)) {
      return response.status(422).json(
        errorResponse('Payment amount must be greater than zero.')
      );
    }

    if (!PAYMENT_METHODS.has(paymentMethod)) {
      return response.status(422).json(
        errorResponse('A valid payment method is required.')
      );
    }

    const result = await createPaymentService({
      reservationId,
      amount,
      paymentMethod,
      transactionReference,
      receivedBy: request.user.userId,
    });

    return response.status(201).json(
      successResponse('Payment recorded successfully.', result)
    );
  } catch (error) {
    return next(error);
  }
}

export async function listPaymentsForReservation(request, response, next) {
  try {
    const payments = await getPaymentsByReservationService(
      Number(request.params.reservationId)
    );

    return response.json(
      successResponse('Payments retrieved.', payments)
    );
  } catch (error) {
    return next(error);
  }
}

export async function listAllPayments(request, response, next) {
  try {
    const limit = Number(request.query.limit) || 100;
    const offset = Number(request.query.offset) || 0;

    const payments = await getAllPaymentsService(limit, offset);

    return response.json(
      successResponse('Payments retrieved.', payments)
    );
  } catch (error) {
    return next(error);
  }
}
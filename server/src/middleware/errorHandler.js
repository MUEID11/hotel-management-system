import {
  errorResponse,
  normalizeDatabaseError,
} from '../utils/responseFormatter.js';

// Central error handling. Stored procedure signals (SQLSTATE 45000) and
// constraint violations are translated here and never leak raw stack traces.
// eslint-disable-next-line no-unused-vars
export function notFoundHandler(request, response, next) {
  response.status(404).json(
    errorResponse(`Route ${request.method} ${request.originalUrl} not found.`)
  );
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(error, request, response, next) {
  const normalized = normalizeDatabaseError(error);

  if (error.name === 'AppError') {
    return response.status(error.status || 400).json(
      errorResponse(error.message, error.errors || null)
    );
  }

  if (error.code === 'ER_SIGNAL_EXCEPTION' || error.code === 'ER_SIGNAL_WARNING') {
    const message = error.message || 'Database rejected the operation.';
    const status = /already reserved|not available|occupied|cannot|does not cover|exceeds/i.test(message)
      ? 409
      : 400;
    return response.status(status).json(errorResponse(message));
  }

  if (error.code === 'ER_DUP_ENTRY') {
    return response.status(409).json(
      errorResponse('That record already exists.')
    );
  }

  if (error.code === 'ER_NO_REFERENCED_ROW_2') {
    return response.status(400).json(
      errorResponse('The referenced record does not exist.')
    );
  }

  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.error('[error-handler]', error);
  }

  return response.status(normalized.status === 400 ? 400 : 500).json(
    errorResponse('An unexpected error occurred. Please try again later.')
  );
}
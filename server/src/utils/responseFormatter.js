// Reusable helpers for formatting HTTP responses consistently.

export function successResponse(message, data = null, status = 200) {
  return {
    success: true,
    message,
    data,
    status,
  };
}

export function errorResponse(message, errors = null) {
  return {
    success: false,
    message,
    errors,
  };
}

// Normalizes stored procedure failures and constraint violations into
// human-readable API messages.
export function normalizeDatabaseError(error) {
  const code = error && (error.code || error.sqlState);

  switch (code) {
    case '45000':
      return { message: error.message || 'Operation failed.', status: 400 };
    case '23000':
    case 'ER_DUP_ENTRY':
    case 1062:
      return {
        message: 'That record already exists or is in use.',
        status: 409,
      };
    default:
      return {
        message: error.message || 'An unexpected error occurred.',
        status: 500,
      };
  }
}

export function extractFirstResultSet(resultSets) {
  return Array.isArray(resultSets) ? resultSets[0] : resultSets;
}

export function extractScalarRow(rows) {
  return Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
}
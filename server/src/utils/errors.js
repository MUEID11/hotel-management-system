// Application-level error carrying an HTTP status code. Thrown by controller
// validation paths and caught by the central error handler.
export class AppError extends Error {
  constructor(message, status = 400, errors = null) {
    super(message);
    this.name = 'AppError';
    this.status = status;
    this.errors = errors;
  }
}
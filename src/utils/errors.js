class AppError extends Error {
  constructor(message, statusCode, errorCode = "UNKNOWN_ERROR", details = null) {
    super(message)
    this.statusCode = statusCode
    this.errorCode = errorCode
    this.details = details
    this.isOperational = true

    Error.captureStackTrace(this, this.constructor);

  }
}


export class BadRequestError extends AppError {
  constructor(message = "Bad Request") {
    super(message, 400, "BAD_REQUEST");
  }
}

export class UnAuthorisedError extends AppError {
  constructor(message = "unauthorised Access") {
    super(message, 401, "UNAUTHORISED_ACCESS");
  }
}
export class ConflictError extends AppError {
  constructor(message = "Conflict") {
    super(message, 409, "CONFLICT");
  }
}

export class InternalServerError extends AppError {
  constructor(message = "Internal Server Error") {
    super(message, 500, "INTERNAL_SERVER_ERROR");
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Not Found") {
    super(message, 404, "NOT_FOUND");
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden") {
    super(message, 403, "FORBIDDEN");
  }
}
export class RateLimitError extends AppError {
  constructor(message = "Too many attempts.") {
    super(message, 429, "RATE_LIMIT_EXCEEDED")

  }
}
export class ValidationError extends AppError {
  constructor(message = "Validation Failed", details = null) {
    super(message, 422, "VALIDATION_ERROR", details);

  }
}
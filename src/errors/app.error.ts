export class AppError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly code: string,
  ) {
    super(message);
    this.name = new.target.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized") {
    super(message, 401, "UNAUTHORIZED");
  }
}

export class ConflictError extends AppError {
  constructor(message = "Conflict") {
    super(message, 409, "CONFLICT");
  }
}

export class ValidationError extends AppError {
  constructor(
    message = "Validation failed",
    public readonly details?: unknown,
  ) {
    super(message, 422, "VALIDATION_ERROR");
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Not found") {
    super(message, 404, "NOT_FOUND");
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Kamu tidak punya akses untuk melakukan aksi ini") {
    super(message, 403, "FORBIDDEN");
  }
}

export class EmailDeliveryError extends AppError {
  constructor(message = "Gagal mengirim email, pastikan alamat email valid atau coba beberapa saat lagi") {
    super(message, 502, "EMAIL_DELIVERY_FAILED");
  }
}

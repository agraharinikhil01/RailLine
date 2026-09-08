import { ApiError } from '@railline/types';

export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details?: Record<string, unknown>;

  constructor(code: string, message: string, statusCode = 400, details?: Record<string, unknown>) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }

  toApiError(requestId?: string): ApiError {
    return {
      code: this.code,
      message: this.message,
      requestId,
      details: this.details,
    };
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found', code = 'NOT_FOUND') {
    super(code, message, 404);
  }
}

export class TrainNotFoundError extends AppError {
  constructor(trainNumber: string) {
    super('TRAIN_NOT_FOUND', `Train with number '${trainNumber}' was not found.`, 404, { trainNumber });
  }
}

export class LiveDataUnavailableError extends AppError {
  constructor(message = 'Live train data is temporarily unavailable.') {
    super('LIVE_DATA_UNAVAILABLE', message, 503);
  }
}

export class InvalidRequestError extends AppError {
  constructor(message = 'Invalid request parameters', details?: Record<string, unknown>) {
    super('INVALID_REQUEST', message, 400, details);
  }
}

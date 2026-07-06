import { Response } from 'express';

interface ApiResponseOptions {
  statusCode: number;
  message?: string;
  data?: unknown;
  meta?: unknown;
}

export function sendSuccess(res: Response, options: Omit<ApiResponseOptions, 'statusCode'> & { statusCode?: number }) {
  return res.status(options.statusCode || 200).json({
    success: true,
    message: options.message,
    data: options.data,
    meta: options.meta,
  });
}

export function sendError(res: Response, statusCode: number, message: string, error?: unknown) {
  return res.status(statusCode).json({
    success: false,
    message,
    error: process.env.NODE_ENV === 'development' ? error : undefined,
  });
}

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

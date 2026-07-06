import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response';
import { AppError } from '../utils/response';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    sendError(res, err.statusCode, err.message);
    return;
  }

  console.error('[Error]', err);

  sendError(
    res,
    500,
    'An unexpected error occurred. Please try again later.',
    process.env.NODE_ENV === 'development' ? err.message : undefined,
  );
}

export function notFoundHandler(_req: Request, res: Response): void {
  sendError(res, 404, 'The requested resource was not found.');
}

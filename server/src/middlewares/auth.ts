import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { sendError } from '../utils/response';

export interface AuthRequest extends Request {
  userId?: string;
  userEmail?: string;
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    sendError(res, 401, 'Authentication required. Please provide a valid token.');
    return;
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    sendError(res, 401, 'Authentication required. Please provide a valid token.');
    return;
  }

  try {
    const decoded = verifyAccessToken(token);
    req.userId = decoded.userId;
    req.userEmail = decoded.email;
    next();
  } catch {
    sendError(res, 401, 'Invalid or expired token. Please sign in again.');
  }
}

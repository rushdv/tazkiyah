import jwt, { SignOptions } from 'jsonwebtoken';
import { config } from '../config';

interface TokenPayload {
  userId: string;
  email: string;
}

export function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn as SignOptions['expiresIn'],
  });
}

export function generateRefreshToken(payload: TokenPayload, rememberMe: boolean = false): string {
  return jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: (rememberMe ? config.jwt.rememberExpiresIn : config.jwt.refreshExpiresIn) as SignOptions['expiresIn'],
  });
}

export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, config.jwt.secret) as TokenPayload;
}

export function verifyRefreshToken(token: string): TokenPayload {
  return jwt.verify(token, config.jwt.refreshSecret) as TokenPayload;
}

export function generateTokenPair(payload: TokenPayload, rememberMe: boolean = false) {
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload, rememberMe);
  return {
    accessToken,
    refreshToken,
    expiresIn: 900,
  };
}

import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { userRepository } from '../repositories/user.repository';
import { habitRepository } from '../repositories/habit.repository';
import { streakRepository } from '../repositories/streak.repository';
import { generateTokenPair, verifyRefreshToken } from '../utils/jwt';
import { AppError } from '../utils/response';
import { DEFAULT_HABITS } from '../config/habits';
import { prisma } from '../config/database';
import { RegisterInput, LoginInput, ChangePasswordInput } from '@tazkiyah/shared';

const SALT_ROUNDS = 12;

export const authService = {
  async register(input: RegisterInput) {
    const existing = await userRepository.findByEmail(input.email);
    if (existing) {
      throw new AppError('An account with this email already exists', 409);
    }

    const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

    const user = await userRepository.create({
      email: input.email,
      name: input.name,
      passwordHash,
    });

    await habitRepository.upsertMany(DEFAULT_HABITS);

    await streakRepository.upsert(user.id, 0, 0, new Date());

    await prisma.setting.create({
      data: { userId: user.id },
    });

    const tokens = generateTokenPair({ userId: user.id, email: user.email });

    await userRepository.updateRefreshToken(user.id, tokens.refreshToken);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        theme: user.theme,
        timezone: user.timezone,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      },
      tokens,
    };
  },

  async login(input: LoginInput) {
    const user = await userRepository.findByEmail(input.email);
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    const isValid = await bcrypt.compare(input.password, user.passwordHash);
    if (!isValid) {
      throw new AppError('Invalid email or password', 401);
    }

    const tokens = generateTokenPair(
      { userId: user.id, email: user.email },
      input.rememberMe,
    );

    await userRepository.updateRefreshToken(user.id, tokens.refreshToken);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        theme: user.theme,
        timezone: user.timezone,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      },
      tokens,
    };
  },

  async refresh(refreshToken: string) {
    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch {
      throw new AppError('Invalid or expired refresh token', 401);
    }

    const user = await userRepository.findById(decoded.userId);
    if (!user || user.refreshToken !== refreshToken) {
      throw new AppError('Invalid refresh token', 401);
    }

    const tokens = generateTokenPair({ userId: user.id, email: user.email });

    await userRepository.updateRefreshToken(user.id, tokens.refreshToken);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        theme: user.theme,
        timezone: user.timezone,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      },
      tokens,
    };
  },

  async logout(userId: string) {
    await userRepository.updateRefreshToken(userId, null);
  },

  async changePassword(userId: string, input: ChangePasswordInput) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const isValid = await bcrypt.compare(input.currentPassword, user.passwordHash);
    if (!isValid) {
      throw new AppError('Current password is incorrect', 401);
    }

    const passwordHash = await bcrypt.hash(input.newPassword, SALT_ROUNDS);
    await userRepository.updatePassword(userId, passwordHash);
    await userRepository.updateRefreshToken(userId, null);
  },

  async forgotPassword(email: string) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      return;
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExp = new Date(Date.now() + 3600000);

    await userRepository.setResetToken(email, resetToken, resetExp);
  },

  async resetPassword(token: string, password: string) {
    const user = await userRepository.findByResetToken(token);
    if (!user) {
      throw new AppError('Invalid or expired reset token', 400);
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    await userRepository.updatePassword(user.id, passwordHash);
    await userRepository.clearResetToken(user.id);
    await userRepository.updateRefreshToken(user.id, null);
  },

  async getProfile(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      theme: user.theme,
      timezone: user.timezone,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  },
};

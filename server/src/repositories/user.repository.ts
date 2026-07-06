import { prisma } from '../config/database';
import { Prisma } from '@prisma/client';

export const userRepository = {
  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: { settings: true },
    });
  },

  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
  },

  async create(data: Prisma.UserCreateInput) {
    return prisma.user.create({
      data: {
        ...data,
        email: data.email.toLowerCase(),
      },
      include: { settings: true },
    });
  },

  async update(id: string, data: Prisma.UserUpdateInput) {
    return prisma.user.update({
      where: { id },
      data,
    });
  },

  async updateRefreshToken(id: string, refreshToken: string | null) {
    return prisma.user.update({
      where: { id },
      data: { refreshToken },
    });
  },

  async updatePassword(id: string, passwordHash: string) {
    return prisma.user.update({
      where: { id },
      data: { passwordHash },
    });
  },

  async setResetToken(email: string, token: string, exp: Date) {
    return prisma.user.update({
      where: { email: email.toLowerCase() },
      data: { resetToken: token, resetTokenExp: exp },
    });
  },

  async findByResetToken(token: string) {
    return prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExp: { gte: new Date() },
      },
    });
  },

  async clearResetToken(id: string) {
    return prisma.user.update({
      where: { id },
      data: { resetToken: null, resetTokenExp: null },
    });
  },
};

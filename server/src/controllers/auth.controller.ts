import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { sendSuccess } from '../utils/response';
import { AuthRequest } from '../middlewares/auth';

export const authController = {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.register(req.body);
      sendSuccess(res, { statusCode: 201, data: result, message: 'Account created successfully' });
    } catch (error) {
      next(error);
    }
  },

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.login(req.body);
      sendSuccess(res, { data: result, message: 'Logged in successfully' });
    } catch (error) {
      next(error);
    }
  },

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.refresh(req.body.refreshToken);
      sendSuccess(res, { data: result, message: 'Token refreshed successfully' });
    } catch (error) {
      next(error);
    }
  },

  async logout(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await authService.logout(req.userId!);
      sendSuccess(res, { message: 'Logged out successfully' });
    } catch (error) {
      next(error);
    }
  },

  async me(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await authService.getProfile(req.userId!);
      sendSuccess(res, { data: user });
    } catch (error) {
      next(error);
    }
  },

  async changePassword(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await authService.changePassword(req.userId!, req.body);
      sendSuccess(res, { message: 'Password changed successfully. Please sign in again.' });
    } catch (error) {
      next(error);
    }
  },

  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      await authService.forgotPassword(req.body.email);
      sendSuccess(res, { message: 'If the email exists, a reset link has been sent.' });
    } catch (error) {
      next(error);
    }
  },

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      await authService.resetPassword(req.body.token, req.body.password);
      sendSuccess(res, { message: 'Password reset successfully. Please sign in.' });
    } catch (error) {
      next(error);
    }
  },

  async updateProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await authService.updateProfile(req.userId!, req.body);
      sendSuccess(res, { data: user, message: 'Profile updated successfully' });
    } catch (error) {
      next(error);
    }
  },

  async getSettings(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const settings = await authService.getSettings(req.userId!);
      sendSuccess(res, { data: settings });
    } catch (error) {
      next(error);
    }
  },

  async updateSettings(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const settings = await authService.updateSettings(req.userId!, req.body);
      sendSuccess(res, { data: settings, message: 'Settings updated successfully' });
    } catch (error) {
      next(error);
    }
  },
};


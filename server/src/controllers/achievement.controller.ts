import { Response, NextFunction } from 'express';
import { achievementService } from '../services/achievement.service';
import { sendSuccess } from '../utils/response';
import { AuthRequest } from '../middlewares/auth';

export const achievementController = {
  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await achievementService.getUserAchievements(req.userId!);
      sendSuccess(res, { data });
    } catch (error) {
      next(error);
    }
  },
};

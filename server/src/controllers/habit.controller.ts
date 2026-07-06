import { Request, Response, NextFunction } from 'express';
import { habitService } from '../services/habit.service';
import { sendSuccess } from '../utils/response';

export const habitController = {
  async getAll(_req: Request, res: Response, next: NextFunction) {
    try {
      const habits = await habitService.getAll();
      sendSuccess(res, { data: habits });
    } catch (error) {
      next(error);
    }
  },
};

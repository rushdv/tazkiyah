import { Response, NextFunction } from 'express';
import { reflectionService } from '../services/reflection.service';
import { sendSuccess } from '../utils/response';
import { AuthRequest } from '../middlewares/auth';

export const reflectionController = {
  async upsert(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const reflection = await reflectionService.upsertReflection(req.userId!, req.body);
      sendSuccess(res, { statusCode: 201, data: reflection, message: 'Reflection recorded' });
    } catch (error) {
      next(error);
    }
  },

  async getByDate(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const dateStr = String(req.params.date);
      const reflection = await reflectionService.getReflectionByDate(req.userId!, dateStr);
      sendSuccess(res, { data: reflection });
    } catch (error) {
      next(error);
    }
  },
};

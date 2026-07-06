import { Response, NextFunction } from 'express';
import { recordService } from '../services/record.service';
import { sendSuccess } from '../utils/response';
import { AuthRequest } from '../middlewares/auth';

export const recordController = {
  async getToday(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await recordService.getToday(req.userId!);
      sendSuccess(res, { data });
    } catch (error) {
      next(error);
    }
  },

  async upsert(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const record = await recordService.upsertRecord(req.userId!, req.body);
      sendSuccess(res, { statusCode: 201, data: record, message: 'Habit recorded successfully' });
    } catch (error) {
      next(error);
    }
  },

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const record = await recordService.updateRecord(req.userId!, String(req.params.id), req.body);
      sendSuccess(res, { data: record, message: 'Habit record updated successfully' });
    } catch (error) {
      next(error);
    }
  },

  async getDayDetail(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await recordService.getDayDetail(req.userId!, String(req.params.date));
      sendSuccess(res, { data });
    } catch (error) {
      next(error);
    }
  },

  async getHistory(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const queryParams = {
        page: Number(req.query.page) || 1,
        limit: Number(req.query.limit) || 20,
        startDate: req.query.startDate as string | undefined,
        endDate: req.query.endDate as string | undefined,
        status: req.query.status as string | undefined,
        sort: req.query.sort as string | undefined,
        order: req.query.order as 'asc' | 'desc' | undefined,
      };
      const data = await recordService.getHistory(req.userId!, queryParams);
      sendSuccess(res, { data: data.data, meta: data.meta });
    } catch (error) {
      next(error);
    }
  },

  async getMonthlyAnalytics(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const year = parseInt(String(req.params.year), 10);
      const month = parseInt(String(req.params.month), 10);
      const data = await recordService.getMonthlyAnalytics(req.userId!, year, month);
      sendSuccess(res, { data });
    } catch (error) {
      next(error);
    }
  },

  async getWeeklyReport(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await recordService.getWeeklyReport(
        req.userId!,
        String(req.query.startDate),
        String(req.query.endDate),
      );
      sendSuccess(res, { data });
    } catch (error) {
      next(error);
    }
  },
};

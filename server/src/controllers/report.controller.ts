import { Response, NextFunction } from 'express';
import { reportService } from '../services/report.service';
import { sendSuccess } from '../utils/response';
import { AuthRequest } from '../middlewares/auth';

export const reportController = {
  async generate(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const report = await reportService.generateReport(req.userId!, req.body);
      sendSuccess(res, { statusCode: 201, data: report, message: 'Report generated successfully' });
    } catch (error) {
      next(error);
    }
  },

  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const reports = await reportService.getUserReports(req.userId!);
      sendSuccess(res, { data: reports });
    } catch (error) {
      next(error);
    }
  },

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const report = await reportService.getReportById(req.userId!, String(req.params.id));
      sendSuccess(res, { data: report });
    } catch (error) {
      next(error);
    }
  },

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await reportService.deleteReport(req.userId!, String(req.params.id));
      sendSuccess(res, { message: 'Report deleted successfully' });
    } catch (error) {
      next(error);
    }
  },
};

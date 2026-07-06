import { Router } from 'express';
import { recordController } from '../controllers/record.controller';
import { authenticate } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { habitRecordCreateSchema, habitRecordUpdateSchema, paginationSchema } from '@tazkiyah/shared';

const router = Router();

router.use(authenticate);

router.get('/today', recordController.getToday);
router.get('/history', validate(paginationSchema, 'query'), recordController.getHistory);
router.get('/weekly-report', recordController.getWeeklyReport);
router.get('/analytics/:year/:month', recordController.getMonthlyAnalytics);
router.get('/day/:date', recordController.getDayDetail);
router.post('/', validate(habitRecordCreateSchema), recordController.upsert);
router.patch('/:id', validate(habitRecordUpdateSchema), recordController.update);

export default router;

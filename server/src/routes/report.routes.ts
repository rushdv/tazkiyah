import { Router } from 'express';
import { reportController } from '../controllers/report.controller';
import { authenticate } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { reportGenerateSchema } from '@tazkiyah/shared';

const router = Router();

router.use(authenticate);

router.post('/generate', validate(reportGenerateSchema), reportController.generate);
router.get('/', reportController.getAll);
router.get('/:id', reportController.getById);
router.delete('/:id', reportController.delete);

export default router;

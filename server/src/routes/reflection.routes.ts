import { Router } from 'express';
import { reflectionController } from '../controllers/reflection.controller';
import { authenticate } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { reflectionSchema } from '@tazkiyah/shared';

const router = Router();

router.use(authenticate);

router.post('/', validate(reflectionSchema), reflectionController.upsert);
router.get('/:date', reflectionController.getByDate);

export default router;

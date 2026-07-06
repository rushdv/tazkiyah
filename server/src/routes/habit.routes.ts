import { Router } from 'express';
import { habitController } from '../controllers/habit.controller';
import { authenticate } from '../middlewares/auth';

const router = Router();

router.use(authenticate);
router.get('/', habitController.getAll);

export default router;

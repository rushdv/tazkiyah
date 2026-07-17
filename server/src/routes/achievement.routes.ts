import { Router } from 'express';
import { achievementController } from '../controllers/achievement.controller';
import { authenticate } from '../middlewares/auth';

const router = Router();

router.use(authenticate);
router.get('/', achievementController.getAll);

export default router;

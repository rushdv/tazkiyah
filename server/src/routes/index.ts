import { Router } from 'express';
import authRoutes from './auth.routes';
import habitRoutes from './habit.routes';
import recordRoutes from './record.routes';
import achievementRoutes from './achievement.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/habits', habitRoutes);
router.use('/records', recordRoutes);
router.use('/achievements', achievementRoutes);

export default router;


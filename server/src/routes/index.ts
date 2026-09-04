import { Router } from 'express';
import authRoutes from './auth.routes';
import habitRoutes from './habit.routes';
import recordRoutes from './record.routes';
import achievementRoutes from './achievement.routes';
import reflectionRoutes from './reflection.routes';
import reportRoutes from './report.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/habits', habitRoutes);
router.use('/records', recordRoutes);
router.use('/achievements', achievementRoutes);
router.use('/reflections', reflectionRoutes);
router.use('/reports', reportRoutes);

export default router;


import { Router } from 'express';
import authRoutes from './auth.routes';
import habitRoutes from './habit.routes';
import recordRoutes from './record.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/habits', habitRoutes);
router.use('/records', recordRoutes);

export default router;

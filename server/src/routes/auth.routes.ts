import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updateProfileSchema,
  updateSettingsSchema,
} from '@tazkiyah/shared';

const router = Router();

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/refresh', validate(refreshTokenSchema), authController.refresh);
router.post('/forgot-password', validate(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword);

router.use(authenticate);
router.get('/me', authController.me);
router.post('/logout', authController.logout);
router.post('/change-password', validate(changePasswordSchema), authController.changePassword);
router.patch('/profile', validate(updateProfileSchema), authController.updateProfile);
router.get('/settings', authController.getSettings);
router.patch('/settings', validate(updateSettingsSchema), authController.updateSettings);

export default router;


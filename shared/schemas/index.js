"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paginationSchema = exports.reminderUpdateSchema = exports.reminderCreateSchema = exports.habitRecordUpdateSchema = exports.habitRecordCreateSchema = exports.updateProfileSchema = exports.resetPasswordSchema = exports.forgotPasswordSchema = exports.changePasswordSchema = exports.refreshTokenSchema = exports.loginSchema = exports.registerSchema = exports.habitSlugs = void 0;
const zod_1 = require("zod");
exports.habitSlugs = [
    'morning_azkar',
    'evening_azkar',
    'dua',
    'quran',
    'exercise',
    'islamic_learning',
];
exports.registerSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Name must be at least 2 characters').max(100),
    email: zod_1.z.string().email('Invalid email address'),
    password: zod_1.z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .max(128)
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain uppercase, lowercase, and a number'),
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email address'),
    password: zod_1.z.string().min(1, 'Password is required'),
    rememberMe: zod_1.z.boolean().optional().default(false),
});
exports.refreshTokenSchema = zod_1.z.object({
    refreshToken: zod_1.z.string().min(1, 'Refresh token is required'),
});
exports.changePasswordSchema = zod_1.z
    .object({
    currentPassword: zod_1.z.string().min(1, 'Current password is required'),
    newPassword: zod_1.z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .max(128)
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain uppercase, lowercase, and a number'),
    confirmPassword: zod_1.z.string().min(1, 'Please confirm your password'),
})
    .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
});
exports.forgotPasswordSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email address'),
});
exports.resetPasswordSchema = zod_1.z
    .object({
    token: zod_1.z.string().min(1, 'Token is required'),
    password: zod_1.z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .max(128)
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain uppercase, lowercase, and a number'),
    confirmPassword: zod_1.z.string().min(1, 'Please confirm your password'),
})
    .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
});
exports.updateProfileSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).max(100).optional(),
    avatar: zod_1.z.string().url().nullable().optional(),
    timezone: zod_1.z.string().optional(),
    theme: zod_1.z.enum(['dark', 'light', 'system']).optional(),
});
exports.habitRecordCreateSchema = zod_1.z.object({
    habitId: zod_1.z.string().uuid(),
    date: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
    status: zod_1.z.enum(['completed', 'skipped']),
    completedAt: zod_1.z.string().nullable().optional(),
    notes: zod_1.z.string().max(500).nullable().optional(),
    skipReason: zod_1.z.string().max(500).nullable().optional(),
    durationMinutes: zod_1.z.number().int().min(1).max(1440).nullable().optional(),
});
exports.habitRecordUpdateSchema = exports.habitRecordCreateSchema.partial();
exports.reminderCreateSchema = zod_1.z.object({
    habitId: zod_1.z.string().uuid(),
    type: zod_1.z.enum(['fajr', 'maghrib', 'custom']),
    time: zod_1.z.string().regex(/^\d{2}:\d{2}$/, 'Time must be HH:MM'),
    enabled: zod_1.z.boolean().optional().default(true),
});
exports.reminderUpdateSchema = exports.reminderCreateSchema.partial();
exports.paginationSchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().min(1).default(1),
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(10),
    sort: zod_1.z.string().optional(),
    order: zod_1.z.enum(['asc', 'desc']).optional().default('desc'),
    search: zod_1.z.string().optional(),
    startDate: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    endDate: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    status: zod_1.z.enum(['completed', 'skipped', 'pending']).optional(),
});
//# sourceMappingURL=index.js.map
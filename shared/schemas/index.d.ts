import { z } from 'zod';
export declare const habitSlugs: readonly ["morning_azkar", "evening_azkar", "dua", "quran", "exercise", "islamic_learning"];
export declare const registerSchema: z.ZodObject<{
    name: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    name: string;
    password: string;
}, {
    email: string;
    name: string;
    password: string;
}>;
export declare const loginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    rememberMe: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
    rememberMe: boolean;
}, {
    email: string;
    password: string;
    rememberMe?: boolean | undefined;
}>;
export declare const refreshTokenSchema: z.ZodObject<{
    refreshToken: z.ZodString;
}, "strip", z.ZodTypeAny, {
    refreshToken: string;
}, {
    refreshToken: string;
}>;
export declare const changePasswordSchema: z.ZodEffects<z.ZodObject<{
    currentPassword: z.ZodString;
    newPassword: z.ZodString;
    confirmPassword: z.ZodString;
}, "strip", z.ZodTypeAny, {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}, {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}>, {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}, {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}>;
export declare const forgotPasswordSchema: z.ZodObject<{
    email: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
}, {
    email: string;
}>;
export declare const resetPasswordSchema: z.ZodEffects<z.ZodObject<{
    token: z.ZodString;
    password: z.ZodString;
    confirmPassword: z.ZodString;
}, "strip", z.ZodTypeAny, {
    password: string;
    confirmPassword: string;
    token: string;
}, {
    password: string;
    confirmPassword: string;
    token: string;
}>, {
    password: string;
    confirmPassword: string;
    token: string;
}, {
    password: string;
    confirmPassword: string;
    token: string;
}>;
export declare const updateProfileSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    avatar: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    timezone: z.ZodOptional<z.ZodString>;
    theme: z.ZodOptional<z.ZodEnum<["dark", "light", "system"]>>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    avatar?: string | null | undefined;
    theme?: "dark" | "light" | "system" | undefined;
    timezone?: string | undefined;
}, {
    name?: string | undefined;
    avatar?: string | null | undefined;
    theme?: "dark" | "light" | "system" | undefined;
    timezone?: string | undefined;
}>;
export declare const habitRecordCreateSchema: z.ZodObject<{
    habitId: z.ZodString;
    date: z.ZodString;
    status: z.ZodEnum<["completed", "skipped"]>;
    completedAt: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    notes: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    skipReason: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    durationMinutes: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    date: string;
    status: "completed" | "skipped";
    habitId: string;
    completedAt?: string | null | undefined;
    notes?: string | null | undefined;
    skipReason?: string | null | undefined;
    durationMinutes?: number | null | undefined;
}, {
    date: string;
    status: "completed" | "skipped";
    habitId: string;
    completedAt?: string | null | undefined;
    notes?: string | null | undefined;
    skipReason?: string | null | undefined;
    durationMinutes?: number | null | undefined;
}>;
export declare const habitRecordUpdateSchema: z.ZodObject<{
    habitId: z.ZodOptional<z.ZodString>;
    date: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<["completed", "skipped"]>>;
    completedAt: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    notes: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    skipReason: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    durationMinutes: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
}, "strip", z.ZodTypeAny, {
    date?: string | undefined;
    status?: "completed" | "skipped" | undefined;
    completedAt?: string | null | undefined;
    notes?: string | null | undefined;
    skipReason?: string | null | undefined;
    durationMinutes?: number | null | undefined;
    habitId?: string | undefined;
}, {
    date?: string | undefined;
    status?: "completed" | "skipped" | undefined;
    completedAt?: string | null | undefined;
    notes?: string | null | undefined;
    skipReason?: string | null | undefined;
    durationMinutes?: number | null | undefined;
    habitId?: string | undefined;
}>;
export declare const reminderCreateSchema: z.ZodObject<{
    habitId: z.ZodString;
    type: z.ZodEnum<["fajr", "maghrib", "custom"]>;
    time: z.ZodString;
    enabled: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    habitId: string;
    enabled: boolean;
    time: string;
    type: "fajr" | "maghrib" | "custom";
}, {
    habitId: string;
    time: string;
    type: "fajr" | "maghrib" | "custom";
    enabled?: boolean | undefined;
}>;
export declare const reminderUpdateSchema: z.ZodObject<{
    habitId: z.ZodOptional<z.ZodString>;
    type: z.ZodOptional<z.ZodEnum<["fajr", "maghrib", "custom"]>>;
    time: z.ZodOptional<z.ZodString>;
    enabled: z.ZodOptional<z.ZodDefault<z.ZodOptional<z.ZodBoolean>>>;
}, "strip", z.ZodTypeAny, {
    habitId?: string | undefined;
    enabled?: boolean | undefined;
    time?: string | undefined;
    type?: "fajr" | "maghrib" | "custom" | undefined;
}, {
    habitId?: string | undefined;
    enabled?: boolean | undefined;
    time?: string | undefined;
    type?: "fajr" | "maghrib" | "custom" | undefined;
}>;
export declare const paginationSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    sort: z.ZodOptional<z.ZodString>;
    order: z.ZodDefault<z.ZodOptional<z.ZodEnum<["asc", "desc"]>>>;
    search: z.ZodOptional<z.ZodString>;
    startDate: z.ZodOptional<z.ZodString>;
    endDate: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<["completed", "skipped", "pending"]>>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    order: "asc" | "desc";
    sort?: string | undefined;
    status?: "completed" | "skipped" | "pending" | undefined;
    search?: string | undefined;
    startDate?: string | undefined;
    endDate?: string | undefined;
}, {
    sort?: string | undefined;
    status?: "completed" | "skipped" | "pending" | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    order?: "asc" | "desc" | undefined;
    search?: string | undefined;
    startDate?: string | undefined;
    endDate?: string | undefined;
}>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type HabitRecordCreateInput = z.infer<typeof habitRecordCreateSchema>;
export type HabitRecordUpdateInput = z.infer<typeof habitRecordUpdateSchema>;
export type ReminderCreateInput = z.infer<typeof reminderCreateSchema>;
export type ReminderUpdateInput = z.infer<typeof reminderUpdateSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;

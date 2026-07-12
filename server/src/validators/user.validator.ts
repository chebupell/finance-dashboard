import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

const updateProfileSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters').optional(),
    email: z.string().email('Invalid email format').optional(),
    currentPassword: z.string().min(1, 'Enter current password').optional(),
    newPassword: z.string().min(6, 'Password must be at least 6 characters').optional(),
    confirmPassword: z.string().min(6, 'Password must be at least 6 characters').optional(),
  })
  .superRefine((data, ctx) => {
    const isChangingPassword = !!(data.newPassword || data.confirmPassword || data.currentPassword);

    if (isChangingPassword) {
      if (!data.currentPassword) {
        ctx.addIssue({
          code: 'custom',
          message: 'Current password is required',
          path: ['currentPassword'],
        });
      }
      if (!data.newPassword) {
        ctx.addIssue({
          code: 'custom',
          message: 'New password is required',
          path: ['newPassword'],
        });
      }
      if (!data.confirmPassword) {
        ctx.addIssue({
          code: 'custom',
          message: 'Confirm password is required',
          path: ['confirmPassword'],
        });
      }
      if (data.newPassword && data.confirmPassword && data.newPassword !== data.confirmPassword) {
        ctx.addIssue({
          code: 'custom',
          message: 'Passwords do not match',
          path: ['confirmPassword'],
        });
      }
    }
  });

export const validateUpdateProfile = (req: Request, res: Response, next: NextFunction) => {
  const result = updateProfileSchema.safeParse(req.body);
  if (!result.success) {
    const message = result.error.issues[0]?.message ?? 'Validation failed';
    return res.status(400).json({ error: message });
  }
  req.body = result.data;
  next();
};

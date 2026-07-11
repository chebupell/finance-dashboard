import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

const registerSchema = z.object({
  name: z.string().min(2, 'Имя минимум 2 символа'), // ✅ было username → name
  email: z.string().email('Неверный формат email'),
  password: z.string().min(6, 'Пароль минимум 6 символов'),
  confirmPassword: z.string().min(6, 'Пароль минимум 6 символов'),
  enableAutoLogin: z.boolean().optional(),
});

const loginSchema = z.object({
  email: z.string().email('Неверный формат email'),
  password: z.string().min(1, 'Введите пароль'),
});

export const validateRegister = (req: Request, res: Response, next: NextFunction) => {
  const result = registerSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json(result.error);
  }
  req.body = result.data;
  next();
};

export const validateLogin = (req: Request, res: Response, next: NextFunction) => {
  const result = loginSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json(result.error);
  }
  req.body = result.data;
  next();
};

import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

const transactionSchema = z.object({
  amount: z.number().positive('Сумма должна быть больше 0'),
  description: z.string().optional(),
  category: z.string().optional(),
  type: z.enum(['income', 'expense'], {
    message: 'Тип должен быть income или expense',
  }),
});

export const validateTransaction = (req: Request, res: Response, next: NextFunction) => {
  const result = transactionSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ errors: result.error.flatten().fieldErrors });
    return;
  }
  req.body = result.data;
  next();
};

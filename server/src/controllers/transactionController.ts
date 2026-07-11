import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';

export class TransactionController {
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const transactions = await prisma.transaction.findMany({
        where: { userId: req.userId },
        orderBy: { date: 'desc' },
      });
      res.json(transactions);
    } catch (err) {
      next(err);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { amount, description, category, type } = req.body;

      const transaction = await prisma.transaction.create({
        data: {
          amount,
          description,
          category,
          type,
          userId: req.userId!,
        },
      });
      res.status(201).json(transaction);
    } catch (err) {
      next(err);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await prisma.transaction.delete({
        where: { id: Number(req.params.id) },
      });
      res.json({ message: 'Транзакция удалена' });
    } catch (err) {
      next(err);
    }
  }
}

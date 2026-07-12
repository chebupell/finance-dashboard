import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { AppError } from '../middleware/error.middleware';
import { prisma } from '../lib/prisma';

export class userController {
  static async getAll(_req: Request, res: Response) {
    const users = await prisma.user.findMany();
    res.json(users);
  }

  static async getById(req: Request, res: Response) {
    const user = await prisma.user.findUnique({ where: { id: Number(req.params.id) } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  }

  static async delete(req: Request, res: Response) {
    const user = await prisma.user.delete({ where: { id: Number(req.params.id) } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'Deleted' });
  }

  static async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!;
      const { name, email, currentPassword, newPassword } = req.body;

      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) throw new AppError('User not found', 404);

      if (newPassword) {
        if (!(await bcrypt.compare(currentPassword, user.password))) {
          throw new AppError('Invalid current password', 401);
        }
      }

      if (email && email !== user.email) {
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) throw new AppError('Email already in use', 400);
      }

      const data: { name?: string; email?: string; password?: string } = {};
      if (name) data.name = name;
      if (email) data.email = email;
      if (newPassword) data.password = await bcrypt.hash(newPassword, 10);

      if (Object.keys(data).length === 0) {
        throw new AppError('No fields to update', 400);
      }

      const updated = await prisma.user.update({ where: { id: userId }, data });
      res.json({ id: updated.id, name: updated.name, email: updated.email });
    } catch (err) {
      next(err);
    }
  }
}

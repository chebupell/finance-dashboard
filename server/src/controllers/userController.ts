import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export class userController {
  static async getAll(res: Response) {
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
}

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface JwtPayload {
  userId?: number;
  id?: number; // поддержка старых токенов
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Токен не предоставлен' });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

    // поддержка обоих форматов токена
    const userId = decoded.userId ?? decoded.id;

    if (!userId) {
      res.status(401).json({ error: 'Токен недействителен' });
      return;
    }

    req.userId = userId;
    next();
  } catch {
    res.status(401).json({ error: 'Токен недействителен или истёк' });
  }
};

import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction): void => {
  // Подробное логирование для отладки
  console.error('=== ERROR ===');
  console.error('Name:', err.name);
  console.error('Message:', err.message);
  console.error('Stack:', err.stack);
  console.error('=============');

  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  if (err.name === 'PrismaClientKnownRequestError') {
    res.status(400).json({ error: 'Ошибка базы данных' });
    return;
  }

  // Возвращаем реальную ошибку в dev режиме
  res.status(500).json({
    error: 'Внутренняя ошибка сервера',
    details: process.env.NODE_ENV !== 'production' ? err.message : undefined,
  });
};

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AppError, errorHandler } from '../middleware/error.middleware';
import { createMockRequest, createMockResponse, createMockNext } from '../test/helpers';

describe('errorHandler', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('returns AppError status and message', () => {
    const err = new AppError('User already exists', 400);
    const req = createMockRequest();
    const res = createMockResponse();
    const next = createMockNext();

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'User already exists' });
  });

  it('returns 400 for Prisma known request errors', () => {
    const err = new Error('Unique constraint failed');
    err.name = 'PrismaClientKnownRequestError';
    const req = createMockRequest();
    const res = createMockResponse();
    const next = createMockNext();

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Ошибка базы данных' });
  });

  it('returns 500 for unknown errors in test mode', () => {
    const err = new Error('Something broke');
    const req = createMockRequest();
    const res = createMockResponse();
    const next = createMockNext();

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Внутренняя ошибка сервера',
      details: 'Something broke',
    });
  });
});

describe('AppError', () => {
  it('defaults statusCode to 500', () => {
    const err = new AppError('Server error');
    expect(err.statusCode).toBe(500);
    expect(err.name).toBe('AppError');
  });
});

import { describe, it, expect } from 'vitest';
import jwt from 'jsonwebtoken';
import { authMiddleware } from '../middleware/auth.middleware';
import { createMockRequest, createMockResponse, createMockNext } from '../test/helpers';

describe('authMiddleware', () => {
  it('returns 401 when token is missing', () => {
    const req = createMockRequest();
    const res = createMockResponse();
    const next = createMockNext();

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Токен не предоставлен' });
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 401 for invalid token', () => {
    const req = createMockRequest({
      headers: { authorization: 'Bearer invalid-token' },
    });
    const res = createMockResponse();
    const next = createMockNext();

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Токен недействителен или истёк' });
    expect(next).not.toHaveBeenCalled();
  });

  it('sets req.userId and calls next for valid token with userId', () => {
    const token = jwt.sign({ userId: 42 }, process.env.JWT_SECRET!, { expiresIn: '1h' });
    const req = createMockRequest({
      headers: { authorization: `Bearer ${token}` },
    });
    const res = createMockResponse();
    const next = createMockNext();

    authMiddleware(req, res, next);

    expect(req.userId).toBe(42);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('supports legacy token payload with id field', () => {
    const token = jwt.sign({ id: 7 }, process.env.JWT_SECRET!, { expiresIn: '1h' });
    const req = createMockRequest({
      headers: { authorization: `Bearer ${token}` },
    });
    const res = createMockResponse();
    const next = createMockNext();

    authMiddleware(req, res, next);

    expect(req.userId).toBe(7);
    expect(next).toHaveBeenCalled();
  });

  it('returns 401 when token payload has no user id', () => {
    const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET!, { expiresIn: '1h' });
    const req = createMockRequest({
      headers: { authorization: `Bearer ${token}` },
    });
    const res = createMockResponse();
    const next = createMockNext();

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Токен недействителен' });
    expect(next).not.toHaveBeenCalled();
  });
});

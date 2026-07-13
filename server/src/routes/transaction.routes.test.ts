import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { mockPrisma } from '../test/prisma-mock';
import app from '../app';

function authHeader(userId = 1) {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET!, { expiresIn: '1h' });
  return { Authorization: `Bearer ${token}` };
}

describe('GET /api/transactions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 without token', async () => {
    const res = await request(app).get('/api/transactions');
    expect(res.status).toBe(401);
  });

  it('returns user transactions', async () => {
    const transactions = [
      { id: 1, amount: 100, type: 'expense', userId: 1, date: new Date().toISOString() },
    ];
    mockPrisma.transaction.findMany.mockResolvedValue(transactions);

    const res = await request(app).get('/api/transactions').set(authHeader());

    expect(res.status).toBe(200);
    expect(res.body).toEqual(transactions);
    expect(mockPrisma.transaction.findMany).toHaveBeenCalledWith({
      where: { userId: 1 },
      orderBy: { date: 'desc' },
    });
  });
});

describe('POST /api/transactions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates a transaction', async () => {
    const created = {
      id: 2,
      amount: 250,
      description: 'Salary',
      category: 'Income',
      type: 'income',
      userId: 1,
      date: new Date().toISOString(),
    };
    mockPrisma.transaction.create.mockResolvedValue(created);

    const res = await request(app)
      .post('/api/transactions')
      .set(authHeader())
      .send({
        amount: 250,
        description: 'Salary',
        category: 'Income',
        type: 'income',
      });

    expect(res.status).toBe(201);
    expect(res.body).toEqual(created);
    expect(mockPrisma.transaction.create).toHaveBeenCalledWith({
      data: {
        amount: 250,
        description: 'Salary',
        category: 'Income',
        type: 'income',
        userId: 1,
      },
    });
  });

  it('returns 400 for invalid transaction payload', async () => {
    const res = await request(app)
      .post('/api/transactions')
      .set(authHeader())
      .send({ amount: -10, type: 'income' });

    expect(res.status).toBe(400);
    expect(mockPrisma.transaction.create).not.toHaveBeenCalled();
  });
});

describe('DELETE /api/transactions/:id', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deletes a transaction', async () => {
    mockPrisma.transaction.delete.mockResolvedValue({ id: 5 });

    const res = await request(app).delete('/api/transactions/5').set(authHeader());

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Транзакция удалена');
    expect(mockPrisma.transaction.delete).toHaveBeenCalledWith({
      where: { id: 5 },
    });
  });
});

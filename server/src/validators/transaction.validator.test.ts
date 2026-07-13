import { describe, it, expect } from 'vitest';
import { validateTransaction } from '../validators/transaction.validator';
import { createMockRequest, createMockResponse, createMockNext } from '../test/helpers';

describe('validateTransaction', () => {
  it('calls next for valid expense transaction', () => {
    const req = createMockRequest({
      body: {
        amount: 100,
        description: 'Groceries',
        category: 'Food',
        type: 'expense',
      },
    });
    const res = createMockResponse();
    const next = createMockNext();

    validateTransaction(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.body).toEqual({
      amount: 100,
      description: 'Groceries',
      category: 'Food',
      type: 'expense',
    });
  });

  it('returns 400 for non-positive amount', () => {
    const req = createMockRequest({
      body: { amount: 0, type: 'income' },
    });
    const res = createMockResponse();
    const next = createMockNext();

    validateTransaction(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        errors: expect.objectContaining({
          amount: expect.any(Array),
        }),
      }),
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 400 for invalid type', () => {
    const req = createMockRequest({
      body: { amount: 50, type: 'transfer' },
    });
    const res = createMockResponse();
    const next = createMockNext();

    validateTransaction(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });
});

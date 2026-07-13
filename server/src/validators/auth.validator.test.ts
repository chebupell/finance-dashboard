import { describe, it, expect } from 'vitest';
import { validateRegister, validateLogin } from '../validators/auth.validator';
import { createMockRequest, createMockResponse, createMockNext } from '../test/helpers';

describe('validateRegister', () => {
  it('calls next for valid payload', () => {
    const req = createMockRequest({
      body: {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'secret1',
        confirmPassword: 'secret1',
        enableAutoLogin: true,
      },
    });
    const res = createMockResponse();
    const next = createMockNext();

    validateRegister(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('returns 400 for short name', () => {
    const req = createMockRequest({
      body: {
        name: 'J',
        email: 'john@example.com',
        password: 'secret1',
        confirmPassword: 'secret1',
      },
    });
    const res = createMockResponse();
    const next = createMockNext();

    validateRegister(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 400 for invalid email', () => {
    const req = createMockRequest({
      body: {
        name: 'John Doe',
        email: 'not-an-email',
        password: 'secret1',
        confirmPassword: 'secret1',
      },
    });
    const res = createMockResponse();
    const next = createMockNext();

    validateRegister(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 400 for short password', () => {
    const req = createMockRequest({
      body: {
        name: 'John Doe',
        email: 'john@example.com',
        password: '123',
        confirmPassword: '123',
      },
    });
    const res = createMockResponse();
    const next = createMockNext();

    validateRegister(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });
});

describe('validateLogin', () => {
  it('calls next for valid payload', () => {
    const req = createMockRequest({
      body: { email: 'john@example.com', password: 'secret1' },
    });
    const res = createMockResponse();
    const next = createMockNext();

    validateLogin(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('returns 400 for missing password', () => {
    const req = createMockRequest({
      body: { email: 'john@example.com' },
    });
    const res = createMockResponse();
    const next = createMockNext();

    validateLogin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });
});

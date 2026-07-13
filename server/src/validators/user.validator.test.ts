import { describe, it, expect } from 'vitest';
import { validateUpdateProfile } from '../validators/user.validator';
import { createMockRequest, createMockResponse, createMockNext } from '../test/helpers';

describe('validateUpdateProfile', () => {
  it('calls next when updating name only', () => {
    const req = createMockRequest({ body: { name: 'Jane Doe' } });
    const res = createMockResponse();
    const next = createMockNext();

    validateUpdateProfile(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('returns 400 when password fields are incomplete', () => {
    const req = createMockRequest({
      body: { newPassword: 'newpass1' },
    });
    const res = createMockResponse();
    const next = createMockNext();

    validateUpdateProfile(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Current password is required' });
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 400 when passwords do not match', () => {
    const req = createMockRequest({
      body: {
        currentPassword: 'oldpass1',
        newPassword: 'newpass1',
        confirmPassword: 'different',
      },
    });
    const res = createMockResponse();
    const next = createMockNext();

    validateUpdateProfile(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Passwords do not match' });
    expect(next).not.toHaveBeenCalled();
  });

  it('calls next for valid password change', () => {
    const req = createMockRequest({
      body: {
        currentPassword: 'oldpass1',
        newPassword: 'newpass1',
        confirmPassword: 'newpass1',
      },
    });
    const res = createMockResponse();
    const next = createMockNext();

    validateUpdateProfile(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });
});

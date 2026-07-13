import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { mockPrisma } from '../test/prisma-mock';
import app from '../app';

function authHeader(userId = 1) {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET!, { expiresIn: '1h' });
  return { Authorization: `Bearer ${token}` };
}

describe('GET /api/users', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 without token', async () => {
    const res = await request(app).get('/api/users');
    expect(res.status).toBe(401);
  });

  it('returns all users', async () => {
    const users = [{ id: 1, name: 'John', email: 'john@example.com' }];
    mockPrisma.user.findMany.mockResolvedValue(users);

    const res = await request(app).get('/api/users').set(authHeader());

    expect(res.status).toBe(200);
    expect(res.body).toEqual(users);
  });
});

describe('GET /api/users/:id', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns user by id', async () => {
    const user = { id: 2, name: 'Jane', email: 'jane@example.com' };
    mockPrisma.user.findUnique.mockResolvedValue(user);

    const res = await request(app).get('/api/users/2').set(authHeader());

    expect(res.status).toBe(200);
    expect(res.body).toEqual(user);
  });

  it('returns 404 when user not found', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);

    const res = await request(app).get('/api/users/999').set(authHeader());

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('User not found');
  });
});

describe('PATCH /api/users/profile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('updates user name', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 1,
      name: 'John',
      email: 'john@example.com',
      password: 'hashed',
      enableAutoLogin: true,
    });
    mockPrisma.user.update.mockResolvedValue({
      id: 1,
      name: 'John Updated',
      email: 'john@example.com',
    });

    const res = await request(app)
      .patch('/api/users/profile')
      .set(authHeader())
      .send({ name: 'John Updated' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      id: 1,
      name: 'John Updated',
      email: 'john@example.com',
    });
  });

  it('returns 401 for wrong current password', async () => {
    const hashedPassword = await bcrypt.hash('correct-pass', 10);
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 1,
      name: 'John',
      email: 'john@example.com',
      password: hashedPassword,
      enableAutoLogin: true,
    });

    const res = await request(app)
      .patch('/api/users/profile')
      .set(authHeader())
      .send({
        currentPassword: 'wrong-pass',
        newPassword: 'newpass1',
        confirmPassword: 'newpass1',
      });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Invalid current password');
  });

  it('returns 400 when email is already taken', async () => {
    mockPrisma.user.findUnique
      .mockResolvedValueOnce({
        id: 1,
        name: 'John',
        email: 'john@example.com',
        password: 'hashed',
        enableAutoLogin: true,
      })
      .mockResolvedValueOnce({ id: 2, email: 'taken@example.com' });

    const res = await request(app)
      .patch('/api/users/profile')
      .set(authHeader())
      .send({ email: 'taken@example.com' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Email already in use');
  });
});

describe('DELETE /api/users/:id', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deletes user', async () => {
    mockPrisma.user.delete.mockResolvedValue({ id: 3 });

    const res = await request(app).delete('/api/users/3').set(authHeader());

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Deleted');
  });
});

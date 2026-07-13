import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import bcrypt from 'bcryptjs';
import { mockPrisma } from '../test/prisma-mock';
import app from '../app';

describe('POST /api/auth/register', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('registers a new user and returns token', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);
    mockPrisma.user.create.mockResolvedValue({
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      password: 'hashed',
      enableAutoLogin: true,
    });

    const res = await request(app).post('/api/auth/register').send({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'secret1',
      confirmPassword: 'secret1',
      enableAutoLogin: true,
    });

    expect(res.status).toBe(201);
    expect(res.body.token).toBeTypeOf('string');
    expect(res.body.user).toEqual({
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
    });
    expect(mockPrisma.user.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        name: 'John Doe',
        email: 'john@example.com',
        enableAutoLogin: true,
      }),
    });
  });

  it('returns 400 when user already exists', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ id: 1, email: 'john@example.com' });

    const res = await request(app).post('/api/auth/register').send({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'secret1',
      confirmPassword: 'secret1',
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('User already exists');
  });

  it('returns 400 for invalid payload', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'J',
      email: 'bad-email',
      password: '123',
      confirmPassword: '123',
    });

    expect(res.status).toBe(400);
    expect(mockPrisma.user.create).not.toHaveBeenCalled();
  });
});

describe('POST /api/auth/login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('logs in with valid credentials', async () => {
    const hashedPassword = await bcrypt.hash('secret1', 10);
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      password: hashedPassword,
      enableAutoLogin: true,
    });

    const res = await request(app).post('/api/auth/login').send({
      email: 'john@example.com',
      password: 'secret1',
    });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeTypeOf('string');
    expect(res.body.user.email).toBe('john@example.com');
  });

  it('returns 404 when user is not found', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);

    const res = await request(app).post('/api/auth/login').send({
      email: 'missing@example.com',
      password: 'secret1',
    });

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('No user found');
  });

  it('returns 401 for wrong password', async () => {
    const hashedPassword = await bcrypt.hash('secret1', 10);
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      password: hashedPassword,
      enableAutoLogin: true,
    });

    const res = await request(app).post('/api/auth/login').send({
      email: 'john@example.com',
      password: 'wrong-password',
    });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Invalid password');
  });
});

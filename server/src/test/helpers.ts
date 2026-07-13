import { vi } from 'vitest';
import type { Request, Response, NextFunction } from 'express';

export function createMockResponse() {
  const res = {
    statusCode: 200,
    body: undefined as unknown,
    status: vi.fn().mockImplementation(function (this: typeof res, code: number) {
      this.statusCode = code;
      return this;
    }),
    json: vi.fn().mockImplementation(function (this: typeof res, payload: unknown) {
      this.body = payload;
      return this;
    }),
  };

  return res as unknown as Response & { statusCode: number; body: unknown };
}

export function createMockRequest(overrides: Partial<Request> = {}): Request {
  return {
    body: {},
    headers: {},
    params: {},
    ...overrides,
  } as Request;
}

export function createMockNext(): NextFunction {
  return vi.fn() as NextFunction;
}

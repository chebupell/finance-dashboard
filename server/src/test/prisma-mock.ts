import { vi, type Mock } from 'vitest';

type MockPrismaClient = {
  user: {
    findUnique: Mock;
    findMany: Mock;
    create: Mock;
    update: Mock;
    delete: Mock;
  };
  transaction: {
    findMany: Mock;
    create: Mock;
    delete: Mock;
  };
};

const { mockPrisma } = vi.hoisted(() => ({
  mockPrisma: {
    user: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    transaction: {
      findMany: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
  } satisfies MockPrismaClient,
}));

vi.mock('../lib/prisma', () => ({
  prisma: mockPrisma,
}));

export { mockPrisma };

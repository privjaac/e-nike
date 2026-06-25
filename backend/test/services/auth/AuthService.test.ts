import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthService } from '@/services/auth/AuthService';
import type { IUserRepository } from '@/repositories/user/IUserRepository';
import type { ITokenService } from '@/services/token/ITokenService';
import type { ICartService } from '@/services/cart/ICartService';
import type { User } from '@/domain/User';

vi.mock('bcryptjs', () => ({
  default: {
    hash: vi.fn().mockResolvedValue('hashed-password'),
    compare: vi.fn().mockResolvedValue(true),
  },
}));

function createUser(overrides: Partial<User> = {}): User {
  return {
    id: 1,
    email: 'member@nike.com',
    passwordHash: 'hashed-password',
    firstName: 'Member',
    lastName: 'User',
    role: 'customer',
    membershipTier: 'gold',
    createdAt: 'now',
    ...overrides,
  };
}

function createMockRepo(overrides: Partial<IUserRepository> = {}): IUserRepository {
  return {
    findByEmail: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    ...overrides,
  };
}

function createMockTokenService(overrides: Partial<ITokenService> = {}): ITokenService {
  return {
    sign: vi.fn().mockResolvedValue('jwt-token'),
    verify: vi.fn(),
    ...overrides,
  };
}

function createMockCartService(overrides: Partial<ICartService> = {}): ICartService {
  return {
    getCart: vi.fn(),
    addItem: vi.fn(),
    updateItem: vi.fn(),
    removeItem: vi.fn(),
    mergeOnLogin: vi.fn().mockResolvedValue({ id: 1, userId: 1, sessionId: null, status: 'active', items: [], subtotal: 0 }),
    ...overrides,
  };
}

describe('AuthService.register', () => {
  it('registers a new user successfully', async () => {
    const repo = createMockRepo({
      findByEmail: vi.fn().mockResolvedValue(undefined),
      create: vi.fn().mockResolvedValue(createUser()),
    });
    const tokenService = createMockTokenService();
    const cartService = createMockCartService();
    const service = new AuthService(repo, tokenService, cartService);

    const result = await service.register({ email: 'new@nike.com', password: 'pass123', firstName: 'New', lastName: 'User' });

    expect(repo.create).toHaveBeenCalled();
    expect(result.user.email).toBe('member@nike.com');
    expect(result.token).toBe('jwt-token');
  });

  it('throws when email is already registered', async () => {
    const repo = createMockRepo({
      findByEmail: vi.fn().mockResolvedValue(createUser()),
    });
    const service = new AuthService(repo, createMockTokenService(), createMockCartService());

    await expect(service.register({ email: 'member@nike.com', password: 'pass123', firstName: 'Member', lastName: 'User' })).rejects.toThrow(
      'Email already registered'
    );
    expect(repo.create).not.toHaveBeenCalled();
  });

  it('merges guest cart when sessionId is provided', async () => {
    const repo = createMockRepo({
      findByEmail: vi.fn().mockResolvedValue(undefined),
      create: vi.fn().mockResolvedValue(createUser()),
    });
    const cartService = createMockCartService();
    const service = new AuthService(repo, createMockTokenService(), cartService);

    await service.register({ email: 'new@nike.com', password: 'pass123', firstName: 'New', lastName: 'User', sessionId: 'abc' });

    expect(cartService.mergeOnLogin).toHaveBeenCalledWith('abc', 1);
  });
});

describe('AuthService.login', () => {
  it('logs in with valid credentials', async () => {
    const repo = createMockRepo({
      findByEmail: vi.fn().mockResolvedValue(createUser()),
    });
    const service = new AuthService(repo, createMockTokenService(), createMockCartService());

    const result = await service.login({ email: 'member@nike.com', password: 'member123' });

    expect(result.token).toBe('jwt-token');
    expect(result.user.passwordHash).toBeUndefined();
  });

  it('throws for unknown email', async () => {
    const repo = createMockRepo({ findByEmail: vi.fn().mockResolvedValue(undefined) });
    const service = new AuthService(repo, createMockTokenService(), createMockCartService());

    await expect(service.login({ email: 'ghost@nike.com', password: 'pass' })).rejects.toThrow('Invalid credentials');
  });

  it('throws for invalid password', async () => {
    const { default: bcrypt } = await import('bcryptjs');
    vi.mocked(bcrypt.compare).mockResolvedValueOnce(false);
    const repo = createMockRepo({ findByEmail: vi.fn().mockResolvedValue(createUser()) });
    const service = new AuthService(repo, createMockTokenService(), createMockCartService());

    await expect(service.login({ email: 'member@nike.com', password: 'wrong' })).rejects.toThrow('Invalid credentials');
  });
});

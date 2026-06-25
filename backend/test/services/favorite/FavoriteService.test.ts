import { describe, it, expect, vi } from 'vitest';
import { FavoriteService } from '@/services/favorite/FavoriteService';
import type { IFavoriteRepository } from '@/repositories/favorite/IFavoriteRepository';

function createMockRepo(overrides: Partial<IFavoriteRepository> = {}): IFavoriteRepository {
  return {
    findByUser: vi.fn(),
    findOne: vi.fn(),
    create: vi.fn(),
    delete: vi.fn(),
    ...overrides,
  };
}

describe('FavoriteService', () => {
  it('adds a product when it is not already a favorite', async () => {
    const repo = createMockRepo({
      findOne: vi.fn().mockResolvedValue(undefined),
      create: vi.fn().mockResolvedValue({ id: 1, userId: 1, productId: 5, createdAt: 'now' }),
    });
    const service = new FavoriteService(repo);

    const result = await service.add(1, 5);

    expect(repo.findOne).toHaveBeenCalledWith(1, 5);
    expect(repo.create).toHaveBeenCalledWith(1, 5);
    expect(result).toEqual({ id: 1, userId: 1, productId: 5, createdAt: 'now' });
  });

  it('throws when adding a duplicate favorite', async () => {
    const repo = createMockRepo({
      findOne: vi.fn().mockResolvedValue({ id: 1, userId: 1, productId: 5, createdAt: 'now' }),
    });
    const service = new FavoriteService(repo);

    await expect(service.add(1, 5)).rejects.toThrow('Already in favorites');
    expect(repo.create).not.toHaveBeenCalled();
  });

  it('removes a favorite by user and product', async () => {
    const repo = createMockRepo({ delete: vi.fn().mockResolvedValue(undefined) });
    const service = new FavoriteService(repo);

    await service.remove(1, 5);

    expect(repo.delete).toHaveBeenCalledWith(1, 5);
  });
});

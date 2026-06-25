import { describe, it, expect, vi } from 'vitest';
import { CatalogService } from '@/services/catalog/CatalogService';
import type { ICatalogRepository } from '@/repositories/catalog/ICatalogRepository';
import type { Product, Sku } from '@/domain/Product';

function createMockRepo(overrides: Partial<ICatalogRepository> = {}): ICatalogRepository {
  return {
    findAll: vi.fn(),
    count: vi.fn(),
    findBySlug: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
    findAllCategories: vi.fn(),
    findSkusByProductId: vi.fn(),
    createSku: vi.fn(),
    findSkuById: vi.fn(),
    updateSku: vi.fn(),
    removeSku: vi.fn(),
    ...overrides,
  };
}

describe('CatalogService.createSku', () => {
  const product: Product = {
    id: 2,
    name: 'Nike Pegasus 41',
    slug: 'nike-pegasus-41',
    description: '',
    categoryId: 1,
    sport: 'running',
    gender: 'men',
    basePrice: 130,
    salePrice: null,
    imageUrl: '',
    gallery: [],
    isMemberOnly: false,
    isFullPrice: true,
    status: 'active',
    createdAt: 'now',
  };

  it('creates a SKU when the code is unique for the product', async () => {
    const newSku: Sku = {
      id: 99,
      productId: 2,
      sku: 'NEW-SKU-001',
      size: '9',
      color: 'White',
      colorHex: '#fff',
      stockQuantity: 10,
      weightGrams: null,
    };
    const repo = createMockRepo({
      findById: vi.fn().mockResolvedValue(product),
      findSkusByProductId: vi.fn().mockResolvedValue([]),
      createSku: vi.fn().mockResolvedValue(newSku),
    });
    const service = new CatalogService(repo);

    const result = await service.createSku(2, { sku: 'NEW-SKU-001', size: '9', color: 'White', colorHex: '#fff', stockQuantity: 10, weightGrams: null });

    expect(repo.findById).toHaveBeenCalledWith(2);
    expect(repo.createSku).toHaveBeenCalled();
    expect(result).toEqual(newSku);
  });

  it('throws when SKU code already exists for the same product', async () => {
    const existingSku: Sku = {
      id: 10,
      productId: 2,
      sku: 'NIKEPEGASUS41-8',
      size: '8',
      color: 'Black/White',
      colorHex: '#000',
      stockQuantity: 23,
      weightGrams: null,
    };
    const repo = createMockRepo({
      findById: vi.fn().mockResolvedValue(product),
      findSkusByProductId: vi.fn().mockResolvedValue([existingSku]),
    });
    const service = new CatalogService(repo);

    await expect(
      service.createSku(2, { sku: 'NIKEPEGASUS41-8', size: '8', color: 'Black/White', colorHex: '#000', stockQuantity: 23, weightGrams: null })
    ).rejects.toThrow('SKU code already exists');
    expect(repo.createSku).not.toHaveBeenCalled();
  });
});

import { describe, it, expect, vi } from 'vitest';
import { CartService } from '@/services/cart/CartService';
import type { ICartRepository } from '@/repositories/cart/ICartRepository';
import type { CartRow, CartItem } from '@/domain/Cart';

function createMockRepo(overrides: Partial<ICartRepository> = {}): ICartRepository {
  return {
    findById: vi.fn(),
    findByUserId: vi.fn(),
    findBySessionId: vi.fn(),
    create: vi.fn(),
    assignUser: vi.fn(),
    getItems: vi.fn(),
    findItemByCartAndSku: vi.fn(),
    addItem: vi.fn(),
    updateItem: vi.fn(),
    removeItem: vi.fn(),
    markConverted: vi.fn(),
    ...overrides,
  };
}

function createCartRow(overrides: Partial<CartRow> = {}): CartRow {
  return {
    id: 1,
    userId: null,
    sessionId: 'abc',
    status: 'active',
    createdAt: 'now',
    updatedAt: 'now',
    ...overrides,
  };
}

function createCartItem(overrides: Partial<CartItem> = {}): CartItem {
  return {
    id: 1,
    cartId: 1,
    skuId: 10,
    quantity: 2,
    unitPrice: 130,
    addedAt: 'now',
    sku: undefined,
    product: undefined,
    ...overrides,
  };
}

describe('CartService.addItem', () => {
  it('increments quantity when adding the same SKU', async () => {
    const existing = createCartItem({ id: 5, quantity: 2 });
    const repo = createMockRepo({
      findBySessionId: vi.fn().mockResolvedValue(createCartRow()),
      findItemByCartAndSku: vi.fn().mockResolvedValue(existing),
      updateItem: vi.fn().mockResolvedValue(undefined),
    });
    const service = new CartService(repo);

    const result = await service.addItem({ skuId: 10, quantity: 3, unitPrice: 130, sessionId: 'abc' });

    expect(repo.updateItem).toHaveBeenCalledWith(5, 5);
    expect(repo.addItem).not.toHaveBeenCalled();
    expect(result.quantity).toBe(5);
  });

  it('creates a new line when SKU is different', async () => {
    const newItem = createCartItem({ id: 6, skuId: 11, quantity: 1 });
    const repo = createMockRepo({
      findBySessionId: vi.fn().mockResolvedValue(createCartRow()),
      findItemByCartAndSku: vi.fn().mockResolvedValue(undefined),
      addItem: vi.fn().mockResolvedValue(newItem),
    });
    const service = new CartService(repo);

    const result = await service.addItem({ skuId: 11, quantity: 1, unitPrice: 120, sessionId: 'abc' });

    expect(repo.addItem).toHaveBeenCalledWith({ cartId: 1, skuId: 11, quantity: 1, unitPrice: 120 });
    expect(result.id).toBe(6);
  });
});

describe('CartService.mergeOnLogin', () => {
  it('merges guest cart into user cart combining duplicate SKUs', async () => {
    const guestCart = createCartRow({ id: 2, userId: null, sessionId: 'guest' });
    const userCart = createCartRow({ id: 1, userId: 1, sessionId: null });
    const guestItem = createCartItem({ id: 10, cartId: 2, skuId: 10, quantity: 2 });
    const userItem = createCartItem({ id: 11, cartId: 1, skuId: 10, quantity: 1 });
    const mergedItems = [createCartItem({ id: 11, cartId: 1, skuId: 10, quantity: 3 })];

    const repo = createMockRepo({
      findBySessionId: vi.fn().mockResolvedValue(guestCart),
      findByUserId: vi.fn().mockResolvedValue(userCart),
      getItems: vi.fn()
        .mockResolvedValueOnce([guestItem])
        .mockResolvedValueOnce([userItem])
        .mockResolvedValueOnce(mergedItems),
      updateItem: vi.fn(),
      markConverted: vi.fn(),
    });
    const service = new CartService(repo);

    const result = await service.mergeOnLogin('guest', 1);

    expect(repo.updateItem).toHaveBeenCalledWith(11, 3);
    expect(repo.markConverted).toHaveBeenCalledWith(2);
    expect(result.items[0].quantity).toBe(3);
  });
});

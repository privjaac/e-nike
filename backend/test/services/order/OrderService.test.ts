import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { OrderService } from '@/services/order/OrderService';
import type { IOrderRepository } from '@/repositories/order/IOrderRepository';
import type { ICartRepository } from '@/repositories/cart/ICartRepository';
import type { CartItem } from '@/domain/Cart';
import type { Order, OrderItem } from '@/domain/Order';

vi.mock('jose', () => ({
  SignJWT: vi.fn().mockImplementation(function SignJWT() {
    return {
      setProtectedHeader: vi.fn().mockReturnThis(),
      setExpirationTime: vi.fn().mockReturnThis(),
      sign: vi.fn().mockResolvedValue('guest-token-jwt'),
    };
  }),
}));

function createMockOrderRepo(overrides: Partial<IOrderRepository> = {}): IOrderRepository {
  return {
    findAll: vi.fn(),
    findById: vi.fn(),
    findItemsByOrderId: vi.fn(),
    findByGuestTokenHash: vi.fn(),
    create: vi.fn(),
    createItems: vi.fn(),
    updateStatus: vi.fn(),
    getCartItems: vi.fn(),
    ...overrides,
  };
}

function createMockCartRepo(overrides: Partial<ICartRepository> = {}): ICartRepository {
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

function createCartItem(overrides: Partial<CartItem> = {}): CartItem {
  return {
    id: 1,
    cartId: 4,
    skuId: 10,
    quantity: 1,
    unitPrice: 130,
    addedAt: 'now',
    sku: { id: 10, productId: 2, sku: 'NIKEPEGASUS41-8', size: '8', color: 'Black/White', colorHex: '#000', stockQuantity: 23, weightGrams: null },
    product: { id: 2, name: 'Nike Pegasus 41', slug: 'nike-pegasus-41', description: '', categoryId: 1, sport: 'running', gender: 'men', basePrice: 130, salePrice: null, imageUrl: '', gallery: [], isMemberOnly: false, isFullPrice: true, status: 'active', createdAt: 'now' },
    ...overrides,
  };
}

function createOrder(overrides: Partial<Order> = {}): Order {
  return {
    id: 2,
    userId: null,
    orderNumber: 'NIKE-123-456',
    status: 'pending',
    totalAmount: 130,
    shippingAddress: { street: 'Av. Test', city: 'Lima', state: 'Lima', zip: '15001', country: 'Peru' },
    createdAt: 'now',
    ...overrides,
  };
}

describe('OrderService.createOrder', () => {
  beforeEach(() => {
    vi.stubGlobal('crypto', {
      subtle: {
        digest: vi.fn().mockResolvedValue(new ArrayBuffer(32)),
      },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('creates guest order with token', async () => {
    const cartItems = [createCartItem()];
    const orderRepo = createMockOrderRepo({
      getCartItems: vi.fn().mockResolvedValue(cartItems),
      create: vi.fn().mockResolvedValue(createOrder()),
      createItems: vi.fn().mockResolvedValue([]),
      findItemsByOrderId: vi.fn().mockResolvedValue([]),
    });
    const cartRepo = createMockCartRepo();
    const service = new OrderService(orderRepo, cartRepo);

    const result = await service.createOrder({
      cartId: 4,
      shippingAddress: { street: 'Av. Test', city: 'Lima', state: 'Lima', zip: '15001', country: 'Peru' },
    });

    expect(result.order.totalAmount).toBe(130);
    expect(result.guestToken).toBe('guest-token-jwt');
    expect(orderRepo.createItems).toHaveBeenCalled();
    expect(cartRepo.markConverted).toHaveBeenCalledWith(4);
  });

  it('creates authenticated order without guest token', async () => {
    const cartItems = [createCartItem()];
    const orderRepo = createMockOrderRepo({
      getCartItems: vi.fn().mockResolvedValue(cartItems),
      create: vi.fn().mockResolvedValue(createOrder({ userId: 1 })),
      createItems: vi.fn().mockResolvedValue([]),
      findItemsByOrderId: vi.fn().mockResolvedValue([]),
    });
    const cartRepo = createMockCartRepo();
    const service = new OrderService(orderRepo, cartRepo);

    const result = await service.createOrder({
      userId: 1,
      cartId: 4,
      shippingAddress: { street: 'Av. Test', city: 'Lima', state: 'Lima', zip: '15001', country: 'Peru' },
    });

    expect(result.order.userId).toBe(1);
    expect(result.guestToken).toBeUndefined();
  });
});

describe('OrderService.updateStatus', () => {
  it('updates order status when order exists', async () => {
    const orderRepo = createMockOrderRepo({
      findById: vi.fn().mockResolvedValue(createOrder()),
      updateStatus: vi.fn().mockResolvedValue(createOrder({ status: 'confirmed' })),
    });
    const service = new OrderService(orderRepo, createMockCartRepo());

    const result = await service.updateStatus(2, 'confirmed');

    expect(orderRepo.updateStatus).toHaveBeenCalledWith(2, 'confirmed');
    expect(result.status).toBe('confirmed');
  });

  it('throws when order does not exist', async () => {
    const orderRepo = createMockOrderRepo({ findById: vi.fn().mockResolvedValue(undefined) });
    const service = new OrderService(orderRepo, createMockCartRepo());

    await expect(service.updateStatus(999, 'confirmed')).rejects.toThrow('Order not found');
  });
});

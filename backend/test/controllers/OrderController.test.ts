import { describe, it, expect, vi } from 'vitest';
import { OrderController } from '@/controllers/OrderController';
import type { IOrderService } from '@/services/order/IOrderService';
import type { Order, OrderWithItems } from '@/domain/Order';

function createContext(overrides: Record<string, unknown> = {}) {
  return {
    req: {
      param: vi.fn().mockReturnValue('2'),
      header: vi.fn().mockReturnValue(undefined),
      json: vi.fn().mockResolvedValue({}),
    },
    get: vi.fn().mockReturnValue(undefined),
    json: vi.fn().mockReturnValue(new Response('{}')),
    ...overrides,
  };
}

function createMockOrderService(overrides: Partial<IOrderService> = {}): IOrderService {
  return {
    getOrders: vi.fn(),
    getOrderById: vi.fn(),
    createOrder: vi.fn(),
    updateStatus: vi.fn(),
    ...overrides,
  };
}

function createOrder(overrides: Partial<Order> = {}): Order {
  return {
    id: 2,
    userId: 1,
    orderNumber: 'NIKE-123',
    status: 'pending',
    totalAmount: 130,
    createdAt: 'now',
    ...overrides,
  };
}

describe('OrderController.getOrderById', () => {
  it('returns order for admin', async () => {
    const order: OrderWithItems = { ...createOrder(), items: [] };
    const service = createMockOrderService({ getOrderById: vi.fn().mockResolvedValue(order) });
    const controller = new OrderController(service);
    const c = createContext({ get: vi.fn().mockReturnValue({ sub: '1', role: 'admin' }) });

    await controller.getOrderById(c as any);

    expect(c.json).toHaveBeenCalledWith({ success: true, data: order });
  });

  it('returns order for owner', async () => {
    const order: OrderWithItems = { ...createOrder({ userId: 3 }), items: [] };
    const service = createMockOrderService({ getOrderById: vi.fn().mockResolvedValue(order) });
    const controller = new OrderController(service);
    const c = createContext({ get: vi.fn().mockReturnValue({ sub: '3', role: 'customer' }) });

    await controller.getOrderById(c as any);

    expect(c.json).toHaveBeenCalledWith({ success: true, data: order });
  });

  it('returns 401 for non-owner non-admin without guest token', async () => {
    const order: OrderWithItems = { ...createOrder({ userId: 3 }), items: [] };
    const service = createMockOrderService({ getOrderById: vi.fn().mockResolvedValue(order) });
    const controller = new OrderController(service);
    const c = createContext({ get: vi.fn().mockReturnValue({ sub: '5', role: 'customer' }) });

    await controller.getOrderById(c as any);

    expect(c.json).toHaveBeenCalledWith({ success: false, error: 'Unauthorized' }, 401);
  });
});

describe('OrderController.getOrders', () => {
  it('returns all orders for admin', async () => {
    const orders = [createOrder()];
    const service = createMockOrderService({ getOrders: vi.fn().mockResolvedValue(orders) });
    const controller = new OrderController(service);
    const c = createContext({ get: vi.fn().mockReturnValue({ sub: '1', role: 'admin' }) });

    await controller.getOrders(c as any);

    expect(service.getOrders).toHaveBeenCalledWith();
    expect(c.json).toHaveBeenCalledWith({ success: true, data: orders });
  });

  it('returns user orders for customer', async () => {
    const orders = [createOrder({ userId: 3 })];
    const service = createMockOrderService({ getOrders: vi.fn().mockResolvedValue(orders) });
    const controller = new OrderController(service);
    const c = createContext({ get: vi.fn().mockReturnValue({ sub: '3', role: 'customer' }) });

    await controller.getOrders(c as any);

    expect(service.getOrders).toHaveBeenCalledWith(3);
  });
});

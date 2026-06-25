import { describe, it, expect, vi, beforeEach } from 'vitest';
import { orderService } from '@/services/OrderService';

const API_BASE = 'http://localhost:3001/api/v1';

function mockFetch(response: { ok: boolean; status?: number; json: unknown }) {
  return vi.fn().mockResolvedValue({
    ok: response.ok,
    status: response.status ?? (response.ok ? 200 : 400),
    json: vi.fn().mockResolvedValue(response.json),
  });
}

describe('orderService', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('getAll sends Authorization header when token is provided', async () => {
    const orders = [{ id: 1, orderNumber: 'NIKE-1', userId: 1, status: 'pending', totalAmount: 100, createdAt: 'now' }];
    vi.stubGlobal('fetch', mockFetch({ ok: true, json: { success: true, data: orders } }));

    const result = await orderService.getAll('token123');

    expect(fetch).toHaveBeenCalledWith(`${API_BASE}/orders`, { headers: { 'Content-Type': 'application/json', Authorization: 'Bearer token123' } });
    expect(result).toEqual(orders);
  });

  it('getById sends X-Guest-Token header for guest orders', async () => {
    const order = { id: 2, orderNumber: 'NIKE-2', userId: null, status: 'pending', totalAmount: 130, createdAt: 'now', items: [] };
    vi.stubGlobal('fetch', mockFetch({ ok: true, json: { success: true, data: order } }));

    await orderService.getById(2, null, 'guest-token');

    expect(fetch).toHaveBeenCalledWith(`${API_BASE}/orders/2`, {
      headers: { 'Content-Type': 'application/json', 'X-Guest-Token': 'guest-token' },
    });
  });

  it('create posts order data and returns order with optional guestToken', async () => {
    const payload = {
      order: { id: 2, orderNumber: 'NIKE-2', userId: null, status: 'pending', totalAmount: 130, createdAt: 'now' },
      guestToken: 'jwt-guest',
    };
    vi.stubGlobal('fetch', mockFetch({ ok: true, status: 201, json: { success: true, data: payload } }));

    const data = { cartId: 4, shippingAddress: { street: 'Av. Test', city: 'Lima', state: 'Lima', zip: '15001', country: 'Peru' } };
    const result = await orderService.create(data);

    expect(fetch).toHaveBeenCalledWith(`${API_BASE}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    expect(result).toEqual(payload);
  });

  it('throws on API error', async () => {
    vi.stubGlobal('fetch', mockFetch({ ok: false, status: 400, json: { success: false, error: 'Bad request' } }));

    await expect(orderService.getAll()).rejects.toThrow('Bad request');
  });
});

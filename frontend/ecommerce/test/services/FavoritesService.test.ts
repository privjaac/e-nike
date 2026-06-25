import { describe, it, expect, vi, beforeEach } from 'vitest';
import { favoritesService } from '@/services/FavoritesService';

const API_BASE = 'http://localhost:3001/api/v1';

function mockFetch(response: { ok: boolean; status?: number; json: unknown }) {
  return vi.fn().mockResolvedValue({
    ok: response.ok,
    status: response.status ?? (response.ok ? 200 : 400),
    json: vi.fn().mockResolvedValue(response.json),
  });
}

describe('favoritesService', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('getAll fetches favorites with token', async () => {
    const favorites = [{ id: 1, userId: 1, productId: 5, product: { id: 5, name: 'Air Max', slug: 'air-max', basePrice: 150, imageUrl: '', sport: 'running' }, createdAt: 'now' }];
    vi.stubGlobal('fetch', mockFetch({ ok: true, json: { success: true, data: favorites } }));

    const result = await favoritesService.getAll('token123');

    expect(fetch).toHaveBeenCalledWith(`${API_BASE}/favorites`, { headers: { 'Content-Type': 'application/json', Authorization: 'Bearer token123' } });
    expect(result).toEqual(favorites);
  });

  it('add posts productId as string', async () => {
    const favorite = { id: 1, userId: 1, productId: 5, product: { id: 5, name: 'Air Max', slug: 'air-max', basePrice: 150, imageUrl: '', sport: 'running' }, createdAt: 'now' };
    vi.stubGlobal('fetch', mockFetch({ ok: true, status: 201, json: { success: true, data: favorite } }));

    const result = await favoritesService.add('5', 'token123');

    expect(fetch).toHaveBeenCalledWith(`${API_BASE}/favorites`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer token123' },
      body: JSON.stringify({ productId: '5' }),
    });
    expect(result).toEqual(favorite);
  });

  it('remove deletes favorite by productId', async () => {
    vi.stubGlobal('fetch', mockFetch({ ok: true, json: { success: true } }));

    await favoritesService.remove(5, 'token123');

    expect(fetch).toHaveBeenCalledWith(`${API_BASE}/favorites/5`, {
      method: 'DELETE',
      headers: { Authorization: 'Bearer token123' },
    });
  });
});

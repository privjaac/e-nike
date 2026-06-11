import type { Context } from 'hono';
import { jwtVerify } from 'jose';
import { config } from '../config/env';
import { FavoriteService } from '../services/favorite.service';
import type { AddFavoriteDto } from '../dtos';

const secret = new TextEncoder().encode(config.jwtSecret);

async function getUserIdFromToken(c: Context): Promise<number | null> {
  const authHeader = c.req.header('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;

  const token = authHeader.slice(7);
  try {
    const { payload } = await jwtVerify(token, secret, { clockTolerance: 60 });
    return parseInt(payload.sub as string, 10);
  } catch {
    return null;
  }
}

export class FavoriteController {
  private service = new FavoriteService();

  async list(c: Context) {
    const userId = await getUserIdFromToken(c);
    if (!userId) return c.json({ success: false, error: 'Unauthorized' }, 401);

    const result = await this.service.getByUser(userId);
    return c.json({ success: true, data: result });
  }

  async add(c: Context) {
    const userId = await getUserIdFromToken(c);
    if (!userId) return c.json({ success: false, error: 'Unauthorized' }, 401);

    const { productId } = await c.req.json<AddFavoriteDto>();
    const result = await this.service.add(userId, productId);
    return c.json({ success: true, data: result }, 201);
  }

  async remove(c: Context) {
    const userId = await getUserIdFromToken(c);
    if (!userId) return c.json({ success: false, error: 'Unauthorized' }, 401);

    const productId = parseInt(c.req.param('productId')!);
    await this.service.remove(userId, productId);
    return c.json({ success: true });
  }
}

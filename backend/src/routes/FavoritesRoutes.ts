import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { authMiddleware } from '@/middleware/AuthMiddleware';
import type { FavoriteController } from '@/controllers/FavoriteController';
import { addFavoriteSchema } from '@/dtos/FavoriteDto';

export function createFavoritesRoutes(controller: FavoriteController) {
  const fav = new Hono();
  fav.use(authMiddleware);
  fav.get('/', (c) => controller.list(c));
  fav.post('/', zValidator('json', addFavoriteSchema), (c) => controller.add(c));
  fav.delete('/:productId', (c) => controller.remove(c));
  return fav;
}

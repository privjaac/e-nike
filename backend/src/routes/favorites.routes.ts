import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { FavoriteController } from '../controllers/favorite.controller';
import { addFavoriteSchema } from '../dtos';

const fav = new Hono();
const controller = new FavoriteController();

fav.get('/', (c) => controller.list(c));
fav.post('/', zValidator('json', addFavoriteSchema), (c) => controller.add(c));
fav.delete('/:productId', (c) => controller.remove(c));

export { fav as favoritesRoutes };

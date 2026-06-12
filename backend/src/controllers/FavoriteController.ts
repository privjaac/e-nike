import { Context } from 'hono';
import type { IFavoriteService } from '@/services/favorite/IFavoriteService';
import type { AddFavoriteDto } from '@/dtos/FavoriteDto';

export class FavoriteController {
  constructor(private favoriteService: IFavoriteService) {}

  async list(c: Context) {
    const user = c.get('user') as { sub: string } | undefined;
    if (!user) return c.json({ success: false, error: 'Unauthorized' }, 401);

    const result = await this.favoriteService.getByUser(parseInt(user.sub, 10));
    return c.json({ success: true, data: result });
  }

  async add(c: Context) {
    const user = c.get('user') as { sub: string } | undefined;
    if (!user) return c.json({ success: false, error: 'Unauthorized' }, 401);

    const { productId } = await c.req.json<AddFavoriteDto>();
    const result = await this.favoriteService.add(parseInt(user.sub, 10), productId);
    return c.json({ success: true, data: result }, 201);
  }

  async remove(c: Context) {
    const user = c.get('user') as { sub: string } | undefined;
    if (!user) return c.json({ success: false, error: 'Unauthorized' }, 401);

    const productId = parseInt(c.req.param('productId')!);
    await this.favoriteService.remove(parseInt(user.sub, 10), productId);
    return c.json({ success: true });
  }
}

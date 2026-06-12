import { Context } from 'hono';
import type { ICartController } from '@/controllers/ICartController';
import type { ICartService } from '@/services/cart/ICartService';
import type { AddCartItemDto, UpdateCartItemDto } from '@/dtos/CartDto';

function getUserId(c: Context): number | undefined {
  const user = c.get('user') as { sub: string; role: string } | undefined;
  return user ? parseInt(user.sub, 10) : undefined;
}

export class CartController implements ICartController {
  constructor(private cartService: ICartService) {}

  async getCart(c: Context) {
    const userId = getUserId(c);
    const sessionId = c.req.query('sessionId') || undefined;
    const result = await this.cartService.getCart(userId, sessionId);
    return c.json({ success: true, data: result });
  }

  async addItem(c: Context) {
    const userId = getUserId(c);
    const sessionId = c.req.query('sessionId') || undefined;
    const data = await c.req.json<AddCartItemDto>();
    const result = await this.cartService.addItem({ ...data, userId, sessionId });
    return c.json({ success: true, data: result });
  }

  async updateItem(c: Context) {
    const itemId = parseInt(c.req.param('itemId')!);
    const { quantity } = await c.req.json<UpdateCartItemDto>();
    await this.cartService.updateItem(itemId, quantity);
    return c.json({ success: true });
  }

  async removeItem(c: Context) {
    const itemId = parseInt(c.req.param('itemId')!);
    await this.cartService.removeItem(itemId);
    return c.json({ success: true });
  }
}

import type { Context } from 'hono';
import { CartService } from '../services/cart.service';
import type { AddCartItemDto, UpdateCartItemDto } from '../dtos';

export class CartController {
  private service = new CartService();

  async getCart(c: Context) {
    const cartIdParam = c.req.param('cartId');
    const cartId = cartIdParam ? parseInt(cartIdParam!) : undefined;
    const sessionId = c.req.query('sessionId') || undefined;
    const result = await this.service.getCart(cartId, sessionId);
    return c.json({ success: true, data: result });
  }

  async addItem(c: Context) {
    const data = await c.req.json<AddCartItemDto>();
    const result = await this.service.addItem(data);
    return c.json({ success: true, data: result });
  }

  async updateItem(c: Context) {
    const itemId = parseInt(c.req.param('itemId')!);
    const { quantity } = await c.req.json<UpdateCartItemDto>();
    await this.service.updateItem(itemId, quantity);
    return c.json({ success: true });
  }

  async removeItem(c: Context) {
    const itemId = parseInt(c.req.param('itemId')!);
    await this.service.removeItem(itemId);
    return c.json({ success: true });
  }
}

import type { Context } from 'hono';

export interface ICartController {
  getCart(c: Context): Promise<Response>;
  addItem(c: Context): Promise<Response>;
  updateItem(c: Context): Promise<Response>;
  removeItem(c: Context): Promise<Response>;
}

import type { Context } from 'hono';

export interface IFavoriteController {
  list(c: Context): Promise<Response>;
  add(c: Context): Promise<Response>;
  remove(c: Context): Promise<Response>;
}

import type { Context } from 'hono';

export interface IAuthController {
  register(c: Context): Promise<Response>;
  login(c: Context): Promise<Response>;
  me(c: Context): Promise<Response>;
}

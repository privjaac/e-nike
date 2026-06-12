import type { Context } from 'hono';

export interface IUserController {
  updateProfile(c: Context): Promise<Response>;
}

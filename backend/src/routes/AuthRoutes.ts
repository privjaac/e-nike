import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import type { IAuthController } from '@/controllers/IAuthController';
import { loginSchema, registerSchema } from '@/dtos/AuthDto';

export function createAuthRoutes(controller: IAuthController) {
  const auth = new Hono();
  auth.post('/register', zValidator('json', registerSchema), (c) => controller.register(c));
  auth.post('/login', zValidator('json', loginSchema), (c) => controller.login(c));
  auth.get('/me', (c) => controller.me(c));
  return auth;
}

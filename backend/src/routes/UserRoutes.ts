import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { authMiddleware } from '@/middleware/AuthMiddleware';
import type { UserController } from '@/controllers/UserController';
import { updateProfileSchema } from '@/dtos/UserDto';

export function createUserRoutes(controller: UserController) {
  const user = new Hono();
  user.use(authMiddleware);
  user.put('/profile', zValidator('json', updateProfileSchema), (c) => controller.updateProfile(c));
  return user;
}

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { authMiddleware } from '@/middleware/AuthMiddleware';
import type { IUserController } from '@/controllers/IUserController';
import { updateProfileSchema } from '@/dtos/UserDto';

export function createUserRoutes(controller: IUserController) {
  const user = new Hono();
  user.use(authMiddleware);
  user.put('/profile', zValidator('json', updateProfileSchema), (c) => controller.updateProfile(c));
  return user;
}

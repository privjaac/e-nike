import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { UserController } from '../controllers/user.controller';
import { updateProfileSchema } from '../dtos';

const user = new Hono();
const controller = new UserController();

user.put('/profile', zValidator('json', updateProfileSchema), (c) => controller.updateProfile(c));

export { user as userRoutes };

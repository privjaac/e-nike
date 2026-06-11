import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { AuthController } from '../controllers/auth.controller';
import { loginSchema, registerSchema } from '../dtos';

const auth = new Hono();
const controller = new AuthController();

auth.post('/register', zValidator('json', registerSchema), (c) => controller.register(c));
auth.post('/login', zValidator('json', loginSchema), (c) => controller.login(c));
auth.get('/me', (c) => controller.me(c));

export { auth as authRoutes };

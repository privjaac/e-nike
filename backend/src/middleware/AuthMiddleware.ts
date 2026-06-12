import { createMiddleware } from 'hono/factory';
import { verify } from 'hono/jwt';
import { config } from '@/config/Env';

export const authMiddleware = createMiddleware(async (c, next) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ success: false, error: 'Unauthorized' }, 401);
  }
  const token = authHeader.slice(7);
  try {
    const payload = await verify(token, config.jwtSecret, 'HS256');
    c.set('user', payload);
    await next();
  } catch {
    return c.json({ success: false, error: 'Invalid token' }, 401);
  }
});

export const optionalAuthMiddleware = createMiddleware(async (c, next) => {
  const authHeader = c.req.header('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    try {
      const payload = await verify(token, config.jwtSecret, 'HS256');
      c.set('user', payload);
    } catch {
    }
  }
  await next();
});

export const requireRole = (...roles: string[]) =>
  createMiddleware(async (c, next) => {
    const user = c.get('user') as any;
    if (!user || !roles.includes(user.role)) {
      return c.json({ success: false, error: 'Forbidden' }, 403);
    }
    await next();
  });

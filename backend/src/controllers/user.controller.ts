import type { Context } from 'hono';
import { jwtVerify } from 'jose';
import { config } from '../config/env';
import { UserService } from '../services/user.service';
import type { UpdateProfileDto } from '../dtos';

const secret = new TextEncoder().encode(config.jwtSecret);

export class UserController {
  private service = new UserService();

  async updateProfile(c: Context) {
    const authHeader = c.req.header('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return c.json({ success: false, error: 'Unauthorized' }, 401);
    }

    const token = authHeader.slice(7);
    try {
      const { payload } = await jwtVerify(token, secret, { clockTolerance: 60 });
      const userId = parseInt(payload.sub as string, 10);
      const body = await c.req.json<UpdateProfileDto>();

      const result = await this.service.updateProfile(userId, body);
      return c.json({ success: true, data: result });
    } catch {
      return c.json({ success: false, error: 'Invalid token' }, 401);
    }
  }
}

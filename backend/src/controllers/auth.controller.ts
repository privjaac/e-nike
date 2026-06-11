import type { Context } from 'hono';
import { AuthService } from '../services/auth.service';
import type { LoginDto, RegisterDto } from '../dtos';

export class AuthController {
  private service = new AuthService();

  async register(c: Context) {
    const data = await c.req.json<RegisterDto>();
    const result = await this.service.register(data);
    return c.json({ success: true, data: result }, 201);
  }

  async login(c: Context) {
    const data = await c.req.json<LoginDto>();
    const result = await this.service.login(data);
    return c.json({ success: true, data: result });
  }

  async me(c: Context) {
    const authHeader = c.req.header('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return c.json({ success: false, error: 'Unauthorized' }, 401);
    }
    const token = authHeader.slice(7);
    const user = await this.service.me(token);
    return c.json({ success: true, data: user });
  }
}

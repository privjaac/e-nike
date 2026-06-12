import { Context } from 'hono';
import type { IAuthController } from '@/controllers/IAuthController';
import type { IAuthService } from '@/services/auth/IAuthService';
import type { LoginDto, RegisterDto } from '@/dtos/AuthDto';

export class AuthController implements IAuthController {
  constructor(private authService: IAuthService) {}

  async register(c: Context) {
    const data = await c.req.json<RegisterDto>();
    const result = await this.authService.register(data);
    return c.json({ success: true, data: result }, 201);
  }

  async login(c: Context) {
    const data = await c.req.json<LoginDto>();
    const result = await this.authService.login(data);
    return c.json({ success: true, data: result });
  }

  async me(c: Context) {
    const authHeader = c.req.header('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return c.json({ success: false, error: 'Unauthorized' }, 401);
    }
    const token = authHeader.slice(7);
    const user = await this.authService.me(token);
    return c.json({ success: true, data: { user } });
  }
}

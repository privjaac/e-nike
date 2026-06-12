import { Context } from 'hono';
import type { IUserService } from '@/services/user/IUserService';
import type { UpdateProfileDto } from '@/dtos/UserDto';

export class UserController {
  constructor(private userService: IUserService) {}

  async updateProfile(c: Context) {
    const user = c.get('user') as { sub: string } | undefined;
    if (!user) {
      return c.json({ success: false, error: 'Unauthorized' }, 401);
    }

    const userId = parseInt(user.sub, 10);
    const body = await c.req.json<UpdateProfileDto>();
    const result = await this.userService.updateProfile(userId, body);
    return c.json({ success: true, data: result });
  }
}

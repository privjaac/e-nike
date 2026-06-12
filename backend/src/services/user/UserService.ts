import type { SafeUser } from '@/domain/User';

import type { IUserRepository } from '@/repositories/user/IUserRepository';
import type { IUserService } from '@/services/user/IUserService';
import type { UpdateProfileDto } from '@/dtos/UserDto';

export class UserService implements IUserService {
  constructor(private userRepository: IUserRepository) {}

  async updateProfile(userId: number, data: UpdateProfileDto): Promise<SafeUser> {
    return this.userRepository.update(userId, data);
  }
}

import type { SafeUser } from '@/domain/User';

import type { IUserRepository } from '@/repositories/user/IUserRepository';
import type { IUserService } from '@/services/user/IUserService';

export class UserService implements IUserService {
  constructor(private userRepository: IUserRepository) {}

  async updateProfile(userId: number, data: Partial<{ firstName: string; lastName: string; email: string }>): Promise<SafeUser> {
    const updateData: Partial<{ firstName: string; lastName: string; email: string }> = {};
    if (data.firstName) updateData.firstName = data.firstName;
    if (data.lastName) updateData.lastName = data.lastName;
    if (data.email) updateData.email = data.email;
    return this.userRepository.update(userId, updateData);
  }
}

import { UserRepository } from '../repositories/user.repository';
import type { SafeUser } from '../types';

export class UserService {
  private userRepo = new UserRepository();

  async updateProfile(userId: number, data: Partial<{ firstName: string; lastName: string; email: string }>): Promise<SafeUser> {
    const updateData: Partial<{ firstName: string; lastName: string; email: string }> = {};
    if (data.firstName) updateData.firstName = data.firstName;
    if (data.lastName) updateData.lastName = data.lastName;
    if (data.email) updateData.email = data.email;

    return this.userRepo.update(userId, updateData);
  }
}

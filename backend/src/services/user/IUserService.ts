import type { SafeUser } from '@/domain/User';
import type { UpdateProfileDto } from '@/dtos/UserDto';

export interface IUserService {
  updateProfile(userId: number, data: UpdateProfileDto): Promise<SafeUser>;
}

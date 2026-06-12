import type { SafeUser } from '@/domain/User';

export interface IUserService {
  updateProfile(userId: number, data: Partial<{ firstName: string; lastName: string; email: string }>): Promise<SafeUser>;
}

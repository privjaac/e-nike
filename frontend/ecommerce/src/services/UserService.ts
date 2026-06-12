import { put } from '@/services/api';

export interface UserProfile {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  membershipTier: string;
}

export const userService = {
  updateProfile(data: { firstName?: string; lastName?: string; email?: string }, token: string) {
    return put<UserProfile>('/users/profile', data, token);
  },
};

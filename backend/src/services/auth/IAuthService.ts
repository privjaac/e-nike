import type { SafeUser } from '@/domain/User';

export interface AuthResult {
  user: SafeUser;
  token: string;
}

export interface IAuthService {
  register(data: { email: string; password: string; firstName: string; lastName: string; sessionId?: string }): Promise<AuthResult>;
  login(data: { email: string; password: string; sessionId?: string }): Promise<AuthResult>;
  me(token: string): Promise<SafeUser>;
}

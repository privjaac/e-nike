import type { SafeUser, AuthPayload } from '@/domain/User';

import bcrypt from 'bcryptjs';
import type { IUserRepository } from '@/repositories/user/IUserRepository';
import type { IAuthService, AuthResult } from '@/services/auth/IAuthService';
import type { ITokenService } from '@/services/token/ITokenService';
import type { ICartService } from '@/services/cart/ICartService';

export class AuthService implements IAuthService {
  constructor(
    private userRepository: IUserRepository,
    private tokenService: ITokenService,
    private cartService: ICartService,
  ) {}

  async register(data: { email: string; password: string; firstName: string; lastName: string; sessionId?: string }): Promise<AuthResult> {
    const existing = await this.userRepository.findByEmail(data.email);
    if (existing) throw new Error('Email already registered');

    const passwordHash = await bcrypt.hash(data.password, 10);
    const result = await this.userRepository.create({
      email: data.email,
      passwordHash,
      firstName: data.firstName,
      lastName: data.lastName,
      role: 'customer',
      membershipTier: 'member',
    });

    const token = await this.tokenService.sign(result.id, result.email, result.role);
    const { passwordHash: _, ...user } = result;

    if (data.sessionId) {
      await this.cartService.mergeOnLogin(data.sessionId, result.id);
    }

    const payload: AuthPayload = { user: user as SafeUser, token };
    return payload;
  }

  async login(data: { email: string; password: string; sessionId?: string }): Promise<AuthResult> {
    const user = await this.userRepository.findByEmail(data.email);
    if (!user) throw new Error('Invalid credentials');

    const valid = await bcrypt.compare(data.password, user.passwordHash);
    if (!valid) throw new Error('Invalid credentials');

    const token = await this.tokenService.sign(user.id, user.email, user.role);
    const { passwordHash: _, ...safeUser } = user;

    if (data.sessionId) {
      await this.cartService.mergeOnLogin(data.sessionId, user.id);
    }

    const payload: AuthPayload = { user: safeUser as SafeUser, token };
    return payload;
  }

  async me(token: string): Promise<SafeUser> {
    const payload = await this.tokenService.verify(token);
    const user = await this.userRepository.findById(parseInt(payload.sub, 10));
    if (!user) throw new Error('User not found');
    const { passwordHash: _, ...safeUser } = user;
    return safeUser as SafeUser;
  }
}

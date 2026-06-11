import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { config } from '../config/env';
import { UserRepository } from '../repositories/user.repository';
import type { SafeUser } from '../types';

const secret = new TextEncoder().encode(config.jwtSecret);

export class AuthService {
  private userRepo = new UserRepository();

  async register(data: { email: string; password: string; firstName: string; lastName: string }) {
    const existing = await this.userRepo.findByEmail(data.email);
    if (existing) throw new Error('Email already registered');

    const passwordHash = await bcrypt.hash(data.password, 10);
    const result = await this.userRepo.create({
      email: data.email,
      passwordHash,
      firstName: data.firstName,
      lastName: data.lastName,
      role: 'customer',
      membershipTier: 'member',
    });

    const token = await this.generateToken(result.id, result.email, result.role);
    const { passwordHash: _, ...user } = result;
    return { user: user as SafeUser, token };
  }

  async login(data: { email: string; password: string }) {
    const user = await this.userRepo.findByEmail(data.email);
    if (!user) throw new Error('Invalid credentials');

    const valid = await bcrypt.compare(data.password, user.passwordHash);
    if (!valid) throw new Error('Invalid credentials');

    const token = await this.generateToken(user.id, user.email, user.role);
    const { passwordHash: _, ...safeUser } = user;
    return { user: safeUser as SafeUser, token };
  }

  async me(token: string) {
    const { payload } = await jwtVerify(token, secret, { clockTolerance: 60 });
    const user = await this.userRepo.findById(parseInt(payload.sub as string, 10));
    if (!user) throw new Error('User not found');
    const { passwordHash: _, ...safeUser } = user;
    return safeUser as SafeUser;
  }

  private async generateToken(userId: number, email: string, role: string) {
    return new SignJWT({ sub: String(userId), email, role })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime(config.jwtExpiresIn)
      .sign(secret);
  }
}

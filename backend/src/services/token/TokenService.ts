import { SignJWT, jwtVerify } from 'jose';
import type { ITokenService, TokenPayload } from '@/services/token/ITokenService';

export class TokenService implements ITokenService {
  private secret: Uint8Array;

  constructor(secret: string, private expiresIn: string) {
    this.secret = new TextEncoder().encode(secret);
  }

  async sign(userId: number, email: string, role: string): Promise<string> {
    return new SignJWT({ sub: String(userId), email, role })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime(this.expiresIn)
      .sign(this.secret);
  }

  async verify(token: string): Promise<TokenPayload> {
    const { payload } = await jwtVerify(token, this.secret, { clockTolerance: 60 });
    return {
      sub: payload.sub as string,
      email: payload.email as string,
      role: payload.role as string,
    };
  }
}

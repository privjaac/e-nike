export interface TokenPayload {
  sub: string;
  email: string;
  role: string;
}

export interface ITokenService {
  sign(userId: number, email: string, role: string): Promise<string>;
  verify(token: string): Promise<TokenPayload>;
}

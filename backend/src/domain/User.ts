export interface User {
  id: number;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  role: 'customer' | 'admin' | 'merchandiser';
  membershipTier: string;
  preferences?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}

export interface SafeUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  membershipTier: string;
  preferences?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthPayload {
  user: SafeUser;
  token: string;
}


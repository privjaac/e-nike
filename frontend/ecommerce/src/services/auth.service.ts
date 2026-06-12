import { get, post } from './api';

export interface User {
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
  user: User;
  token: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export const authService = {
  login(email: string, password: string) {
    return post<AuthPayload>('/auth/login', { email, password });
  },

  register(data: RegisterData) {
    return post<AuthPayload>('/auth/register', data);
  },

  me(token: string) {
    return get<AuthPayload>('/auth/me', token);
  },
};

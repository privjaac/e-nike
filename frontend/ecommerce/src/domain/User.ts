export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  membershipTier: string;
}

export interface SafeUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  membershipTier: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

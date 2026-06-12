import type { User, SafeUser } from '@/domain/User';

export interface IUserRepository {
  findByEmail(email: string): Promise<User | undefined>;
  findById(id: number): Promise<User | undefined>;
  create(data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User>;
  update(id: number, data: Partial<Pick<User, 'firstName' | 'lastName' | 'email'>>): Promise<SafeUser>;
  count(): Promise<number>;
}

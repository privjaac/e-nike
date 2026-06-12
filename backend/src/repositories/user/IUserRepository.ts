import type { User, SafeUser } from '@/domain/User';
import type { UserInsert, UserUpdate } from '@/db/Schema';

export interface IUserRepository {
  findByEmail(email: string): Promise<User | undefined>;
  findById(id: number): Promise<User | undefined>;
  create(data: UserInsert): Promise<User>;
  update(id: number, data: UserUpdate): Promise<SafeUser>;
  count(): Promise<number>;
}

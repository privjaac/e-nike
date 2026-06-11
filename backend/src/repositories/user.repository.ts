import { db } from '../db';
import { users } from '../db/schema';
import { eq, sql } from 'drizzle-orm';
import type { User, SafeUser } from '../types';

function toSafeUser(user: User): SafeUser {
  const { passwordHash, ...safe } = user;
  return safe as SafeUser;
}

export class UserRepository {
  async findByEmail(email: string): Promise<User | undefined> {
    return db.select().from(users).where(eq(users.email, email)).get() as User | undefined;
  }

  async findById(id: number): Promise<User | undefined> {
    return db.select().from(users).where(eq(users.id, id)).get() as User | undefined;
  }

  async create(data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    return db.insert(users).values(data as any).returning().get() as User;
  }

  async update(id: number, data: Partial<Pick<User, 'firstName' | 'lastName' | 'email'>>): Promise<SafeUser> {
    const updated = await db
      .update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning()
      .get();
    return toSafeUser(updated as User);
  }

  async count(): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)` }).from(users).get();
    return result?.count || 0;
  }
}

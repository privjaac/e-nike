import { db } from '../db';
import { promotions } from '../db/schema';
import { eq, gte, lte, and, sql } from 'drizzle-orm';
import type { Promotion } from '../types';

export class PromotionRepository {
  async findAll(): Promise<Promotion[]> {
    return db.select().from(promotions).all() as Promotion[];
  }

  async findActive(now: Date): Promise<Promotion[]> {
    return db
      .select()
      .from(promotions)
      .where(
        and(
          eq(promotions.isActive, true),
          lte(promotions.startDate, now),
          gte(promotions.endDate, now)
        )
      )
      .all() as Promotion[];
  }

  async create(data: Omit<Promotion, 'id' | 'createdAt'>): Promise<Promotion> {
    return db.insert(promotions).values(data).returning().get() as Promotion;
  }

  async findRecent(limit: number): Promise<Promotion[]> {
    return db
      .select()
      .from(promotions)
      .orderBy(sql`${promotions.createdAt} desc`)
      .limit(limit)
      .all() as Promotion[];
  }
}

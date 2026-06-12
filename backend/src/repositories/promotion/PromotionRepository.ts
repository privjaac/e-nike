import type { Promotion } from '@/domain/Promotion';

import { db } from '@/db/Database';
import { promotions } from '@/db/Schema';
import { eq, gte, lte, and, sql } from 'drizzle-orm';
import type { IPromotionRepository } from '@/repositories/promotion/IPromotionRepository';
import type { PromotionInsert, PromotionUpdate } from '@/db/Schema';

export class PromotionRepository implements IPromotionRepository {
  async findAll(): Promise<Promotion[]> {
    return db.select().from(promotions).all() as Promotion[];
  }

  async findById(id: number): Promise<Promotion | undefined> {
    return db.select().from(promotions).where(eq(promotions.id, id)).get() as Promotion | undefined;
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

  async create(data: PromotionInsert): Promise<Promotion> {
    return db.insert(promotions).values(data).returning().get() as Promotion;
  }

  async update(id: number, data: PromotionUpdate): Promise<Promotion> {
    return db.update(promotions).set(data).where(eq(promotions.id, id)).returning().get() as Promotion;
  }

  async remove(id: number): Promise<void> {
    db.delete(promotions).where(eq(promotions.id, id)).run();
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

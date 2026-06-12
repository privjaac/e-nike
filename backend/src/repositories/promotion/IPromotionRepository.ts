import type { Promotion } from '@/domain/Promotion';
import type { PromotionInsert, PromotionUpdate } from '@/db/Schema';

export interface IPromotionRepository {
  findAll(): Promise<Promotion[]>;
  findById(id: number): Promise<Promotion | undefined>;
  findActive(now: Date): Promise<Promotion[]>;
  create(data: PromotionInsert): Promise<Promotion>;
  update(id: number, data: PromotionUpdate): Promise<Promotion>;
  remove(id: number): Promise<void>;
  findRecent(limit: number): Promise<Promotion[]>;
}

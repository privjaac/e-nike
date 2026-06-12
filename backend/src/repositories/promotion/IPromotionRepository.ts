import type { Promotion } from '@/domain/Promotion';

export interface IPromotionRepository {
  findAll(): Promise<Promotion[]>;
  findActive(now: Date): Promise<Promotion[]>;
  create(data: Omit<Promotion, 'id' | 'createdAt'>): Promise<Promotion>;
  findRecent(limit: number): Promise<Promotion[]>;
}

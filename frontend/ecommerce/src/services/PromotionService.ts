import { get, post } from '@/services/api';

export interface Promotion {
  id: number;
  name: string;
  code: string;
  type: 'percentage' | 'fixed' | 'bundle';
  value: number;
  isAutoMarkdown: boolean;
  minWos?: number;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  createdBy: number;
  createdAt: string;
}

export const promotionService = {
  getAll(active?: boolean, token?: string | null) {
    const qs = active ? '?active=true' : '';
    return get<Promotion[]>(`/promotions${qs}`, token);
  },

  create(data: Omit<Promotion, 'id' | 'createdAt'>, token: string) {
    return post<Promotion>('/promotions', data, token);
  },
};

import { get } from '@/services/api';
import type { DashboardMetrics, InventoryPerformance, Promotion } from '@/domain/Dashboard';

export type { DashboardMetrics, InventoryPerformance, Promotion };

export const dashboardService = {
  getMetrics(token?: string | null) {
    return get<DashboardMetrics>('/dashboard/metrics', token);
  },

  getInventoryPerformance(token?: string | null) {
    return get<InventoryPerformance>('/dashboard/inventory-performance', token);
  },

  getPromotionHistory(token?: string | null) {
    return get<Promotion[]>('/dashboard/promotion-history', token);
  },
};

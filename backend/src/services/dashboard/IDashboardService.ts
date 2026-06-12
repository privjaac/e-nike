import type { DashboardMetrics, InventoryPerformance } from '@/domain/Dashboard';
import type { Promotion } from '@/domain/Promotion';

export interface IDashboardService {
  getMetrics(): Promise<DashboardMetrics>;
  getInventoryPerformance(): Promise<InventoryPerformance>;
  getPromotionHistory(): Promise<Promotion[]>;
}

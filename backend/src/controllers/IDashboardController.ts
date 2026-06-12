import type { Context } from 'hono';

export interface IDashboardController {
  getMetrics(c: Context): Promise<Response>;
  getInventoryPerformance(c: Context): Promise<Response>;
  getPromotionHistory(c: Context): Promise<Response>;
}

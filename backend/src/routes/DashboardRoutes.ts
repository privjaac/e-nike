import { Hono } from 'hono';
import type { DashboardController } from '@/controllers/DashboardController';

export function createDashboardRoutes(controller: DashboardController) {
  const dashboard = new Hono();
  dashboard.get('/metrics', (c) => controller.getMetrics(c));
  dashboard.get('/inventory-performance', (c) => controller.getInventoryPerformance(c));
  dashboard.get('/promotion-history', (c) => controller.getPromotionHistory(c));
  return dashboard;
}

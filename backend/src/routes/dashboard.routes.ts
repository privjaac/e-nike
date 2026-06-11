import { Hono } from 'hono';
import { DashboardController } from '../controllers/dashboard.controller';

const dashboard = new Hono();
const controller = new DashboardController();

dashboard.get('/metrics', (c) => controller.getMetrics(c));
dashboard.get('/inventory-performance', (c) => controller.getInventoryPerformance(c));
dashboard.get('/promotion-history', (c) => controller.getPromotionHistory(c));

export { dashboard as dashboardRoutes };

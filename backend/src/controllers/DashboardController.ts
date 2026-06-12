import { Context } from 'hono';
import type { IDashboardService } from '@/services/dashboard/IDashboardService';

export class DashboardController {
  constructor(private dashboardService: IDashboardService) {}

  async getMetrics(c: Context) {
    const result = await this.dashboardService.getMetrics();
    return c.json({ success: true, data: result });
  }

  async getInventoryPerformance(c: Context) {
    const result = await this.dashboardService.getInventoryPerformance();
    return c.json({ success: true, data: result });
  }

  async getPromotionHistory(c: Context) {
    const result = await this.dashboardService.getPromotionHistory();
    return c.json({ success: true, data: result });
  }
}

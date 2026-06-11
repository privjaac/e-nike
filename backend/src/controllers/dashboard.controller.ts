import type { Context } from 'hono';
import { DashboardService } from '../services/dashboard.service';

export class DashboardController {
  private service = new DashboardService();

  async getMetrics(c: Context) {
    const result = await this.service.getMetrics();
    return c.json({ success: true, data: result });
  }

  async getInventoryPerformance(c: Context) {
    const result = await this.service.getInventoryPerformance();
    return c.json({ success: true, data: result });
  }

  async getPromotionHistory(c: Context) {
    const result = await this.service.getPromotionHistory();
    return c.json({ success: true, data: result });
  }
}

import { DashboardRepository } from '../repositories/dashboard.repository';
import { PromotionRepository } from '../repositories/promotion.repository';

export class DashboardService {
  private dashboardRepo = new DashboardRepository();
  private promoRepo = new PromotionRepository();

  async getMetrics() {
    const [totalOrders, totalProducts, totalUsers, avgOrderValue] = await Promise.all([
      this.dashboardRepo.countOrders(),
      this.dashboardRepo.countProducts(),
      this.dashboardRepo.countUsers(),
      this.dashboardRepo.avgOrderValue(),
    ]);

    return { totalOrders, totalProducts, totalUsers, avgOrderValue };
  }

  async getInventoryPerformance() {
    const [lowStockItems, totalUnits] = await Promise.all([
      this.dashboardRepo.countLowStock(),
      this.dashboardRepo.sumTotalUnits(),
    ]);

    return { lowStockItems, totalUnits };
  }

  async getPromotionHistory() {
    return this.promoRepo.findRecent(10);
  }
}

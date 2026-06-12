import type { IDashboardRepository } from '@/repositories/dashboard/IDashboardRepository';
import type { IPromotionRepository } from '@/repositories/promotion/IPromotionRepository';
import type { IDashboardService } from '@/services/dashboard/IDashboardService';

export class DashboardService implements IDashboardService {
  constructor(
    private dashboardRepository: IDashboardRepository,
    private promotionRepository: IPromotionRepository,
  ) {}

  async getMetrics() {
    const [totalOrders, totalProducts, totalUsers, avgOrderValue] = await Promise.all([
      this.dashboardRepository.countOrders(),
      this.dashboardRepository.countProducts(),
      this.dashboardRepository.countUsers(),
      this.dashboardRepository.avgOrderValue(),
    ]);

    return { totalOrders, totalProducts, totalUsers, avgOrderValue };
  }

  async getInventoryPerformance() {
    const [lowStockItems, totalUnits] = await Promise.all([
      this.dashboardRepository.countLowStock(),
      this.dashboardRepository.sumTotalUnits(),
    ]);

    return { lowStockItems, totalUnits };
  }

  async getPromotionHistory() {
    return this.promotionRepository.findRecent(10);
  }
}

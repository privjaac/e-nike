export interface DashboardMetrics {
  totalOrders: number;
  totalProducts: number;
  totalUsers: number;
  avgOrderValue: number;
}

export interface InventoryPerformance {
  lowStockItems: number;
  totalUnits: number;
}

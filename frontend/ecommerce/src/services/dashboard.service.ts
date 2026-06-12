import { get } from './api';

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

export interface Promotion {
  id: number;
  name: string;
  code: string;
  type: string;
  value: number;
  isActive: boolean;
  startDate: string;
  endDate: string;
  createdAt: string;
}

export const dashboardService = {
  getMetrics(token?: string | null) {
    return get<{ metrics: DashboardMetrics }>('/dashboard/metrics', token);
  },

  getInventoryPerformance(token?: string | null) {
    return get<InventoryPerformance>('/dashboard/inventory-performance', token);
  },

  getPromotionHistory(token?: string | null) {
    return get<Promotion[]>('/dashboard/promotion-history', token);
  },
};

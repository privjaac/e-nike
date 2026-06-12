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

export interface MetricItem {
  id: string;
  label: string;
  value: string;
  delta: string;
  deltaType: 'positive' | 'negative' | 'stable' | 'alert';
}

export interface ProductItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  unitsSold: number;
  inventory: number;
  wos: number;
  status: 'Optimal' | 'Critical Low' | 'Overstocked';
  image: string;
}

export interface HistoryItem {
  id: string;
  title: string;
  time: string;
  actor: string;
  active: boolean;
}

export interface PromotionData {
  activePromotion: string;
  automaticMarkdowns: boolean;
  history: HistoryItem[];
}

export interface PromotionForm {
  name: string;
  code: string;
  type: 'percentage' | 'fixed' | 'bundle';
  value: string;
  startDate: string;
  endDate: string;
}

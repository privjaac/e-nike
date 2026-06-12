export interface IDashboardRepository {
  countOrders(): Promise<number>;
  countProducts(): Promise<number>;
  countUsers(): Promise<number>;
  avgOrderValue(): Promise<number>;
  countLowStock(): Promise<number>;
  sumTotalUnits(): Promise<number>;
}

import { db } from '../db';
import { orders, products, users, inventory } from '../db/schema';
import { sql } from 'drizzle-orm';

export class DashboardRepository {
  async countOrders(): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)` }).from(orders).get();
    return result?.count || 0;
  }

  async countProducts(): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)` }).from(products).get();
    return result?.count || 0;
  }

  async countUsers(): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)` }).from(users).get();
    return result?.count || 0;
  }

  async avgOrderValue(): Promise<number> {
    const result = await db
      .select({ avg: sql<number>`avg(${orders.totalAmount})` })
      .from(orders)
      .get();
    return Math.round((result?.avg || 0) * 100) / 100;
  }

  async countLowStock(): Promise<number> {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(inventory)
      .where(sql`${inventory.quantity} - ${inventory.reservedQuantity} < 10`)
      .get();
    return result?.count || 0;
  }

  async sumTotalUnits(): Promise<number> {
    const result = await db
      .select({ total: sql<number>`sum(${inventory.quantity})` })
      .from(inventory)
      .get();
    return result?.total || 0;
  }
}

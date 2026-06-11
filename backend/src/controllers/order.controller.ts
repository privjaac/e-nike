import type { Context } from 'hono';
import { OrderService } from '../services/order.service';
import type { CreateOrderDto } from '../dtos';

export class OrderController {
  private service = new OrderService();

  async getOrders(c: Context) {
    const userId = c.req.query('userId') ? parseInt(c.req.query('userId')!) : undefined;
    const result = await this.service.getOrders(userId);
    return c.json({ success: true, data: result });
  }

  async createOrder(c: Context) {
    const data = await c.req.json<CreateOrderDto>();
    const result = await this.service.createOrder(data);
    return c.json({ success: true, data: result }, 201);
  }
}

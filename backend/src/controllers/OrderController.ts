import { Context } from 'hono';
import type { IOrderService } from '@/services/order/IOrderService';
import type { CreateOrderDto } from '@/dtos/OrderDto';

export class OrderController {
  constructor(private orderService: IOrderService) {}

  async getOrders(c: Context) {
    const userId = c.req.query('userId') ? parseInt(c.req.query('userId')!) : undefined;
    const result = await this.orderService.getOrders(userId);
    return c.json({ success: true, data: result });
  }

  async createOrder(c: Context) {
    const data = await c.req.json<CreateOrderDto>();
    const result = await this.orderService.createOrder(data);
    return c.json({ success: true, data: result }, 201);
  }
}

import { Context } from 'hono';
import { jwtVerify } from 'jose';
import type { IOrderController } from '@/controllers/IOrderController';
import type { IOrderService } from '@/services/order/IOrderService';
import type { CreateOrderDto, UpdateStatusDto } from '@/dtos/OrderDto';

async function verifyGuestToken(token: string): Promise<{ orderId: number } | null> {
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret'));
    if (payload.sub !== 'guest' || !payload.orderId) return null;
    return { orderId: payload.orderId as number };
  } catch {
    return null;
  }
}

export class OrderController implements IOrderController {
  constructor(private orderService: IOrderService) {}

  async getOrders(c: Context) {
    const user = c.get('user') as { sub: string; role: string } | undefined;
    if (user?.role === 'admin') {
      const result = await this.orderService.getOrders();
      return c.json({ success: true, data: result });
    }
    if (user) {
      const result = await this.orderService.getOrders(parseInt(user.sub, 10));
      return c.json({ success: true, data: result });
    }
    return c.json({ success: false, error: 'Unauthorized' }, 401);
  }

  async getOrderById(c: Context) {
    const id = parseInt(c.req.param('id')!, 10);
    const order = await this.orderService.getOrderById(id);
    if (!order) return c.json({ success: false, error: 'Order not found' }, 404);

    const user = c.get('user') as { sub: string; role: string } | undefined;
    if (user?.role === 'admin') {
      return c.json({ success: true, data: order });
    }
    if (user && order.userId === parseInt(user.sub, 10)) {
      return c.json({ success: true, data: order });
    }

    const guestToken = c.req.header('X-Guest-Token');
    if (guestToken) {
      const verified = await verifyGuestToken(guestToken);
      if (verified && verified.orderId === order.id) {
        return c.json({ success: true, data: order });
      }
    }

    return c.json({ success: false, error: 'Unauthorized' }, 401);
  }

  async createOrder(c: Context) {
    const data = await c.req.json<CreateOrderDto>();
    const result = await this.orderService.createOrder(data);
    return c.json({ success: true, data: { order: result.order, guestToken: result.guestToken } }, 201);
  }

  async updateStatus(c: Context) {
    const id = parseInt(c.req.param('id')!, 10);
    const { status } = await c.req.json<UpdateStatusDto>();
    const result = await this.orderService.updateStatus(id, status);
    return c.json({ success: true, data: result });
  }
}

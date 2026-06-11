import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { OrderController } from '../controllers/order.controller';
import { createOrderSchema } from '../dtos';

const orders = new Hono();
const controller = new OrderController();

orders.get('/', (c) => controller.getOrders(c));
orders.post('/', zValidator('json', createOrderSchema), (c) => controller.createOrder(c));

export { orders as orderRoutes };

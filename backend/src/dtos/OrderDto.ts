import { z } from 'zod';

export const createOrderSchema = z.object({
  userId: z.number().optional(),
  cartId: z.number(),
  shippingAddress: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    zip: z.string(),
    country: z.string(),
  }),
});

export type CreateOrderDto = z.infer<typeof createOrderSchema>;

export const updateStatusSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned']),
});

export type UpdateStatusDto = z.infer<typeof updateStatusSchema>;

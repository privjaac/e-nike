import { z } from 'zod';

export const createOrderSchema = z.object({
  userId: z.number(),
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

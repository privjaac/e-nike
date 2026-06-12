import { z } from 'zod';

export const addCartItemSchema = z.object({
  skuId: z.number(),
  quantity: z.number().min(1),
  unitPrice: z.number(),
});

export const updateCartItemSchema = z.object({
  quantity: z.number().min(1),
});

export type AddCartItemDto = z.infer<typeof addCartItemSchema>;
export type UpdateCartItemDto = z.infer<typeof updateCartItemSchema>;

import { z } from 'zod';

export const addFavoriteSchema = z.object({
  productId: z.number(),
});

export type AddFavoriteDto = z.infer<typeof addFavoriteSchema>;

import { z } from 'zod';

export const addFavoriteSchema = z.object({
  productId: z.coerce.number(),
});

export type AddFavoriteDto = z.infer<typeof addFavoriteSchema>;

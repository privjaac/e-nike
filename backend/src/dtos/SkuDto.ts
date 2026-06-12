import { z } from 'zod';

export const createSkuSchema = z.object({
  sku: z.string().min(1),
  size: z.string().min(1),
  color: z.string().min(1),
  colorHex: z.string().optional().nullable(),
  stockQuantity: z.number().int().min(0).default(0),
  weightGrams: z.number().int().optional().nullable(),
});

export type CreateSkuDto = z.infer<typeof createSkuSchema>;

export const updateSkuSchema = createSkuSchema.partial();
export type UpdateSkuDto = z.infer<typeof updateSkuSchema>;

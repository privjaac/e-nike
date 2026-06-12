import { z } from 'zod';

export const createPromotionSchema = z.object({
  name: z.string().min(1),
  code: z.string().min(1),
  type: z.enum(['percentage', 'fixed', 'bundle']),
  value: z.number(),
  isAutoMarkdown: z.boolean().default(false),
  minWos: z.number().optional(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  isActive: z.boolean().default(true),
  createdBy: z.number(),
});

export type CreatePromotionDto = z.infer<typeof createPromotionSchema>;

export const updatePromotionSchema = createPromotionSchema.partial();
export type UpdatePromotionDto = z.infer<typeof updatePromotionSchema>;

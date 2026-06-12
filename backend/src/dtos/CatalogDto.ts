import { z } from 'zod';

export const productFiltersSchema = z.object({
  category: z.string().optional(),
  sport: z.string().optional(),
  gender: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(24),
});

export type ProductFiltersDto = z.infer<typeof productFiltersSchema>;

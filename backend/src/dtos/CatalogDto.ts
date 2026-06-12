import { z } from 'zod';

export const productFiltersSchema = z.object({
  category: z.string().optional(),
  sport: z.string().optional(),
  gender: z.string().optional(),
  search: z.string().optional(),
  size: z.string().optional(),
  sale: z.enum(['true', 'false']).optional().transform((v) => v === 'true'),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(24),
});

export type ProductFiltersDto = z.infer<typeof productFiltersSchema>;

export const createProductSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  categoryId: z.number().int().positive(),
  sport: z.enum(['running', 'basketball', 'training', 'lifestyle', 'football']),
  gender: z.enum(['men', 'women', 'kids', 'unisex']),
  basePrice: z.number().positive(),
  salePrice: z.number().positive().optional().nullable(),
  imageUrl: z.string().url(),
  gallery: z.array(z.string().url()).optional(),
  isMemberOnly: z.boolean().optional().default(false),
  isFullPrice: z.boolean().optional().default(true),
  status: z.enum(['active', 'inactive', 'discontinued']).optional().default('active'),
});

export type CreateProductDto = z.infer<typeof createProductSchema>;

export const updateProductSchema = createProductSchema.partial();
export type UpdateProductDto = z.infer<typeof updateProductSchema>;

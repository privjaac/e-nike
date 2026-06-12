import { get } from '@/services/api';

export interface Sku {
  id: string;
  sku: string;
  size: string;
  color: string;
  stockQuantity: number;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  categoryId: number;
  sport: string;
  gender: string;
  basePrice: number;
  salePrice: number | null;
  imageUrl: string;
  gallery: string[] | null;
  isMemberOnly: boolean;
  isFullPrice: boolean;
  status: string;
  createdAt: string;
  skus?: Sku[];
}

export interface ProductFilters {
  category?: string;
  sport?: string;
  gender?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ProductsResponse {
  items: Product[];
  pagination: Pagination;
}

export const catalogService = {
  getProducts(filters?: ProductFilters) {
    const params = new URLSearchParams();
    if (filters?.category) params.set('category', filters.category);
    if (filters?.sport) params.set('sport', filters.sport);
    if (filters?.gender) params.set('gender', filters.gender);
    if (filters?.search) params.set('search', filters.search);
    if (filters?.page) params.set('page', String(filters.page));
    if (filters?.limit) params.set('limit', String(filters.limit));

    const qs = params.toString();
    return get<ProductsResponse>(`/catalog/products${qs ? '?' + qs : ''}`);
  },

  getProductBySlug(slug: string) {
    return get<Product>(`/catalog/products/${slug}`);
  },

  getCategories() {
    return get<Array<{ id: number; name: string; slug: string; type: string; parentId?: number }>>('/catalog/categories');
  },
};

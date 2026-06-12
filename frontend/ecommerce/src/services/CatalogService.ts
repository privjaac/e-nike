import { get, post, put, del } from '@/services/api';
import type { Product, Sku, ProductFilters, ProductsResponse } from '@/domain/Product';

export type { Product, Sku, ProductFilters, ProductsResponse };

export const catalogService = {
  getProducts(filters?: ProductFilters) {
    const params = new URLSearchParams();
    if (filters?.category) params.set('category', filters.category);
    if (filters?.sport) params.set('sport', filters.sport);
    if (filters?.gender) params.set('gender', filters.gender);
    if (filters?.search) params.set('search', filters.search);
    if (filters?.size) params.set('size', filters.size);
    if (filters?.sale) params.set('sale', 'true');
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

export type AdminProductInput = Omit<Product, 'id' | 'createdAt'>;

export interface AdminSkuInput {
  sku: string;
  size: string;
  color: string;
  colorHex?: string | null;
  stockQuantity: number;
  weightGrams?: number | null;
}

export const adminCatalogService = {
  getAll(token: string) {
    return get<ProductsResponse>('/catalog/products?limit=100', token);
  },

  create(data: AdminProductInput, token: string) {
    return post<Product>('/catalog/admin/products', data, token);
  },

  update(id: number, data: Partial<AdminProductInput>, token: string) {
    return put<Product>(`/catalog/admin/products/${id}`, data, token);
  },

  remove(id: number, token: string) {
    return del<void>(`/catalog/admin/products/${id}`, token);
  },

  getSkus(productId: number, token: string) {
    return get<Sku[]>(`/catalog/admin/products/${productId}/skus`, token);
  },

  createSku(productId: number, data: AdminSkuInput, token: string) {
    return post<Sku>(`/catalog/admin/products/${productId}/skus`, data, token);
  },

  updateSku(skuId: number, data: Partial<AdminSkuInput>, token: string) {
    return put<Sku>(`/catalog/admin/skus/${skuId}`, data, token);
  },

  removeSku(skuId: number, token: string) {
    return del<void>(`/catalog/admin/skus/${skuId}`, token);
  },
};

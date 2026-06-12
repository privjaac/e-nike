export interface Sku {
  id: number;
  productId: number;
  sku: string;
  size: string;
  color: string;
  colorHex: string | null;
  stockQuantity: number;
  weightGrams: number | null;
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
  size?: string;
  sale?: boolean;
  isMemberOnly?: boolean;
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

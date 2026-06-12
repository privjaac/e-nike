export interface Category {
  id: number;
  name: string;
  slug: string;
  type: 'shoes' | 'apparel' | 'accessories';
  parentId?: number;
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
}

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

export interface ProductWithSkus extends Product {
  skus: Sku[];
}

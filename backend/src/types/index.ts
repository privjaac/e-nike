/**
 * Domain types shared across all layers.
 * These are pure TypeScript interfaces — no framework, no ORM.
 */

export interface User {
  id: number;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  role: 'customer' | 'admin' | 'merchandiser';
  membershipTier: string;
  preferences?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}

export interface SafeUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  membershipTier: string;
  preferences?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthPayload {
  user: SafeUser;
  token: string;
}

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

export interface Cart {
  id: number | null;
  userId?: number;
  sessionId?: string;
  status: string;
  items: CartItem[];
  subtotal: number;
}

export interface CartItem {
  id: number;
  cartId: number;
  skuId: number;
  quantity: number;
  unitPrice: number;
  sku?: Sku;
  product?: Product;
}

export interface Order {
  id: number;
  userId: number;
  orderNumber: string;
  status: string;
  totalAmount: number;
  shippingAddress?: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  fulfillmentNodeId?: number;
  estimatedDelivery?: string;
  createdAt: string;
}

export interface OrderWithItems extends Order {
  items: CartItem[];
}

export interface InventoryNode {
  id: number;
  name: string;
  code: string;
  type: 'warehouse' | 'store' | 'partner';
  city: string;
  country: string;
}

export interface InventoryStock {
  id: number;
  skuId: number;
  nodeId: number;
  quantity: number;
  reservedQuantity: number;
  updatedAt: string;
}

export interface Promotion {
  id: number;
  name: string;
  code: string;
  type: 'percentage' | 'fixed' | 'bundle';
  value: number;
  isAutoMarkdown: boolean;
  minWos?: number;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  createdBy: number;
  createdAt: string;
}

export interface Favorite {
  id: number;
  userId: number;
  productId: number;
  createdAt: string;
}

export interface FavoriteWithProduct extends Favorite {
  product: Product;
}

export interface DashboardMetrics {
  totalOrders: number;
  totalProducts: number;
  totalUsers: number;
  avgOrderValue: number;
}

export interface InventoryPerformance {
  lowStockItems: number;
  totalUnits: number;
}

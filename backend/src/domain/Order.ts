import type { CartItem } from '@/domain/Cart';

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

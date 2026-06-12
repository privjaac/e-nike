import { get, post, patch } from '@/services/api';

export interface OrderItem {
  id: number;
  orderId: number;
  skuId: number;
  productId: number;
  productName: string;
  skuCode: string;
  size: string;
  color: string;
  quantity: number;
  unitPrice: number;
  createdAt: string;
}

export interface Order {
  id: number;
  orderNumber: string;
  userId: number | null;
  status: string;
  totalAmount: number;
  shippingAddress?: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  createdAt: string;
}

export interface OrderWithItems extends Order {
  items: OrderItem[];
}

export interface CreateOrderData {
  userId?: number;
  cartId: number;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
}

export const orderService = {
  getAll(token?: string | null) {
    return get<Order[]>('/orders', token);
  },

  getById(id: number, token?: string | null, guestToken?: string | null) {
    const headers: Record<string, string> = {};
    if (guestToken) headers['X-Guest-Token'] = guestToken;
    return get<OrderWithItems>(`/orders/${id}`, token, { headers });
  },

  create(data: CreateOrderData, token?: string | null) {
    return post<{ order: Order; guestToken?: string }>('/orders', data, token);
  },

  updateStatus(id: number, status: string, token: string) {
    return patch<Order>(`/orders/${id}/status`, { status }, token);
  },
};

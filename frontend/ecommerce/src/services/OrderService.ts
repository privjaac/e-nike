import { get, post } from '@/services/api';

export interface Order {
  id: number;
  orderNumber: string;
  userId: number;
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

export interface CreateOrderData {
  userId: number;
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

  create(data: CreateOrderData, token: string) {
    return post<Order>('/orders', data, token);
  },
};

export interface Order {
  id: number;
  userId: number | null;
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
  guestTokenHash?: string | null;
  createdAt: string;
}

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

export interface OrderWithItems extends Order {
  items: OrderItem[];
}

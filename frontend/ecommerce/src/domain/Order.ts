export interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface Order {
  id: number;
  orderNumber: string;
  status: string;
  totalAmount: number;
  shippingAddress: ShippingAddress;
  createdAt: string;
}

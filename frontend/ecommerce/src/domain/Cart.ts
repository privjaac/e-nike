export interface CartItem {
  id: string;
  cartId: string;
  skuId: string;
  quantity: number;
  unitPrice: number;
  sku?: {
    size: string;
    color: string;
  };
  product?: {
    name: string;
    slug: string;
    imageUrl: string;
  };
  image?: string;
  name?: string;
}

export interface Cart {
  id: number | null;
  items: CartItem[];
  subtotal: number;
}

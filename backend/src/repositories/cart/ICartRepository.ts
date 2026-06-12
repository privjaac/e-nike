import type { CartItem } from '@/domain/Cart';

export interface CartRow {
  id: number;
  userId: number | null;
  sessionId: string | null;
  status: 'active' | 'converted' | 'abandoned';
  createdAt: string;
  updatedAt: string;
}

export interface ICartRepository {
  findById(id: number): Promise<CartRow | undefined>;
  findByUserId(userId: number): Promise<CartRow | undefined>;
  findBySessionId(sessionId: string): Promise<CartRow | undefined>;
  create(data: { userId?: number; sessionId?: string }): Promise<CartRow>;
  assignUser(sessionId: string, userId: number): Promise<void>;
  getItems(cartId: number): Promise<CartItem[]>;
  addItem(data: { cartId: number; skuId: number; quantity: number; unitPrice: number }): Promise<CartItem>;
  updateItem(itemId: number, quantity: number): Promise<void>;
  removeItem(itemId: number): Promise<void>;
  markConverted(cartId: number): Promise<void>;
}

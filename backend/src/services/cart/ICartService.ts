import type { Cart, CartItem } from '@/domain/Cart';
import type { AddCartItemDto } from '@/dtos/CartDto';

export interface ICartService {
  getCart(userId?: number, sessionId?: string): Promise<Cart | null>;
  addItem(data: AddCartItemDto & { userId?: number; sessionId?: string }): Promise<CartItem>;
  updateItem(itemId: number, quantity: number): Promise<void>;
  removeItem(itemId: number): Promise<void>;
  mergeOnLogin(sessionId: string, userId: number): Promise<Cart>;
}

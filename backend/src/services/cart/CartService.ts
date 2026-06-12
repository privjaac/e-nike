import type { ICartRepository } from '@/repositories/cart/ICartRepository';
import type { ICartService } from '@/services/cart/ICartService';
import type { Cart, CartItem } from '@/domain/Cart';
import type { AddCartItemDto } from '@/dtos/CartDto';

export class CartService implements ICartService {
  constructor(private cartRepository: ICartRepository) {}

  async getCart(userId?: number, sessionId?: string): Promise<Cart | null> {
    let row;
    if (userId) {
      row = await this.cartRepository.findByUserId(userId);
    } else if (sessionId) {
      row = await this.cartRepository.findBySessionId(sessionId);
    }

    if (!row) return null;

    const items = await this.cartRepository.getItems(row.id);
    const subtotal = items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);

    return {
      id: row.id,
      userId: row.userId,
      sessionId: row.sessionId,
      status: row.status,
      items,
      subtotal,
    };
  }

  async addItem(data: AddCartItemDto & { userId?: number; sessionId?: string }): Promise<CartItem> {
    let cart;
    if (data.userId) {
      cart = await this.cartRepository.findByUserId(data.userId);
      if (!cart) {
        cart = await this.cartRepository.create({ userId: data.userId });
      }
    } else if (data.sessionId) {
      cart = await this.cartRepository.findBySessionId(data.sessionId);
      if (!cart) {
        cart = await this.cartRepository.create({ sessionId: data.sessionId });
      }
    }

    if (!cart) {
      throw new Error('Either userId or sessionId is required');
    }

    return this.cartRepository.addItem({
      cartId: cart.id,
      skuId: data.skuId,
      quantity: data.quantity,
      unitPrice: data.unitPrice,
    });
  }

  async updateItem(itemId: number, quantity: number): Promise<void> {
    await this.cartRepository.updateItem(itemId, quantity);
  }

  async removeItem(itemId: number): Promise<void> {
    await this.cartRepository.removeItem(itemId);
  }

  async mergeOnLogin(sessionId: string, userId: number): Promise<Cart> {
    const guestCart = await this.cartRepository.findBySessionId(sessionId);
    const userCart = await this.cartRepository.findByUserId(userId);

    if (guestCart && userCart) {
      const guestItems = await this.cartRepository.getItems(guestCart.id);
      const userItems = await this.cartRepository.getItems(userCart.id);

      for (const guestItem of guestItems) {
        const existing = userItems.find((i) => i.skuId === guestItem.skuId);
        if (existing) {
          await this.cartRepository.updateItem(existing.id, existing.quantity + guestItem.quantity);
        } else {
          await this.cartRepository.addItem({
            cartId: userCart.id,
            skuId: guestItem.skuId,
            quantity: guestItem.quantity,
            unitPrice: guestItem.unitPrice,
          });
        }
      }

      await this.cartRepository.markConverted(guestCart.id);

      const mergedItems = await this.cartRepository.getItems(userCart.id);
      const subtotal = mergedItems.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);

      return {
        id: userCart.id,
        userId: userCart.userId,
        sessionId: userCart.sessionId,
        status: userCart.status,
        items: mergedItems,
        subtotal,
      };
    }

    if (guestCart) {
      await this.cartRepository.assignUser(sessionId, userId);
      const items = await this.cartRepository.getItems(guestCart.id);
      const subtotal = items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);

      return {
        id: guestCart.id,
        userId,
        sessionId: null,
        status: guestCart.status,
        items,
        subtotal,
      };
    }

    if (userCart) {
      const items = await this.cartRepository.getItems(userCart.id);
      const subtotal = items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);

      return {
        id: userCart.id,
        userId: userCart.userId,
        sessionId: userCart.sessionId,
        status: userCart.status,
        items,
        subtotal,
      };
    }

    const newCart = await this.cartRepository.create({ userId });
    return {
      id: newCart.id,
      userId: newCart.userId,
      sessionId: newCart.sessionId,
      status: newCart.status,
      items: [],
      subtotal: 0,
    };
  }
}

import { CartRepository } from '../repositories/cart.repository';

export class CartService {
  private cartRepo = new CartRepository();

  async getCart(cartId?: number, sessionId?: string) {
    let cart;
    if (cartId) {
      cart = await this.cartRepo.findById(cartId);
    } else if (sessionId) {
      cart = await this.cartRepo.findBySessionId(sessionId);
    }

    if (!cart) {
      return { id: null, items: [], subtotal: 0 };
    }

    const items = await this.cartRepo.getItems(cart.id);
    const subtotal = items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);

    return {
      ...cart,
      items,
      subtotal,
    };
  }

  async addItem(data: { cartId?: number; sessionId?: string; skuId: number; quantity: number; unitPrice: number }) {
    let cart;
    if (data.cartId) {
      cart = await this.cartRepo.findById(data.cartId);
    }

    if (!cart && data.sessionId) {
      cart = await this.cartRepo.create(data.sessionId);
    } else if (!cart) {
      throw new Error('Cart not found');
    }

    return this.cartRepo.addItem({
      cartId: cart.id,
      skuId: data.skuId,
      quantity: data.quantity,
      unitPrice: data.unitPrice,
    });
  }

  async updateItem(itemId: number, quantity: number) {
    await this.cartRepo.updateItem(itemId, quantity);
  }

  async removeItem(itemId: number) {
    await this.cartRepo.removeItem(itemId);
  }
}

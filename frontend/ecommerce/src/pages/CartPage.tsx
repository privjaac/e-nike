import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Trash2, Minus, Plus, ArrowRight } from 'lucide-react';
import { useCartStore } from '../stores/cartStore';
import { useToastStore } from '../stores/toastStore';

export function CartPage() {
  const navigate = useNavigate();
  const { items, subtotal, itemCount, isLoading, fetchCart, removeItem, updateQuantity } = useCartStore();
  const addToast = useToastStore((s) => s.addToast);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  if (isLoading && items.length === 0) {
    return (
      <div className="pt-32 pb-20 max-w-screen-2xl mx-auto px-6 min-h-[60vh]">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-surface-container-high rounded w-48" />
          <div className="h-32 bg-surface-container-high rounded" />
          <div className="h-32 bg-surface-container-high rounded" />
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="pt-32 pb-20 max-w-screen-2xl mx-auto px-6 min-h-[60vh] flex flex-col items-center justify-center text-center">
        <ShoppingBag className="w-16 h-16 text-on-surface-variant mb-6" />
        <h1 className="text-3xl font-black font-headline uppercase italic tracking-tighter mb-4">
          Your Bag is Empty
        </h1>
        <p className="text-on-surface-variant mb-8 max-w-sm">
          Looks like you haven't added anything yet. Explore our latest drops and find your perfect fit.
        </p>
        <Link
          to="/products"
          className="bg-on-surface text-surface px-10 py-4 font-black font-headline uppercase tracking-tighter hover:opacity-90 transition-opacity"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-20 max-w-screen-2xl mx-auto px-6 min-h-screen">
      <h1 className="text-4xl font-black font-headline uppercase italic tracking-tighter mb-2">
        Shopping Bag
      </h1>
      <p className="text-on-surface-variant text-sm mb-12">
        {itemCount} {itemCount === 1 ? 'item' : 'items'}
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Cart Items */}
        <div className="lg:col-span-8 space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex gap-6 p-6 bg-surface-container-lowest border border-outline-variant/10"
            >
              {/* Product Image */}
              <Link
                to={item.product?.slug ? `/products/${item.product.slug}` : '#'}
                className="w-28 h-28 bg-surface-container-low flex-shrink-0 overflow-hidden"
              >
                {item.product?.imageUrl || item.image ? (
                  <img
                    src={item.product?.imageUrl || item.image}
                    alt={item.product?.name || item.name || 'Product'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-surface-container-high" />
                )}
              </Link>

              {/* Product Info */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-headline font-bold text-lg uppercase tracking-tight">
                      {item.product?.name || item.name || 'Product'}
                    </h3>
                    <p className="text-sm text-on-surface-variant mt-1">
                      {item.sku?.size ? `Size ${item.sku.size}` : ''}
                      {item.sku?.color ? ` / ${item.sku.color}` : ''}
                    </p>
                  </div>
                  <p className="font-bold text-lg">
                    ${((item.unitPrice || 0) * (item.quantity || 1)).toFixed(2)}
                  </p>
                </div>

                <div className="flex items-center justify-between mt-6">
                  {/* Quantity Controls */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={async () => {
                        const newQty = (item.quantity || 1) - 1;
                        if (newQty < 1) {
                          try {
                            await removeItem(item.id);
                            addToast('Item removed from bag', 'success');
                          } catch {
                            addToast('Failed to remove item', 'error');
                          }
                        } else {
                          try {
                            await updateQuantity(item.id, newQty);
                          } catch {
                            addToast('Failed to update quantity', 'error');
                          }
                        }
                      }}
                      className="w-8 h-8 border border-outline-variant flex items-center justify-center hover:bg-surface-container-high transition-colors cursor-pointer"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-8 text-center text-sm font-bold">{item.quantity || 1}</span>
                    <button
                      onClick={async () => {
                        try {
                          await updateQuantity(item.id, (item.quantity || 1) + 1);
                        } catch {
                          addToast('Failed to update quantity', 'error');
                        }
                      }}
                      className="w-8 h-8 border border-outline-variant flex items-center justify-center hover:bg-surface-container-high transition-colors cursor-pointer"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() => removeItem(item.id)}
                    className="flex items-center gap-2 text-xs font-bold uppercase tracking-tight text-error hover:text-on-error-container transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-4">
          <div className="bg-surface-container-lowest p-8 sticky top-32">
            <h2 className="font-headline font-black text-xl uppercase tracking-tight italic mb-6">
              Order Summary
            </h2>

            <div className="space-y-4 pb-6 border-b border-outline-variant/20">
              <div className="flex justify-between text-sm">
                <span className="text-on-surface-variant">Subtotal</span>
                <span className="font-bold">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-on-surface-variant">Estimated Shipping</span>
                <span className="font-bold">Free</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-on-surface-variant">Estimated Tax</span>
                <span className="font-bold">—</span>
              </div>
            </div>

            <div className="flex justify-between items-center py-6">
              <span className="font-headline font-black text-lg uppercase">Total</span>
              <span className="font-headline font-black text-2xl">${subtotal.toFixed(2)}</span>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full py-5 bg-on-surface text-surface font-headline font-black uppercase italic tracking-widest text-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2 cursor-pointer"
            >
              Checkout
              <ArrowRight className="w-5 h-5" />
            </button>

            <div className="mt-6 flex items-center gap-3 text-xs text-on-surface-variant">
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              Member benefit: Free returns within 60 days
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

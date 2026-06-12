import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ChevronRight, ChevronLeft, Loader2, MapPin, Package, CreditCard } from 'lucide-react';
import { useCartStore } from '../stores/cartStore';
import { useAuthStore } from '../stores/authStore';
import { useToastStore } from '../stores/toastStore';
import { orderService } from '../services/order.service';

interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}



export function CheckoutPage() {
  const navigate = useNavigate();
  const { items, subtotal, cartId, clearCart } = useCartStore();
  const { user, token, isAuthenticated } = useAuthStore();
  const addToast = useToastStore((s) => s.addToast);

  const [step, setStep] = useState(1);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    street: '',
    city: '',
    state: '',
    zip: '',
    country: 'US',
  });

  if (!isAuthenticated) {
    return (
      <div className="pt-32 pb-20 max-w-screen-2xl mx-auto px-6 min-h-[60vh] flex flex-col items-center justify-center text-center">
        <Package className="w-16 h-16 text-on-surface-variant mb-6" />
        <h1 className="text-3xl font-black font-headline uppercase italic tracking-tighter mb-4">
          Sign In to Checkout
        </h1>
        <p className="text-on-surface-variant mb-8 max-w-sm">
          Please sign in to your account to complete your purchase.
        </p>
        <button
          onClick={() => navigate('/auth')}
          className="bg-on-surface text-surface px-10 py-4 font-black font-headline uppercase tracking-tighter hover:opacity-90 transition-opacity"
        >
          Sign In
        </button>
      </div>
    );
  }

  if (items.length === 0 && !orderComplete) {
    return (
      <div className="pt-32 pb-20 max-w-screen-2xl mx-auto px-6 min-h-[60vh] flex flex-col items-center justify-center text-center">
        <Package className="w-16 h-16 text-on-surface-variant mb-6" />
        <h1 className="text-3xl font-black font-headline uppercase italic tracking-tighter mb-4">
          Your Bag is Empty
        </h1>
        <p className="text-on-surface-variant mb-8 max-w-sm">
          Add some items to your bag before checking out.
        </p>
        <button
          onClick={() => navigate('/products')}
          className="bg-on-surface text-surface px-10 py-4 font-black font-headline uppercase tracking-tighter hover:opacity-90 transition-opacity"
        >
          Start Shopping
        </button>
      </div>
    );
  }

  if (orderComplete) {
    return (
      <div className="pt-32 pb-20 max-w-screen-2xl mx-auto px-6 min-h-[60vh] flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 bg-primary-container rounded-full flex items-center justify-center mb-6">
          <Check className="w-10 h-10 text-on-primary-container" />
        </div>
        <h1 className="text-4xl font-black font-headline uppercase italic tracking-tighter mb-4">
          Order Confirmed
        </h1>
        <p className="text-on-surface-variant mb-8 max-w-md">
          Thank you for your purchase! Your order has been placed successfully. You will receive a confirmation email shortly.
        </p>
        <button
          onClick={() => navigate('/')}
          className="bg-on-surface text-surface px-10 py-4 font-black font-headline uppercase tracking-tighter hover:opacity-90 transition-opacity"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  const canProceedStep1 = items.length > 0;
  const canProceedStep2 =
    shippingAddress.street.trim().length > 0 &&
    shippingAddress.city.trim().length > 0 &&
    shippingAddress.state.trim().length > 0 &&
    shippingAddress.zip.trim().length > 0 &&
    shippingAddress.country.trim().length > 0;

  const handlePlaceOrder = async () => {
    if (!user || !cartId) return;
    setIsPlacingOrder(true);
    try {
      await orderService.create(
        { userId: user.id, cartId: Number(cartId), shippingAddress },
        token!
      );
      clearCart();
      setOrderComplete(true);
      addToast('Order placed successfully!', 'success');
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Failed to place order', 'error');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const steps = [
    { number: 1, label: 'Review', icon: Package },
    { number: 2, label: 'Shipping', icon: MapPin },
    { number: 3, label: 'Confirm', icon: CreditCard },
  ];

  return (
    <div className="pt-32 pb-20 max-w-screen-2xl mx-auto px-6 min-h-screen">
      <h1 className="text-4xl font-black font-headline uppercase italic tracking-tighter mb-2">
        Checkout
      </h1>
      <p className="text-on-surface-variant text-sm mb-12">
        Complete your purchase in a few simple steps.
      </p>

      {/* Stepper */}
      <div className="flex items-center gap-4 mb-12">
        {steps.map((s, idx) => {
          const Icon = s.icon;
          const isActive = step === s.number;
          const isCompleted = step > s.number;
          return (
            <div key={s.number} className="flex items-center gap-4">
              <div
                className={[
                  'flex items-center gap-2 px-4 py-2 rounded-full transition-colors',
                  isActive
                    ? 'bg-primary-container text-on-primary-container'
                    : isCompleted
                      ? 'bg-surface-container-high text-on-surface'
                      : 'bg-surface-container-low text-on-surface-variant',
                ].join(' ')}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-bold uppercase tracking-tight hidden sm:inline">
                  {s.label}
                </span>
              </div>
              {idx < steps.length - 1 && (
                <ChevronRight className="w-4 h-4 text-on-surface-variant" />
              )}
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Main Content */}
        <div className="lg:col-span-8">
          {/* Step 1: Review Items */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="font-headline font-black text-xl uppercase tracking-tight italic mb-6">
                Review Your Items
              </h2>
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-6 p-6 bg-surface-container-lowest border border-outline-variant/10"
                >
                  <div className="w-24 h-24 bg-surface-container-low flex-shrink-0 overflow-hidden">
                    {item.product?.imageUrl || item.image ? (
                      <img
                        src={item.product?.imageUrl || item.image}
                        alt={item.product?.name || item.name || 'Product'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-surface-container-high" />
                    )}
                  </div>
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
                        <p className="text-sm text-on-surface-variant mt-1">
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <p className="font-bold text-lg">
                        ${((item.unitPrice || 0) * (item.quantity || 1)).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Step 2: Shipping Address */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="font-headline font-black text-xl uppercase tracking-tight italic mb-6">
                Shipping Address
              </h2>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-bold uppercase tracking-tight mb-2">
                    Street Address
                  </label>
                  <input
                    type="text"
                    value={shippingAddress.street}
                    onChange={(e) =>
                      setShippingAddress((prev) => ({ ...prev, street: e.target.value }))
                    }
                    placeholder="123 Main Street"
                    className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant/20 text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold uppercase tracking-tight mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      value={shippingAddress.city}
                      onChange={(e) =>
                        setShippingAddress((prev) => ({ ...prev, city: e.target.value }))
                      }
                      placeholder="New York"
                      className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant/20 text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold uppercase tracking-tight mb-2">
                      State
                    </label>
                    <input
                      type="text"
                      value={shippingAddress.state}
                      onChange={(e) =>
                        setShippingAddress((prev) => ({ ...prev, state: e.target.value }))
                      }
                      placeholder="NY"
                      className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant/20 text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold uppercase tracking-tight mb-2">
                      ZIP Code
                    </label>
                    <input
                      type="text"
                      value={shippingAddress.zip}
                      onChange={(e) =>
                        setShippingAddress((prev) => ({ ...prev, zip: e.target.value }))
                      }
                      placeholder="10001"
                      className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant/20 text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold uppercase tracking-tight mb-2">
                      Country
                    </label>
                    <input
                      type="text"
                      value={shippingAddress.country}
                      onChange={(e) =>
                        setShippingAddress((prev) => ({ ...prev, country: e.target.value }))
                      }
                      placeholder="US"
                      className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant/20 text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Confirm & Place Order */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="font-headline font-black text-xl uppercase tracking-tight italic mb-6">
                Confirm & Place Order
              </h2>

              {/* Shipping Summary */}
              <div className="p-6 bg-surface-container-lowest border border-outline-variant/10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-headline font-bold uppercase tracking-tight">Shipping To</h3>
                  <button
                    onClick={() => setStep(2)}
                    className="text-xs font-bold uppercase tracking-tight text-primary hover:text-primary-container transition-colors cursor-pointer"
                  >
                    Edit
                  </button>
                </div>
                <div className="text-sm text-on-surface-variant space-y-1">
                  <p className="text-on-surface font-medium">{shippingAddress.street}</p>
                  <p>
                    {shippingAddress.city}, {shippingAddress.state} {shippingAddress.zip}
                  </p>
                  <p>{shippingAddress.country}</p>
                </div>
              </div>

              {/* Items Summary */}
              <div className="p-6 bg-surface-container-lowest border border-outline-variant/10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-headline font-bold uppercase tracking-tight">Items</h3>
                  <button
                    onClick={() => setStep(1)}
                    className="text-xs font-bold uppercase tracking-tight text-primary hover:text-primary-container transition-colors cursor-pointer"
                  >
                    Edit
                  </button>
                </div>
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-on-surface-variant">
                        {item.product?.name || item.name || 'Product'} x {item.quantity}
                      </span>
                      <span className="font-bold">
                        ${((item.unitPrice || 0) * (item.quantity || 1)).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Place Order Button */}
              <button
                onClick={handlePlaceOrder}
                disabled={isPlacingOrder}
                className="w-full py-5 bg-on-surface text-surface font-headline font-black uppercase italic tracking-widest text-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
              >
                {isPlacingOrder ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Placing Order...
                  </>
                ) : (
                  <>
                    Place Order
                    <Check className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center gap-4 mt-8">
            {step > 1 && (
              <button
                onClick={() => setStep((s) => s - 1)}
                className="flex items-center gap-2 px-6 py-3 border border-outline-variant font-bold uppercase tracking-tight text-sm hover:bg-surface-container-high transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
            )}
            {step < 3 && (
              <button
                onClick={() => setStep((s) => s + 1)}
                disabled={step === 1 ? !canProceedStep1 : !canProceedStep2}
                className="flex items-center gap-2 px-6 py-3 bg-on-surface text-surface font-bold uppercase tracking-tight text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Continue
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Order Summary Sidebar */}
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

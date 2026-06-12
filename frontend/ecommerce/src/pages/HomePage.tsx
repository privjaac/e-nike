import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Truck,
  RotateCcw,
  Gift,
  Loader2,
} from 'lucide-react';
import { useCartStore } from '../stores/cartStore';
import { useToastStore } from '../stores/toastStore';
import { catalogService } from '../services/catalog.service';

interface Sku {
  id: string;
  size: string;
  stockQuantity: number;
}

interface Product {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  categoryId: number;
  sport: string;
  gender: string;
  basePrice: number;
  salePrice: number | null;
  imageUrl: string;
  gallery: string[] | null;
  isMemberOnly: boolean;
  isFullPrice: boolean;
  status: string;
  createdAt: string;
  skus?: Sku[];
}

const NOTIFY_KEY = 'nike-notifications';

function getNotifications(): string[] {
  try {
    return JSON.parse(localStorage.getItem(NOTIFY_KEY) || '[]');
  } catch {
    return [];
  }
}

function setNotifications(list: string[]) {
  localStorage.setItem(NOTIFY_KEY, JSON.stringify(list));
}

export function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quickAddingId, setQuickAddingId] = useState<number | null>(null);
  const [notifiedIds, setNotifiedIds] = useState<string[]>(getNotifications());
  const [jfyOffset, setJfyOffset] = useState(0);

  const justForYouRef = useRef<HTMLElement>(null);
  const dropsRef = useRef<HTMLDivElement>(null);
  const { addItem, fetchCart } = useCartStore();
  const addToast = useToastStore((s) => s.addToast);

  useEffect(() => {
    let cancelled = false;

    async function fetchProducts() {
      try {
        setLoading(true);
        setError(null);
        const json = await catalogService.getProducts({ limit: 6 });
        const items = json.items as Product[];
        if (!cancelled) setProducts(items);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Something went wrong');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchProducts();
    return () => {
      cancelled = true;
    };
  }, []);

  const displayProducts = products.slice(jfyOffset, jfyOffset + 3);
  const preselectedSizes = ['10.5', 'M', '32'];

  const formatCategory = (product: Product) => {
    const gender =
      product.gender === 'unisex'
        ? 'Unisex'
        : product.gender.charAt(0).toUpperCase() + product.gender.slice(1);
    const sport =
      product.sport.charAt(0).toUpperCase() + product.sport.slice(1);
    return `${gender}'s ${sport}`;
  };

  const scrollToJustForYou = () => {
    justForYouRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleNotifyMe = (productName: string) => {
    const list = getNotifications();
    if (list.includes(productName)) {
      const updated = list.filter((name) => name !== productName);
      setNotifications(updated);
      setNotifiedIds(updated);
      addToast('Notification removed', 'success');
    } else {
      const updated = [...list, productName];
      setNotifications(updated);
      setNotifiedIds(updated);
      addToast('You will be notified when this drops!', 'success');
    }
  };

  const handleQuickAdd = async (product: Product) => {
    setQuickAddingId(product.id);
    try {
      let skuId: string | undefined;
      if (product.skus && product.skus.length > 0) {
        const available = product.skus.find((s) => s.stockQuantity > 0);
        skuId = available?.id;
      }
      if (!skuId) {
        const detail = await catalogService.getProductBySlug(product.slug);
        const skus = (detail.skus || []) as Sku[];
        const available = skus.find((s: Sku) => s.stockQuantity > 0);
        if (!available) throw new Error('Product out of stock');
        skuId = available.id;
      }
      if (!skuId) throw new Error('No SKU available');
      await addItem(skuId, 1, product.basePrice);
      addToast('Added to bag!', 'success');
      await fetchCart();
    } catch (err) {
      addToast(
        err instanceof Error ? err.message : 'Failed to add to cart',
        'error'
      );
    } finally {
      setQuickAddingId(null);
    }
  };

  const drops = [
    {
      name: "AJ1 'Crafted Ivory'",
      description: 'Limited Edition Drop - Coming Soon',
      image:
        'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=800&q=80',
    },
    {
      name: 'Nike x NOCTA',
      description: 'Apparel Collection',
      image:
        'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&q=80',
    },
    {
      name: "Vaporfly 3 'EK'",
      description: 'Eliud Kipchoge Edition',
      image:
        'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&q=80',
    },
  ];

  return (
    <main className="pt-24 space-y-24">
      {/* Hero Section */}
      <section className="relative h-[85vh] min-h-[700px] flex flex-col overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=1600&q=80"
            alt="Nike sneaker"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        </div>
        <div className="relative z-10 max-w-screen-2xl mx-auto px-6 h-full flex flex-col justify-end pb-20 w-full">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="max-w-2xl">
              <p className="font-headline font-black italic text-primary-container text-xl mb-4 tracking-widest uppercase">
                Member Exclusive
              </p>
              <h1 className="font-headline font-black text-7xl md:text-9xl kinetic-title leading-[0.8] uppercase text-on-surface">
                FAST
                <br />
                <span className="text-stroke">FORWARD</span>
              </h1>
              <p className="mt-8 text-on-surface-variant text-lg font-medium max-w-md">
                The Air Zoom Alphafly Next% 2. Engineered for the moments that
                matter most. Your personalized speed starts here.
              </p>
              <div className="mt-10 flex gap-4 flex-wrap">
                <Link
                  to="/products"
                  className="bg-primary-container text-on-primary-container px-10 py-4 font-black font-headline uppercase tracking-tighter hover:bg-primary hover:text-white transition-all duration-200"
                >
                  Shop Now
                </Link>
                <button
                  onClick={scrollToJustForYou}
                  className="bg-surface-container-highest text-on-surface px-10 py-4 font-black font-headline uppercase tracking-tighter hover:bg-on-surface hover:text-white transition-all duration-200 cursor-pointer"
                >
                  Explore Collection
                </button>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="bg-surface-container-low/70 backdrop-blur-md p-6 rounded-lg border border-outline-variant/10 max-w-xs shadow-2xl">
                <p className="font-headline font-bold text-xs uppercase tracking-widest text-on-surface-variant mb-4">
                  Trending for you
                </p>
                <div className="flex gap-4 items-center">
                  <div className="w-20 h-20 bg-surface-container-high rounded flex items-center justify-center p-2">
                    <img
                      src="https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&q=80"
                      alt="Trending product"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-bold leading-tight">
                      Pegasus 40 &apos;Volt&apos;
                    </p>
                    <p className="text-sm text-on-surface-variant">$130.00</p>
                    <button
                      onClick={() =>
                        addToast(
                          'Quick Add from trending requires product SKU',
                          'error'
                        )
                      }
                      className="mt-2 text-primary font-bold text-xs uppercase border-b-2 border-primary cursor-pointer hover:opacity-80"
                    >
                      Quick Add
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Just For You Section */}
      <section ref={justForYouRef} className="max-w-screen-2xl mx-auto px-6">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="font-headline font-black text-5xl uppercase italic tracking-tighter">
              Just For You
            </h2>
            <p className="text-on-surface-variant mt-2 font-medium">
              Curated based on your passion for Running and HIIT.
            </p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => setJfyOffset((o) => Math.max(0, o - 1))}
              disabled={jfyOffset === 0}
              className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center hover:bg-surface-container-highest transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5 text-on-surface" />
            </button>
            <button
              onClick={() =>
                setJfyOffset((o) => Math.min(products.length - 3, o + 1))
              }
              disabled={jfyOffset >= Math.max(0, products.length - 3)}
              className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center hover:bg-surface-container-highest transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-5 h-5 text-on-surface" />
            </button>
          </div>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {error && (
          <div className="text-error font-medium text-center py-12">
            {error}
          </div>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {displayProducts.map((product, index) => (
              <div key={product.id} className="group cursor-pointer">
                <div className="aspect-[4/5] bg-surface-container-low relative overflow-hidden mb-6">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute top-4 left-4 bg-primary-container px-3 py-1 text-[10px] font-black uppercase tracking-widest text-on-primary-container">
                    Pre-Selected: Size{' '}
                    {preselectedSizes[index % preselectedSizes.length]}
                  </div>
                  <button
                    onClick={() => handleQuickAdd(product)}
                    disabled={quickAddingId === product.id}
                    className="absolute bottom-4 right-4 bg-white/90 backdrop-blur text-on-surface px-4 py-2 text-xs font-bold uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:bg-primary hover:text-on-primary disabled:opacity-50"
                  >
                    {quickAddingId === product.id ? 'Adding...' : 'Quick Add'}
                  </button>
                </div>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-headline font-bold text-xl uppercase tracking-tight">
                      {product.name}
                    </h3>
                    <p className="text-on-surface-variant">
                      {formatCategory(product)}
                    </p>
                  </div>
                  <p className="font-bold">${product.basePrice}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Member Drops Section */}
      <section className="bg-on-surface text-surface py-24 overflow-hidden">
        <div className="max-w-screen-2xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center mb-16 gap-8">
            <h2 className="font-headline font-black text-6xl italic uppercase tracking-tighter">
              Member Drops
            </h2>
            <div className="flex gap-4">
              <span className="text-primary-container font-bold uppercase tracking-widest text-xs">
                Unlock access in: 04d : 12h : 30m
              </span>
            </div>
          </div>
          <div
            ref={dropsRef}
            className="flex gap-12 overflow-x-auto pb-12 scrollbar-hide"
          >
            {drops.map((drop) => {
              const isNotified = notifiedIds.includes(drop.name);
              return (
                <div key={drop.name} className="flex-none w-80 md:w-[450px]">
                  <div className="aspect-square bg-inverse-surface mb-6 group relative overflow-hidden">
                    <img
                      src={drop.image}
                      alt={drop.name}
                      className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button
                        onClick={() => handleNotifyMe(drop.name)}
                        className="bg-white text-black px-8 py-3 font-bold uppercase text-sm cursor-pointer hover:bg-primary-container transition-colors"
                      >
                        {isNotified ? 'Notified' : 'Notify Me'}
                      </button>
                    </div>
                  </div>
                  <h4 className="font-headline font-bold text-2xl uppercase tracking-tighter">
                    {drop.name}
                  </h4>
                  <p className="text-outline mt-2 font-medium">
                    {drop.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Nike Membership Section */}
      <section className="max-w-screen-2xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-1 bg-surface-container-low">
          <div className="p-8 md:p-16 flex flex-col justify-center">
            <span className="text-primary font-black uppercase tracking-[0.3em] text-sm mb-6">
              Nike Membership
            </span>
            <h2 className="font-headline font-black text-4xl md:text-6xl uppercase leading-none mb-8 tracking-tighter italic">
              Where Sport
              <br />
              Happens.
            </h2>
            <p className="text-on-surface-variant text-xl leading-relaxed mb-10 max-w-md">
              As a member, you get first access to our best products,
              inspiration, and community. All in one place.
            </p>
            <div className="space-y-6">
              <div className="flex gap-4 items-start">
                <Truck className="w-6 h-6 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold uppercase tracking-tight">
                    Free Standard Shipping
                  </p>
                  <p className="text-sm text-on-surface-variant">
                    On all orders, always. No minimums.
                  </p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <RotateCcw className="w-6 h-6 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold uppercase tracking-tight">
                    60-Day Wear Test
                  </p>
                  <p className="text-sm text-on-surface-variant">
                    Not feeling it? Return it within 60 days, even if you&apos;ve
                    worn it.
                  </p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <Gift className="w-6 h-6 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold uppercase tracking-tight">
                    Birthday Rewards
                  </p>
                  <p className="text-sm text-on-surface-variant">
                    A special gift for you every year on your special day.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="relative overflow-hidden min-h-[400px] md:min-h-[500px]">
            <img
              src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&q=80"
              alt="Athletes celebrating"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>
    </main>
  );
}

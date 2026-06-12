import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ChevronDown, ShoppingCart, Bolt, Check } from 'lucide-react';
import { useCartStore } from '@/stores/cartStore';
import { useToastStore } from '@/stores/toastStore';
import { catalogService } from '@/services/CatalogService';

interface Sku {
  id: string;
  size: string;
  stockQuantity: number;
}

interface Product {
  id: string;
  slug: string;
  name: string;
  category: string;
  sport?: string;
  gender?: string;
  price: number;
  imageUrl: string;
  badge?: 'member-only' | 'full-price' | null;
  skus?: Sku[];
  totalStock?: number;
  createdAt?: string;
}

const SPORTS = ['Running', 'Basketball', 'Training & Gym', 'Lifestyle'] as const;

const SIZES = [
  { label: 'US 7', disabled: false },
  { label: 'US 8', disabled: false },
  { label: 'US 9', disabled: false },
  { label: 'US 10', disabled: false },
  { label: 'US 11', disabled: false },
  { label: 'US 12', disabled: true },
] as const;

type SortOption = 'featured' | 'price-low' | 'price-high' | 'newest';

function ProductSkeleton() {
  return (
    <div>
      <div className="relative aspect-[4/5] bg-surface-container-low overflow-hidden mb-4 animate-pulse">
        <div className="absolute inset-0 bg-surface-container" />
      </div>
      <div className="space-y-2">
        <div className="h-5 w-2/3 bg-surface-container rounded animate-pulse" />
        <div className="h-4 w-1/2 bg-surface-container rounded animate-pulse" />
        <div className="h-5 w-1/4 bg-surface-container rounded animate-pulse mt-2" />
      </div>
    </div>
  );
}

function FeaturedSkeleton() {
  return (
    <div className="xl:col-span-2 md:col-span-2">
      <div className="relative h-full min-h-[320px] bg-zinc-900 overflow-hidden mb-4 rounded-lg animate-pulse">
        <div className="absolute inset-0 bg-zinc-800" />
      </div>
    </div>
  );
}

export function ListingPage() {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedSports, setSelectedSports] = useState<string[]>([]);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [sortOpen, setSortOpen] = useState(false);

  const { addItem, fetchCart } = useCartStore();
  const addToast = useToastStore((s) => s.addToast);
  const [quickAddingId, setQuickAddingId] = useState<string | null>(null);

  const genderFilter = searchParams.get('gender') || undefined;
  const saleFilter = searchParams.get('sale') || undefined;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    catalogService
      .getProducts({
        sport: selectedSports.length ? selectedSports.join(',') : undefined,
        gender: genderFilter,
        search: searchQuery || undefined,
        sale: saleFilter === 'true',
        limit: 24,
      })
      .then((json) => {
        if (cancelled) return;
        setProducts(json.items as unknown as Product[]);
      })
      .catch((err) => {
        if (!cancelled)
          setError(err instanceof Error ? err.message : 'Unknown error');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedSports, selectedSize, searchQuery, genderFilter, saleFilter]);

  const sortedProducts = useMemo(() => {
    const list = [...products];
    switch (sortBy) {
      case 'price-low':
        return list.sort((a, b) => a.price - b.price);
      case 'price-high':
        return list.sort((a, b) => b.price - a.price);
      case 'newest':
        return list.sort((a, b) => {
          if (a.createdAt && b.createdAt) {
            return (
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
          }
          return b.id.localeCompare(a.id);
        });
      case 'featured':
      default:
        return list;
    }
  }, [products, sortBy]);

  const sortLabel = useMemo(() => {
    switch (sortBy) {
      case 'price-low':
        return 'Price: Low to High';
      case 'price-high':
        return 'Price: High to Low';
      case 'newest':
        return 'Newest';
      case 'featured':
      default:
        return 'Featured';
    }
  }, [sortBy]);

  const toggleSport = (sport: string) => {
    setSelectedSports((prev) =>
      prev.includes(sport) ? prev.filter((s) => s !== sport) : [...prev, sport]
    );
  };

  const handleQuickAdd = async (product: Product, e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
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
      await addItem(skuId, 1, product.price);
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

  return (
    <div className="pt-24 min-h-screen">
      <section className="px-6 max-w-screen-2xl mx-auto py-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <span className="font-headline font-bold text-primary tracking-widest uppercase text-xs">
              Innovation Driven
            </span>
            <h1 className="font-headline text-6xl md:text-8xl font-black italic tracking-tighter uppercase mt-2 leading-none">
              New Arrivals
            </h1>
          </div>
          <div className="flex items-center gap-4 relative">
            <span className="text-sm font-medium text-on-surface-variant">
              Sort by:
            </span>
            <div className="relative">
              <button
                onClick={() => setSortOpen((o) => !o)}
                className="flex items-center gap-2 bg-surface-container-lowest px-4 py-2 rounded-lg border border-outline-variant/15 text-sm font-bold cursor-pointer hover:bg-surface-container-low transition-colors"
              >
                {sortLabel}
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${sortOpen ? 'rotate-180' : ''}`}
                />
              </button>
              {sortOpen && (
                <div className="absolute right-0 top-full mt-2 bg-surface-container-highest border border-outline-variant/20 rounded-lg shadow-lg z-20 min-w-[180px]">
                  <button
                    onClick={() => {
                      setSortBy('featured');
                      setSortOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-surface-container-low transition-colors cursor-pointer"
                  >
                    Featured
                  </button>
                  <button
                    onClick={() => {
                      setSortBy('price-low');
                      setSortOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-surface-container-low transition-colors cursor-pointer"
                  >
                    Price: Low to High
                  </button>
                  <button
                    onClick={() => {
                      setSortBy('price-high');
                      setSortOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-surface-container-low transition-colors cursor-pointer"
                  >
                    Price: High to Low
                  </button>
                  <button
                    onClick={() => {
                      setSortBy('newest');
                      setSortOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-surface-container-low transition-colors cursor-pointer"
                  >
                    Newest
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <aside className="lg:col-span-3 space-y-10">
            <div>
              <h3 className="font-headline font-bold uppercase tracking-tight mb-6">
                Filter By Sport
              </h3>
              <div className="space-y-3">
                {SPORTS.map((sport) => (
                  <label
                    key={sport}
                    className="flex items-center gap-3 cursor-pointer group"
                  >
                    <input
                      type="checkbox"
                      checked={selectedSports.includes(sport)}
                      onChange={() => toggleSport(sport)}
                      className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary-container cursor-pointer"
                    />
                    <span className="text-sm font-medium group-hover:text-primary transition-colors">
                      {sport}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-headline font-bold uppercase tracking-tight mb-6">
                Size Availability
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {SIZES.map((size) => {
                  const isActive = selectedSize === size.label && !size.disabled;
                  return (
                    <button
                      key={size.label}
                      disabled={size.disabled}
                      onClick={() =>
                        setSelectedSize((prev) =>
                          prev === size.label ? null : size.label
                        )
                      }
                      className={[
                        'py-3 text-xs font-bold rounded transition-all cursor-pointer',
                        size.disabled
                          ? 'border border-outline-variant/30 opacity-30 cursor-not-allowed'
                          : isActive
                            ? 'bg-zinc-900 text-white'
                            : 'border border-outline-variant/30 hover:border-primary hover:bg-primary-container',
                      ].join(' ')}
                    >
                      {size.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="p-6 bg-primary-container/30 rounded-xl border border-primary-container">
              <div className="flex items-center justify-between mb-2">
                <span className="font-headline font-bold text-on-primary-container">
                  Express Delivery
                </span>
                <Bolt className="w-5 h-5 text-on-primary-container fill-current" />
              </div>
              <p className="text-xs text-on-primary-container mb-4">
                Get your gear delivered within 24 hours in select regions.
              </p>
              <div className="flex items-center gap-2">
                <div className="w-10 h-5 bg-zinc-900 rounded-full relative p-1 cursor-pointer">
                  <div className="w-3 h-3 bg-primary-container rounded-full translate-x-5" />
                </div>
                <span className="text-xs font-bold">ACTIVE</span>
              </div>
            </div>
          </aside>

          <div className="lg:col-span-9">
            {error && (
              <div className="text-center py-20">
                <p className="text-error font-bold text-lg">
                  Something went wrong
                </p>
                <p className="text-on-surface-variant mt-2">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-6 px-6 py-2 bg-primary text-on-primary rounded font-bold text-sm hover:bg-primary-fixed-dim transition-colors cursor-pointer"
                >
                  Retry
                </button>
              </div>
            )}

            {!error && loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-12">
                <ProductSkeleton />
                <ProductSkeleton />
                <ProductSkeleton />
                <FeaturedSkeleton />
                <ProductSkeleton />
              </div>
            )}

            {!error && !loading && sortedProducts.length === 0 && (
              <div className="text-center py-20">
                <p className="font-headline text-2xl font-bold text-on-surface-variant">
                  No products found
                </p>
                <p className="text-on-surface-variant mt-2 text-sm">
                  Try adjusting your filters to see more results.
                </p>
              </div>
            )}

            {!error && !loading && sortedProducts.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-12">
                {sortedProducts.map((product, index) => {
                  const isFeatured = index === 3;
                  if (isFeatured) {
                    return (
                      <div
                        key={`featured-${product.id}`}
                        className="group cursor-pointer xl:col-span-2 md:col-span-2"
                      >
                        <div className="relative h-full min-h-[320px] bg-zinc-900 overflow-hidden mb-4 rounded-lg">
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-full h-full object-cover opacity-70 group-hover:scale-105 transition-transform duration-700"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 to-transparent flex flex-col justify-end p-8">
                            <span className="bg-primary-container text-on-primary-container text-[10px] font-black px-2 py-1 uppercase tracking-tighter w-fit mb-2">
                              Editor&apos;s Choice
                            </span>
                            <h3 className="font-headline text-4xl font-black italic tracking-tighter text-white uppercase max-w-md">
                              The Science of Speed
                            </h3>
                            <p className="text-zinc-400 text-sm mt-2 max-w-xs">
                              Engineered for the elite. Shop the Alphafly
                              Collection.
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <Link
                      key={product.id}
                      to={`/products/${product.slug}`}
                      className="group cursor-pointer block"
                    >
                      <div className="relative aspect-[4/5] bg-surface-container-low overflow-hidden mb-4">
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                        {product.badge === 'member-only' && (
                          <div className="absolute top-4 left-4 flex flex-col gap-2">
                            <span className="bg-primary-container text-on-primary-container text-[10px] font-black px-2 py-1 uppercase tracking-tighter">
                              Member Only
                            </span>
                          </div>
                        )}
                        {product.badge === 'full-price' && (
                          <div className="absolute top-4 left-4">
                            <span className="bg-zinc-900 text-white text-[10px] font-black px-2 py-1 uppercase tracking-tighter">
                              Full-Price
                            </span>
                          </div>
                        )}
                        <button
                          type="button"
                          className="absolute bottom-4 right-4 bg-white/80 backdrop-blur p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:bg-primary hover:text-on-primary"
                          onClick={(e) => handleQuickAdd(product, e)}
                          aria-label="Add to cart"
                        >
                          {quickAddingId === product.id ? (
                            <Check className="w-5 h-5 text-zinc-900" />
                          ) : (
                            <ShoppingCart className="w-5 h-5 text-zinc-900" />
                          )}
                        </button>
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-headline font-bold text-lg leading-tight">
                          {product.name}
                        </h4>
                        <p className="text-on-surface-variant text-sm">
                          {product.category}
                        </p>
                        <p className="font-bold mt-2">
                          ${product.price.toFixed(2)}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

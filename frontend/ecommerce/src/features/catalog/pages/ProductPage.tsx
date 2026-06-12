import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
  Ruler,
  Check,
  History,
  Heart,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Plus,
} from 'lucide-react';
import { useCartStore } from '@/stores/cartStore';
import { useToastStore } from '@/stores/toastStore';
import { catalogService } from '@/services/CatalogService';
import { inventoryService } from '@/services/InventoryService';
import type { Product, Sku } from '@/domain/Product';

interface InventoryData {
  productId: number;
  storeName: string;
  stockQuantity: number;
  pickupTime: string;
}

interface RelatedProduct {
  id: number;
  name: string;
  slug: string;
  basePrice: number;
  imageUrl: string;
  category?: string;
  skus?: Sku[];
}

const FAVORITES_KEY = 'nike-favorites';

function getFavorites(): number[] {
  try {
    return JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]');
  } catch {
    return [];
  }
}

function setFavorites(favorites: number[]) {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
}

function getFallbackInventory(productId: number): InventoryData[] {
  return [
    {
      productId,
      storeName: 'Nike NYC - 5th Ave',
      stockQuantity: 5,
      pickupTime: '2 hours',
    },
    {
      productId,
      storeName: 'Nike LA - Melrose',
      stockQuantity: 3,
      pickupTime: '3 hours',
    },
    {
      productId,
      storeName: 'Nike Chicago - Michigan Ave',
      stockQuantity: 8,
      pickupTime: '1 hour',
    },
  ];
}

export function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const { addItem, fetchCart } = useCartStore();
  const addToast = useToastStore((s) => s.addToast);

  const [product, setProduct] = useState<Product | null>(null);
  const [productLoading, setProductLoading] = useState(true);
  const [productError, setProductError] = useState<string | null>(null);

  const [inventoryNodes, setInventoryNodes] = useState<InventoryData[]>([]);
  const [currentNodeIndex, setCurrentNodeIndex] = useState(0);
  const [inventoryLoading, setInventoryLoading] = useState(false);

  const [related, setRelated] = useState<RelatedProduct[]>([]);
  const [relatedLoading, setRelatedLoading] = useState(false);
  const [relatedOffset, setRelatedOffset] = useState(0);

  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [addingToCart, setAddingToCart] = useState(false);
  const [showSizeError, setShowSizeError] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    if (product?.id) {
      setIsFavorited(getFavorites().includes(product.id));
    }
  }, [product?.id]);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;

    async function loadProduct() {
      setProductLoading(true);
      setProductError(null);
      try {
        const productData = await catalogService.getProductBySlug(slug!);
        if (!cancelled) {
          setProduct(productData);
          setSelectedSize(null);
          setShowSizeError(false);
        }
      } catch (err) {
        if (!cancelled) {
          setProductError(
            err instanceof Error ? err.message : 'Failed to load product'
          );
        }
      } finally {
        if (!cancelled) setProductLoading(false);
      }
    }

    loadProduct();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  useEffect(() => {
    if (!product?.id) return;
    const productId = product.id;
    let cancelled = false;

    async function loadInventory() {
      setInventoryLoading(true);
      try {
        const inv = await inventoryService.getProductInventory(Number(productId));
        if (!cancelled) {
          const realStores = inv.nodes.map((node) => ({
            productId,
            storeName: node.name,
            stockQuantity: inv.stock.find((s) => s.nodeId === node.id)?.quantity ?? 0,
            pickupTime: '2 hours',
          }));
            const fallbackStores = getFallbackInventory(productId);
            const existingNames = new Set(realStores.map((s) => s.storeName));
            const nodes = [
              ...realStores,
              ...fallbackStores.filter(
                (s) => !existingNames.has(s.storeName)
              ),
            ];
            setInventoryNodes(nodes);
            setCurrentNodeIndex(0);
        }
      } catch {
        if (!cancelled) {
          setInventoryNodes(getFallbackInventory(productId));
          setCurrentNodeIndex(0);
        }
      } finally {
        if (!cancelled) setInventoryLoading(false);
      }
    }

    loadInventory();

    async function loadRelated() {
      setRelatedLoading(true);
      try {
        const json = await catalogService.getProducts({ limit: 6 });
        if (!cancelled) {
          setRelated(json.items as RelatedProduct[]);
        }
      } catch {
      } finally {
        if (!cancelled) setRelatedLoading(false);
      }
    }

    loadRelated();

    return () => {
      cancelled = true;
    };
  }, [product?.id]);

  const handleAddToBag = useCallback(async () => {
    if (!product) return;
    if (!selectedSize) {
      setShowSizeError(true);
      return;
    }
    setShowSizeError(false);
    const selectedSku = product.skus?.find((s) => s.size === selectedSize);
    if (!selectedSku) {
      addToast('Selected size not available', 'error');
      return;
    }
    setAddingToCart(true);
    try {
      await addItem(selectedSku.id, 1, product.basePrice);
      addToast('Added to bag!', 'success');
      await fetchCart();
    } catch (err) {
      addToast(
        err instanceof Error ? err.message : 'Failed to add to cart',
        'error'
      );
    } finally {
      setAddingToCart(false);
    }
  }, [product, selectedSize, addItem, fetchCart, addToast]);

  const toggleFavorite = useCallback(() => {
    if (!product) return;
    const favorites = getFavorites();
    if (favorites.includes(product.id)) {
      setFavorites(favorites.filter((id) => id !== product.id));
      setIsFavorited(false);
      addToast('Removed from favorites', 'success');
    } else {
      setFavorites([...favorites, product.id]);
      setIsFavorited(true);
      addToast('Added to favorites', 'success');
    }
  }, [product, addToast]);

  const handleChangeStore = useCallback(() => {
    setCurrentNodeIndex((idx) => {
      if (inventoryNodes.length <= 1) return idx;
      return (idx + 1) % inventoryNodes.length;
    });
  }, [inventoryNodes.length]);

  const handleRelatedQuickAdd = useCallback(
    async (relatedProduct: RelatedProduct) => {
      try {
        let skuId: string | number | undefined;
        if (relatedProduct.skus && relatedProduct.skus.length > 0) {
          const available = relatedProduct.skus.find(
            (s) => s.stockQuantity > 0
          );
          skuId = available?.id;
        }
        if (!skuId) {
          const detail = await catalogService.getProductBySlug(relatedProduct.slug);
          const skus = (detail.skus || []) as Sku[];
          const available = skus.find((s) => s.stockQuantity > 0);
          if (!available) throw new Error('Product out of stock');
          skuId = available.id;
        }
        await addItem(skuId, 1, relatedProduct.basePrice);
        addToast('Added to bag!', 'success');
        await fetchCart();
      } catch (err) {
        addToast(
          err instanceof Error ? err.message : 'Failed to add to cart',
          'error'
        );
      }
    },
    [addItem, fetchCart, addToast]
  );

  const handlePrevRelated = useCallback(() => {
    setRelatedOffset((o) => Math.max(0, o - 1));
  }, []);

  const handleNextRelated = useCallback(() => {
    setRelatedOffset((o) => Math.min(related.length - 3, o + 1));
  }, [related.length]);

  if (productLoading) {
    return (
      <div className="pt-24 pb-20 max-w-screen-2xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <section className="lg:col-span-7 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 aspect-[4/5] bg-surface-container-low animate-pulse" />
              <div className="aspect-square bg-surface-container-low animate-pulse" />
              <div className="aspect-square bg-surface-container-low animate-pulse" />
            </div>
            <div className="py-12 px-8 bg-surface-container-lowest animate-pulse h-48" />
          </section>
          <aside className="lg:col-span-5 space-y-8">
            <div className="h-12 bg-surface-container-low animate-pulse" />
            <div className="h-8 bg-surface-container-low animate-pulse w-2/3" />
            <div className="h-32 bg-surface-container-low animate-pulse" />
            <div className="h-56 bg-surface-container-low animate-pulse" />
            <div className="h-12 bg-surface-container-low animate-pulse" />
          </aside>
        </div>
      </div>
    );
  }

  if (productError || !product) {
    return (
      <div className="pt-24 pb-20 max-w-screen-2xl mx-auto px-6">
        <div className="py-20 text-center">
          <p className="text-on-surface-variant text-lg">
            {productError || 'Product not found'}
          </p>
        </div>
      </div>
    );
  }

  const galleryImages =
    product.gallery && product.gallery.length > 0
      ? product.gallery
      : [product.imageUrl];

  const mainImage = galleryImages[0];
  const secondaryImages = galleryImages.slice(1, 3);

  const sizes = product.skus || [];

  const inventory = inventoryNodes[currentNodeIndex] || null;

  const visibleRelated = related.slice(relatedOffset, relatedOffset + 3);

  return (
    <div className="pt-24 pb-20 max-w-screen-2xl mx-auto px-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <section className="lg:col-span-7 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 aspect-[4/5] bg-surface-container-low overflow-hidden group">
              <img
                src={mainImage}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
            </div>
            {secondaryImages.map((img, idx) => (
              <div
                key={idx}
                className="aspect-square bg-surface-container-low overflow-hidden"
              >
                <img
                  src={img}
                  alt={`${product.name} ${idx + 2}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
            {secondaryImages.length < 2 &&
              Array.from({ length: 2 - secondaryImages.length }).map(
                (_, idx) => (
                  <div
                    key={`placeholder-${idx}`}
                    className="aspect-square bg-surface-container-low"
                  />
                )
              )}
          </div>

          <div className="py-12 px-8 bg-surface-container-lowest">
            <h2 className="font-headline text-4xl font-black italic uppercase tracking-tighter mb-6">
              Engineered for Velocity
            </h2>
            <p className="text-on-surface-variant leading-relaxed max-w-xl text-lg">
              {product.description}
            </p>
            <div className="mt-8 grid grid-cols-2 gap-8 border-t border-outline-variant/10 pt-8">
              <div>
                <span className="block font-headline font-bold uppercase text-xs tracking-widest text-primary mb-2">
                  Energy Return
                </span>
                <p className="text-sm">
                  Two slim Zoom Air units in the forefoot deliver Nike&apos;s
                  greatest energy return.
                </p>
              </div>
              <div>
                <span className="block font-headline font-bold uppercase text-xs tracking-widest text-primary mb-2">
                  Stay Fresh
                </span>
                <p className="text-sm">
                  Full-length ZoomX foam offers an ultra-lightweight and
                  responsive ride.
                </p>
              </div>
            </div>
          </div>
        </section>

        <aside className="lg:col-span-5 lg:sticky lg:top-32 h-fit space-y-8">
          <div>
            <h1 className="font-headline text-5xl font-black italic uppercase tracking-tighter leading-none mb-2">
              {product.name}
            </h1>
            <p className="text-on-surface-variant font-medium text-lg">
              Men&apos;s Road Racing Shoes
            </p>
            <p className="text-2xl font-headline font-bold mt-4">
              ${product.basePrice.toFixed(2)}
            </p>
          </div>

          <div className="bg-primary-container p-6 border-l-4 border-primary">
            <div className="flex items-center gap-3 mb-4">
              <Ruler className="text-primary" size={20} />
              <span className="font-headline font-extrabold uppercase tracking-tight text-on-primary-container">
                Fit Intelligence
              </span>
            </div>
            <p className="text-sm text-on-primary-container font-medium mb-4">
              Based on your recent purchase of{' '}
              <span className="underline">Pegasus 40 (Size 10)</span> and zero
              returns in this category:
            </p>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-black text-on-primary-container leading-none">
                Size 10.5
              </span>
              <span className="text-xs uppercase font-bold text-primary pb-1">
                Recommended for You
              </span>
            </div>
            <div className="mt-4 flex gap-4 text-[10px] uppercase font-bold tracking-widest opacity-70">
              <span className="flex items-center gap-1">
                <Check size={14} />
                True to Size
              </span>
              <span className="flex items-center gap-1">
                <History size={14} />
                Personal History Match
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-surface-container-low">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <div>
                {inventoryLoading || !inventory ? (
                  <>
                    <p className="text-sm font-bold">
                      In stock at Nike NYC - 5th Ave
                    </p>
                    <p className="text-xs text-on-surface-variant">
                      Ready for pickup in 2 hours
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-bold">
                      In stock at {inventory.storeName}
                    </p>
                    <p className="text-xs text-on-surface-variant">
                      Ready for pickup in {inventory.pickupTime}
                    </p>
                  </>
                )}
              </div>
            </div>
            <button
              onClick={handleChangeStore}
              className="text-xs font-bold underline uppercase tracking-tighter cursor-pointer hover:text-primary transition-colors"
            >
              Change Store
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-headline font-bold uppercase text-sm tracking-tight">
                Select Size
              </span>
              <button className="text-xs text-on-surface-variant underline">
                Size Guide
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {sizes.map((sku) => {
                const isSelected = selectedSize === sku.size;
                const isDisabled = sku.stockQuantity <= 0;
                return (
                  <button
                    key={sku.id}
                    disabled={isDisabled}
                    onClick={() => {
                      setSelectedSize(sku.size);
                      setShowSizeError(false);
                    }}
                    className={[
                      'py-4 border text-sm font-medium transition-colors',
                      isSelected
                        ? 'ring-2 ring-primary bg-on-surface text-surface font-black italic'
                        : 'border-outline-variant hover:border-on-surface',
                      isDisabled ? 'opacity-40 cursor-not-allowed' : '',
                    ].join(' ')}
                  >
                    {sku.size}
                  </button>
                );
              })}
            </div>
            {showSizeError && (
              <p className="text-error text-sm font-medium">
                Please select a size
              </p>
            )}
          </div>

          <div className="space-y-3">
            <button
              onClick={handleAddToBag}
              disabled={addingToCart}
              className="w-full py-5 bg-on-surface text-surface font-headline font-black uppercase italic tracking-widest text-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {addingToCart ? 'Adding...' : 'Add to Bag'}
            </button>
            <button
              onClick={toggleFavorite}
              className={[
                'w-full py-5 border-2 font-headline font-black uppercase italic tracking-widest text-lg flex items-center justify-center gap-2 transition-colors cursor-pointer',
                isFavorited
                  ? 'border-error text-error bg-error-container hover:bg-error-container/80'
                  : 'border-on-surface hover:bg-surface-container-high',
              ].join(' ')}
            >
              {isFavorited ? 'Favorited' : 'Favorite'}{' '}
              <Heart
                size={20}
                className={isFavorited ? 'fill-current' : ''}
              />
            </button>
          </div>

          <div className="pt-6 border-t border-outline-variant/20">
            <div className="flex gap-4">
              <RotateCcw
                className="text-on-surface-variant shrink-0"
                size={20}
              />
              <div>
                <p className="text-sm font-bold italic uppercase tracking-tight">
                  60-Day Risk-Free Trial
                </p>
                <p className="text-xs text-on-surface-variant leading-relaxed mt-1">
                  If it doesn&apos;t help you fly, send it back. No questions
                  asked. Member-only benefit for a limited time.
                </p>
              </div>
            </div>
          </div>
        </aside>
      </div>

      <section className="mt-32">
        <div className="flex justify-between items-end mb-10">
          <div>
            <span className="block font-headline font-bold uppercase text-xs tracking-[0.3em] text-primary mb-2">
              Curated Essentials
            </span>
            <h2 className="font-headline text-5xl font-black italic uppercase tracking-tighter">
              Complete the Look
            </h2>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handlePrevRelated}
              disabled={relatedOffset === 0}
              className="p-3 border border-outline-variant hover:bg-on-surface hover:text-surface transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={handleNextRelated}
              disabled={relatedOffset >= Math.max(0, related.length - 3)}
              className="p-3 border border-outline-variant hover:bg-on-surface hover:text-surface transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {relatedLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[3/4] bg-surface-container-low mb-6" />
                <div className="h-4 bg-surface-container-low w-2/3 mb-2" />
                <div className="h-4 bg-surface-container-low w-1/3" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {visibleRelated.map((item) => (
              <div key={item.id} className="group">
                <div className="aspect-[3/4] bg-surface-container-low mb-6 overflow-hidden relative">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <button
                    onClick={() => handleRelatedQuickAdd(item)}
                    className="absolute bottom-4 left-4 bg-surface text-on-surface w-10 h-10 flex items-center justify-center rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:bg-primary hover:text-on-primary"
                    aria-label="Add to cart"
                  >
                    <Plus size={18} />
                  </button>
                </div>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-headline font-bold uppercase tracking-tight">
                      {item.name}
                    </h3>
                    <p className="text-sm text-on-surface-variant">
                      {item.category || "Men's Running"}
                    </p>
                  </div>
                  <p className="font-bold">${item.basePrice.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

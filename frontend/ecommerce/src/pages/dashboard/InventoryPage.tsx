import { useEffect, useState } from 'react';
import { Package, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

const API_BASE = 'http://localhost:3001/api/v1';

interface CatalogProduct {
  id: string;
  slug: string;
  name: string;
  sku?: string;
  category: string;
  imageUrl: string;
}

interface InventoryItem {
  sku: string;
  size: string;
  node: string;
  quantity: number;
  reserved: number;
}

interface InventoryProduct {
  id: string;
  name: string;
  sku: string;
  image: string;
  totalStock: number;
  status: 'Optimal' | 'Low' | 'Out of Stock';
}

function getStatus(total: number): InventoryProduct['status'] {
  if (total === 0) return 'Out of Stock';
  if (total < 50) return 'Low';
  return 'Optimal';
}

export function InventoryPage() {
  const token = useAuthStore((s) => s.token);
  const [products, setProducts] = useState<InventoryProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const headers: Record<string, string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const productsRes = await fetch(`${API_BASE}/catalog/products?limit=100`, { headers });
        if (!productsRes.ok) throw new Error(`Products HTTP ${productsRes.status}`);
        const productsJson = (await productsRes.json()) as { data?: { items?: CatalogProduct[] } };
        const catalogItems = productsJson.data?.items ?? [];

        const mapped: InventoryProduct[] = [];

        await Promise.all(
          catalogItems.map(async (product) => {
            try {
              const invRes = await fetch(`${API_BASE}/inventory/product/${product.id}`, { headers });
              if (!invRes.ok) return;
              const invJson = (await invRes.json()) as {
                data?: InventoryItem | InventoryItem[] | { items?: InventoryItem[] };
              };
              const payload = invJson.data;
              if (!payload) return;

              let items: InventoryItem[] = [];
              if (Array.isArray(payload)) {
                items = payload;
              } else if ('items' in payload && Array.isArray(payload.items)) {
                items = payload.items;
              } else {
                items = [payload as InventoryItem];
              }

              const totalStock = items.reduce((sum, item) => sum + (item.quantity ?? 0), 0);

              mapped.push({
                id: product.id,
                name: product.name,
                sku: product.sku || product.slug.toUpperCase(),
                image: product.imageUrl,
                totalStock,
                status: getStatus(totalStock),
              });
            } catch {
              // skip individual product errors
            }
          })
        );

        if (!cancelled) {
          setProducts(mapped);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load inventory');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <div className="p-8">
      <header className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <Package className="w-6 h-6 text-primary" />
          <h1 className="text-4xl font-black font-headline tracking-tighter uppercase italic leading-none">
            Inventory
          </h1>
        </div>
        <p className="text-xs text-on-surface-variant">Real-time stock levels across all nodes and sizes.</p>
      </header>

      {loading && (
        <div className="space-y-2 animate-pulse">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 bg-surface-container-lowest p-4">
              <div className="w-12 h-12 bg-surface-container-high rounded" />
              <div className="flex-1 h-4 bg-surface-container-high rounded" />
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-error text-xs font-bold mb-4">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-y-2">
            <thead>
              <tr className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">
                <th className="pb-4 px-2">Product</th>
                <th className="pb-4">SKU</th>
                <th className="pb-4 text-right">Total Stock</th>
                <th className="pb-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-xs text-zinc-400 font-bold">
                    No inventory data found.
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="bg-surface-container-lowest hover:bg-surface-container-low transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-zinc-100 flex-shrink-0">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <p className="text-xs font-bold text-zinc-900">{product.name}</p>
                      </div>
                    </td>
                    <td className="py-4 text-xs font-bold text-zinc-500">{product.sku}</td>
                    <td className="py-4 text-right font-headline font-bold text-sm">
                      {product.totalStock.toLocaleString()}
                    </td>
                    <td className="py-4 pr-4">
                      <span
                        className={`px-2 py-1 text-[10px] font-bold uppercase ${
                          product.status === 'Optimal'
                            ? 'bg-green-100 text-green-700'
                            : product.status === 'Low'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-error-container text-error'
                        }`}
                      >
                        {product.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

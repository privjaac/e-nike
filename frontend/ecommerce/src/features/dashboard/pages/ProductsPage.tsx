import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Package,
  Plus,
  Pencil,
  Trash2,
  AlertCircle,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { catalogService, adminCatalogService } from '@/services/CatalogService';
import type { Product } from '@/domain/Product';
import { useToastStore } from '@/stores/toastStore';

export function ProductsPage() {
  const navigate = useNavigate();
  const token = useAuthStore((s) => s.token);
  const addToast = useToastStore((s) => s.addToast);

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Array<{ id: number; name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [json, cats] = await Promise.all([
        adminCatalogService.getAll(token),
        catalogService.getCategories(),
      ]);
      setProducts(json.items);
      setCategories(cats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleDelete = async (id: number) => {
    if (!token) return;
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await adminCatalogService.remove(id, token);
      addToast('Product deleted', 'success');
      await fetchProducts();
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Failed to delete', 'error');
    }
  };

  return (
    <div className="p-8">
      <header className="mb-10 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Package className="w-6 h-6 text-primary" />
            <h1 className="text-4xl font-black font-headline tracking-tighter uppercase italic leading-none">
              Products
            </h1>
          </div>
          <p className="text-xs text-on-surface-variant">
            Manage catalog products, SKUs and availability.
          </p>
        </div>
        <button
          onClick={() => navigate('/dashboard/products/new')}
          className="flex items-center gap-2 bg-on-surface text-surface px-6 py-3 font-bold uppercase text-sm tracking-tight hover:opacity-90 transition-opacity cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </header>

      {error && (
        <div className="flex items-center gap-2 text-error text-xs font-bold mb-4">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

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

      {!loading && !error && (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-y-2">
            <thead>
              <tr className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">
                <th className="pb-4 px-2">Product</th>
                <th className="pb-4">Category</th>
                <th className="pb-4">Gender</th>
                <th className="pb-4 text-right">Price</th>
                <th className="pb-4">Status</th>
                <th className="pb-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs text-zinc-400 font-bold">
                    No products found.
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr
                    key={product.id}
                    className="bg-surface-container-lowest hover:bg-surface-container-low transition-colors"
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-zinc-100 flex-shrink-0">
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div>
                          <Link
                            to={`/products/${product.slug}`}
                            target="_blank"
                            className="text-xs font-bold text-zinc-900 hover:text-primary transition-colors"
                          >
                            {product.name}
                          </Link>
                          <p className="text-[10px] text-zinc-400 uppercase">{product.sport}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 text-xs font-bold text-zinc-500">
                      {categories.find((c) => c.id === product.categoryId)?.name ?? product.categoryId}
                    </td>
                    <td className="py-4 text-xs font-bold text-zinc-500 capitalize">{product.gender}</td>
                    <td className="py-4 text-right font-headline font-bold text-sm">
                      ${product.basePrice.toFixed(2)}
                      {product.salePrice && (
                        <span className="text-error text-xs ml-2">${product.salePrice.toFixed(2)}</span>
                      )}
                    </td>
                    <td className="py-4">
                      <span
                        className={[
                          'px-2 py-1 text-[10px] font-bold uppercase',
                          product.status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : product.status === 'inactive'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-error-container text-error',
                        ].join(' ')}
                      >
                        {product.status}
                      </span>
                    </td>
                    <td className="py-4 pr-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => navigate(`/dashboard/products/${product.id}/edit`)}
                          className="p-2 hover:bg-surface-container-high transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-2 hover:bg-error-container text-error transition-colors cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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

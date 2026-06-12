import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Package,
  Plus,
  Trash2,
  Loader2,
  AlertCircle,
  Save,
  X,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { catalogService, adminCatalogService, type AdminProductInput } from '@/services/CatalogService';
import type { Product, Sku } from '@/domain/Product';
import { useToastStore } from '@/stores/toastStore';

const GENDERS = ['men', 'women', 'kids', 'unisex'] as const;
const SPORTS = ['running', 'basketball', 'training', 'lifestyle', 'football'] as const;
const STATUSES = ['active', 'inactive', 'discontinued'] as const;

interface Category {
  id: number;
  name: string;
}

function generateSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function ProductEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const token = useAuthStore((s) => s.token);
  const addToast = useToastStore((s) => s.addToast);

  const isNew = id === 'new';
  const productId = isNew ? null : parseInt(id!, 10);

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [product, setProduct] = useState<Partial<Product>>({
    name: '',
    slug: '',
    description: '',
    categoryId: 1,
    sport: 'running',
    gender: 'men',
    basePrice: 0,
    salePrice: null,
    imageUrl: '',
    gallery: null,
    isMemberOnly: false,
    isFullPrice: true,
    status: 'active',
  });

  const [skus, setSkus] = useState<Sku[]>([]);
  const [skuDrafts, setSkuDrafts] = useState<Array<Partial<Sku> & { isNew?: boolean }>>([]);

  const fetchData = useCallback(async () => {
    if (!token || !productId) return;
    setLoading(true);
    try {
      const [prod, skuList, cats] = await Promise.all([
        catalogService.getProductBySlug(
          (await adminCatalogService.getAll(token)).items.find((p) => p.id === productId)?.slug ?? ''
        ).catch(() => null),
        adminCatalogService.getSkus(productId, token),
        catalogService.getCategories(),
      ]);
      if (prod) setProduct(prod);
      setSkus(skuList);
      setCategories(cats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load product');
    } finally {
      setLoading(false);
    }
  }, [token, productId]);

  useEffect(() => {
    if (!isNew && productId) {
      fetchData();
    } else {
      catalogService.getCategories().then(setCategories).catch(() => {});
      setLoading(false);
    }
  }, [isNew, productId, fetchData]);

  const handleSave = async () => {
    if (!token) return;
    setSaving(true);
    try {
      const payload: AdminProductInput = {
        name: product.name ?? '',
        slug: product.slug || generateSlug(product.name ?? ''),
        description: product.description || null,
        categoryId: product.categoryId ?? 1,
        sport: product.sport ?? 'running',
        gender: product.gender ?? 'men',
        basePrice: product.basePrice ?? 0,
        salePrice: product.salePrice ?? null,
        imageUrl: product.imageUrl ?? '',
        gallery: product.gallery ?? null,
        isMemberOnly: product.isMemberOnly ?? false,
        isFullPrice: product.isFullPrice ?? true,
        status: product.status ?? 'active',
      };

      let savedProduct: Product;
      if (isNew) {
        savedProduct = await adminCatalogService.create(payload, token);
      } else {
        savedProduct = await adminCatalogService.update(productId!, payload, token);
      }

      // Save SKUs
      const targetProductId = savedProduct.id;
      for (const draft of skuDrafts) {
        if (draft.isNew) {
          await adminCatalogService.createSku(targetProductId, {
            sku: draft.sku!,
            size: draft.size!,
            color: draft.color!,
            colorHex: draft.colorHex ?? null,
            stockQuantity: draft.stockQuantity ?? 0,
            weightGrams: draft.weightGrams ?? null,
          }, token);
        }
      }

      addToast(isNew ? 'Product created' : 'Product updated', 'success');
      navigate('/dashboard/products');
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Failed to save', 'error');
    } finally {
      setSaving(false);
    }
  };

  const addSkuDraft = () => {
    setSkuDrafts((prev) => [
      ...prev,
      { sku: '', size: '', color: '', colorHex: '', stockQuantity: 0, weightGrams: null, isNew: true },
    ]);
  };

  const updateSkuDraft = (index: number, field: string, value: unknown) => {
    setSkuDrafts((prev) =>
      prev.map((s, i) => (i === index ? { ...s, [field]: value } : s))
    );
  };

  const removeSkuDraft = (index: number) => {
    setSkuDrafts((prev) => prev.filter((_, i) => i !== index));
  };

  const deleteExistingSku = async (skuId: number) => {
    if (!token) return;
    if (!confirm('Delete this SKU?')) return;
    try {
      await adminCatalogService.removeSku(skuId, token);
      setSkus((prev) => prev.filter((s) => s.id !== skuId));
      addToast('SKU deleted', 'success');
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Failed to delete SKU', 'error');
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl">
      <header className="mb-10">
        <button
          onClick={() => navigate('/dashboard/products')}
          className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-on-surface-variant hover:text-primary transition-colors mb-4 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Products
        </button>
        <div className="flex items-center gap-3">
          <Package className="w-6 h-6 text-primary" />
          <h1 className="text-4xl font-black font-headline tracking-tighter uppercase italic leading-none">
            {isNew ? 'New Product' : 'Edit Product'}
          </h1>
        </div>
      </header>

      {error && (
        <div className="flex items-center gap-2 text-error text-xs font-bold mb-6">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      <div className="space-y-8">
        {/* Product Details */}
        <section className="bg-surface-container-lowest border border-outline-variant/10 p-6">
          <h2 className="font-headline font-black text-lg uppercase italic mb-6">Product Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-[10px] font-bold uppercase tracking-wider mb-1">Name *</label>
              <input
                type="text"
                required
                value={product.name || ''}
                onChange={(e) => setProduct((p) => ({ ...p, name: e.target.value, slug: p.slug || generateSlug(e.target.value) }))}
                className="w-full bg-surface-container-low px-4 py-2 text-sm border border-outline-variant/20 focus:border-primary outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider mb-1">Slug *</label>
              <input
                type="text"
                required
                value={product.slug || ''}
                onChange={(e) => setProduct((p) => ({ ...p, slug: e.target.value }))}
                className="w-full bg-surface-container-low px-4 py-2 text-sm border border-outline-variant/20 focus:border-primary outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider mb-1">Category *</label>
              <select
                value={product.categoryId || 1}
                onChange={(e) => setProduct((p) => ({ ...p, categoryId: parseInt(e.target.value) }))}
                className="w-full bg-surface-container-low px-4 py-2 text-sm border border-outline-variant/20 focus:border-primary outline-none"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider mb-1">Sport *</label>
              <select
                value={product.sport || 'running'}
                onChange={(e) => setProduct((p) => ({ ...p, sport: e.target.value }))}
                className="w-full bg-surface-container-low px-4 py-2 text-sm border border-outline-variant/20 focus:border-primary outline-none"
              >
                {SPORTS.map((s) => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider mb-1">Gender *</label>
              <select
                value={product.gender || 'men'}
                onChange={(e) => setProduct((p) => ({ ...p, gender: e.target.value }))}
                className="w-full bg-surface-container-low px-4 py-2 text-sm border border-outline-variant/20 focus:border-primary outline-none"
              >
                {GENDERS.map((g) => (
                  <option key={g} value={g}>{g.charAt(0).toUpperCase() + g.slice(1)}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider mb-1">Base Price *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={product.basePrice || 0}
                onChange={(e) => setProduct((p) => ({ ...p, basePrice: parseFloat(e.target.value) || 0 }))}
                className="w-full bg-surface-container-low px-4 py-2 text-sm border border-outline-variant/20 focus:border-primary outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider mb-1">Sale Price</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={product.salePrice ?? ''}
                onChange={(e) => setProduct((p) => ({ ...p, salePrice: e.target.value ? parseFloat(e.target.value) : null }))}
                className="w-full bg-surface-container-low px-4 py-2 text-sm border border-outline-variant/20 focus:border-primary outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-[10px] font-bold uppercase tracking-wider mb-1">Image URL *</label>
              <input
                type="url"
                required
                value={product.imageUrl || ''}
                onChange={(e) => setProduct((p) => ({ ...p, imageUrl: e.target.value }))}
                className="w-full bg-surface-container-low px-4 py-2 text-sm border border-outline-variant/20 focus:border-primary outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-[10px] font-bold uppercase tracking-wider mb-1">Description</label>
              <textarea
                rows={3}
                value={product.description || ''}
                onChange={(e) => setProduct((p) => ({ ...p, description: e.target.value }))}
                className="w-full bg-surface-container-low px-4 py-2 text-sm border border-outline-variant/20 focus:border-primary outline-none resize-none"
              />
            </div>

            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={product.isMemberOnly || false}
                  onChange={(e) => setProduct((p) => ({ ...p, isMemberOnly: e.target.checked }))}
                />
                <span className="text-[10px] font-bold uppercase">Member Only</span>
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={product.isFullPrice !== false}
                  onChange={(e) => setProduct((p) => ({ ...p, isFullPrice: e.target.checked }))}
                />
                <span className="text-[10px] font-bold uppercase">Full Price</span>
              </label>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider mb-1">Status</label>
              <select
                value={product.status || 'active'}
                onChange={(e) => setProduct((p) => ({ ...p, status: e.target.value }))}
                className="w-full bg-surface-container-low px-4 py-2 text-sm border border-outline-variant/20 focus:border-primary outline-none"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* SKUs */}
        <section className="bg-surface-container-lowest border border-outline-variant/10 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-headline font-black text-lg uppercase italic">SKUs (Sizes & Stock)</h2>
            <button
              onClick={addSkuDraft}
              className="flex items-center gap-2 text-xs font-bold uppercase tracking-tight hover:text-primary transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add SKU
            </button>
          </div>

          {/* Existing SKUs */}
          {skus.length > 0 && (
            <div className="mb-6">
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-3">Existing</h3>
              <div className="space-y-2">
                {skus.map((sku) => (
                  <div
                    key={sku.id}
                    className="flex items-center gap-3 bg-surface-container-low px-4 py-3"
                  >
                    <span className="text-xs font-bold w-32 truncate">{sku.sku}</span>
                    <span className="text-xs text-on-surface-variant w-16">Size {sku.size}</span>
                    <span className="text-xs text-on-surface-variant w-20">{sku.color}</span>
                    <span className="text-xs font-bold ml-auto">{sku.stockQuantity} in stock</span>
                    <button
                      onClick={() => deleteExistingSku(sku.id)}
                      className="p-1 hover:bg-error-container text-error transition-colors cursor-pointer"
                      title="Delete SKU"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New SKU Drafts */}
          {skuDrafts.length > 0 && (
            <div>
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-3">New</h3>
              <div className="space-y-2">
                {skuDrafts.map((draft, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-6 gap-2 bg-surface-container-low px-4 py-3 items-center"
                  >
                    <input
                      type="text"
                      placeholder="SKU Code"
                      value={draft.sku || ''}
                      onChange={(e) => updateSkuDraft(idx, 'sku', e.target.value)}
                      className="bg-surface-container-highest px-2 py-1 text-xs border border-outline-variant/20 focus:border-primary outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Size"
                      value={draft.size || ''}
                      onChange={(e) => updateSkuDraft(idx, 'size', e.target.value)}
                      className="bg-surface-container-highest px-2 py-1 text-xs border border-outline-variant/20 focus:border-primary outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Color"
                      value={draft.color || ''}
                      onChange={(e) => updateSkuDraft(idx, 'color', e.target.value)}
                      className="bg-surface-container-highest px-2 py-1 text-xs border border-outline-variant/20 focus:border-primary outline-none"
                    />
                    <input
                      type="number"
                      placeholder="Stock"
                      min="0"
                      value={String(draft.stockQuantity ?? 0)}
                      onChange={(e) => updateSkuDraft(idx, 'stockQuantity', parseInt(e.target.value) || 0)}
                      className="bg-surface-container-highest px-2 py-1 text-xs border border-outline-variant/20 focus:border-primary outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Color Hex"
                      value={draft.colorHex || ''}
                      onChange={(e) => updateSkuDraft(idx, 'colorHex', e.target.value)}
                      className="bg-surface-container-highest px-2 py-1 text-xs border border-outline-variant/20 focus:border-primary outline-none"
                    />
                    <button
                      onClick={() => removeSkuDraft(idx)}
                      className="p-1 hover:bg-error-container text-error transition-colors cursor-pointer justify-self-end"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {skus.length === 0 && skuDrafts.length === 0 && (
            <div className="text-center py-8 text-on-surface-variant text-xs">
              No SKUs yet. Add at least one size/stock combination.
            </div>
          )}
        </section>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            onClick={() => navigate('/dashboard/products')}
            className="px-8 py-3 border border-outline-variant text-sm font-bold uppercase tracking-tight hover:bg-surface-container-high transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-8 py-3 bg-on-surface text-surface text-sm font-bold uppercase tracking-tight hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer flex items-center gap-2"
          >
            {saving && <Loader2 className="w-3 h-3 animate-spin" />}
            <Save className="w-4 h-4" />
            {isNew ? 'Create Product' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

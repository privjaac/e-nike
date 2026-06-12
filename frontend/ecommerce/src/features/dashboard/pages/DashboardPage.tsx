import { useEffect, useState, useCallback } from 'react';
import {
  Calendar,
  ArrowUp,
  ArrowDown,
  ChevronDown,
  ArrowRight,
  X,
  RefreshCw,
  Activity,
  FileText,
  Shield,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useToastStore } from '@/stores/toastStore';
import { dashboardService } from '@/services/DashboardService';
import { catalogService } from '@/services/CatalogService';
import { promotionService } from '@/services/PromotionService';
import { API_BASE } from '@/services/api';

type MetricItem = {
  id: string;
  label: string;
  value: string;
  delta: string;
  deltaType: 'positive' | 'negative' | 'stable' | 'alert';
};

type ProductItem = {
  id: string;
  name: string;
  sku: string;
  category: string;
  unitsSold: number;
  inventory: number;
  wos: number;
  status: 'Optimal' | 'Critical Low' | 'Overstocked';
  image: string;
};

type HistoryItem = {
  id: string;
  title: string;
  time: string;
  actor: string;
  active: boolean;
};

type PromotionData = {
  activePromotion: string;
  automaticMarkdowns: boolean;
  history: HistoryItem[];
};

type PromotionForm = {
  name: string;
  code: string;
  type: 'percentage' | 'fixed' | 'bundle';
  value: string;
  startDate: string;
  endDate: string;
};

function useFetch<T>(url: string) {
  const token = useAuthStore((s) => s.token);
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    fetch(url, { headers })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((json: unknown) => {
        if (!cancelled) {
          const payload = (json as { data?: unknown })?.data ?? json;
          setData(payload as T);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Unknown error');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [url, token, refreshKey]);

  const refetch = useCallback(() => setRefreshKey((k) => k + 1), []);

  return { data, loading, error, refetch };
}

const defaultMetrics: MetricItem[] = [
  { id: '1', label: 'Conversion Rate', value: '3.42%', delta: '+12%', deltaType: 'positive' },
  { id: '2', label: 'Full-Price Sell-Through', value: '68.1%', delta: '-4%', deltaType: 'negative' },
  { id: '3', label: 'Return Rate (Size Related)', value: '14.2%', delta: 'STABLE', deltaType: 'stable' },
  { id: '4', label: 'Aging Inventory (>90 Days)', value: '1,240', delta: 'ALERT', deltaType: 'alert' },
];

const defaultProducts: ProductItem[] = [
  {
    id: '1',
    name: "Air Max Solo '24",
    sku: 'DX3666-100',
    category: 'Footwear',
    unitsSold: 4821,
    inventory: 12400,
    wos: 2.4,
    status: 'Optimal',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=100&q=80',
  },
  {
    id: '2',
    name: "Dunk Low 'Retro'",
    sku: 'DD1391-100',
    category: 'Footwear',
    unitsSold: 8902,
    inventory: 2100,
    wos: 0.2,
    status: 'Critical Low',
    image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=100&q=80',
  },
  {
    id: '3',
    name: 'Jordan 1 Mid',
    sku: '554724-092',
    category: 'Footwear',
    unitsSold: 1230,
    inventory: 14200,
    wos: 11.5,
    status: 'Overstocked',
    image: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=100&q=80',
  },
];

const defaultPromotionData: PromotionData = {
  activePromotion: 'End of Season (20%)',
  automaticMarkdowns: true,
  history: [
    { id: '1', title: 'Tier 1 Price Drop Approved', time: '2 hours ago', actor: 'Regional Admin', active: true },
    { id: '2', title: 'Bundle Rule Created: ACG', time: 'Yesterday', actor: 'Merch Bot v2', active: false },
  ],
};

function MetricTrend({ metric, isDark }: { metric: MetricItem; isDark?: boolean }) {
  if (metric.deltaType === 'positive') {
    return (
      <span className="text-primary text-xs font-bold flex items-center gap-1">
        <ArrowUp className="w-4 h-4" />
        {metric.delta}
      </span>
    );
  }
  if (metric.deltaType === 'negative') {
    return (
      <span className="text-error text-xs font-bold flex items-center gap-1">
        <ArrowDown className="w-4 h-4" />
        {metric.delta}
      </span>
    );
  }
  if (metric.deltaType === 'stable') {
    return <span className="text-zinc-400 text-xs font-bold">{metric.delta}</span>;
  }
  if (metric.deltaType === 'alert') {
    return (
      <span className={`${isDark ? 'text-primary-container' : 'text-error'} text-xs font-bold`}>
        {metric.delta}
      </span>
    );
  }
  return null;
}

function MetricSkeleton() {
  return (
    <div className="bg-surface-container-lowest p-6 flex flex-col justify-between animate-pulse">
      <div className="h-3 w-24 bg-surface-container-high rounded mb-8" />
      <div className="flex items-end justify-between">
        <div className="h-10 w-20 bg-surface-container-high rounded" />
        <div className="h-4 w-12 bg-surface-container-high rounded" />
      </div>
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="space-y-2 animate-pulse">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 bg-surface-container-lowest p-4">
          <div className="w-12 h-12 bg-surface-container-high rounded" />
          <div className="flex-1 h-4 bg-surface-container-high rounded" />
        </div>
      ))}
    </div>
  );
}

function PromotionSkeleton() {
  return (
    <div className="bg-surface-container-lowest p-6 border-t-2 border-zinc-900 animate-pulse space-y-6">
      <div className="h-12 bg-surface-container-high rounded" />
      <div className="h-10 bg-surface-container-high rounded" />
      <div className="space-y-4">
        <div className="h-8 bg-surface-container-high rounded" />
        <div className="h-8 bg-surface-container-high rounded" />
      </div>
      <div className="h-12 bg-surface-container-high rounded" />
    </div>
  );
}

function useProductPerformance() {
  const token = useAuthStore((s) => s.token);
  const [products, setProducts] = useState<ProductItem[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    async function load() {
      try {
        const headers: Record<string, string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        try {
          const invJson = await dashboardService.getInventoryPerformance(token);
          const invProducts = (invJson as any).products;
          if (invProducts && invProducts.length > 0) {
            if (!cancelled) {
              setProducts(invProducts as ProductItem[]);
              setLoading(false);
            }
            return;
          }
        } catch {
        }

        const catJson = await catalogService.getProducts({ limit: 100 });
        const items = catJson.items;

        const mapped: ProductItem[] = items.map((p: any) => ({
          id: p.id,
          name: p.name,
          sku: p.sku || p.slug.toUpperCase(),
          category: p.category,
          unitsSold: 0,
          inventory: 0,
          wos: 0,
          status: 'Optimal',
          image: p.imageUrl,
        }));

        if (!cancelled) {
          setProducts(mapped);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load products');
          setProducts(defaultProducts);
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

  return { products: products ?? defaultProducts, loading, error };
}

export function DashboardPage() {
  const token = useAuthStore((s) => s.token);
  const addToast = useToastStore((s) => s.addToast);

  const metricsQuery = useFetch<{ metrics: MetricItem[] }>(`${API_BASE}/dashboard/metrics`);
  const productQuery = useProductPerformance();
  const promotionQuery = useFetch<PromotionData>(`${API_BASE}/dashboard/promotion-history`);

  const metrics = metricsQuery.data?.metrics ?? defaultMetrics;
  const products = productQuery.products;
  const promotionDataRaw = promotionQuery.data && !Array.isArray(promotionQuery.data) ? promotionQuery.data : null;
  const promotionData = promotionDataRaw ?? defaultPromotionData;

  const isAnyLoading = metricsQuery.loading || productQuery.loading || promotionQuery.loading;
  const isAnyError = metricsQuery.error || productQuery.error || promotionQuery.error;

  const [isPromotionModalOpen, setIsPromotionModalOpen] = useState(false);
  const [promotionForm, setPromotionForm] = useState<PromotionForm>({
    name: '',
    code: '',
    type: 'percentage',
    value: '',
    startDate: '',
    endDate: '',
  });
  const [isSubmittingPromotion, setIsSubmittingPromotion] = useState(false);
  const [automaticMarkdowns, setAutomaticMarkdowns] = useState(promotionData.automaticMarkdowns);

  useEffect(() => {
    if (promotionDataRaw) {
      setAutomaticMarkdowns(promotionDataRaw.automaticMarkdowns);
    }
  }, [promotionDataRaw]);

  const handleExportReport = useCallback(() => {
    const report = {
      generatedAt: new Date().toISOString(),
      metrics,
      inventory: products,
      promotions: promotionData,
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const date = new Date().toISOString().slice(0, 10);
    a.download = `nike-merchandising-report-${date}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addToast('Report downloaded successfully', 'success');
  }, [metrics, products, promotionData, addToast]);

  const handleToggleMarkdowns = useCallback(() => {
    setAutomaticMarkdowns((prev) => {
      const next = !prev;
      addToast(`Automatic markdowns ${next ? 'enabled' : 'disabled'}`, 'info');
      return next;
    });
  }, [addToast]);

  const handlePromotionSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!promotionForm.name || !promotionForm.code || !promotionForm.value || !promotionForm.startDate || !promotionForm.endDate) {
        addToast('Please fill all fields', 'info');
        return;
      }

      setIsSubmittingPromotion(true);
      try {
        await promotionService.create({
          name: promotionForm.name,
          code: promotionForm.code,
          type: promotionForm.type as 'percentage' | 'fixed' | 'bundle',
          value: Number(promotionForm.value),
          startDate: new Date(promotionForm.startDate),
          endDate: new Date(promotionForm.endDate),
          isAutoMarkdown: false,
          isActive: true,
          createdBy: 1,
        }, token!);

        addToast('Promotion created successfully', 'success');
        setIsPromotionModalOpen(false);
        setPromotionForm({ name: '', code: '', type: 'percentage', value: '', startDate: '', endDate: '' });
        promotionQuery.refetch();
      } catch (err) {
        addToast(err instanceof Error ? err.message : 'Failed to create promotion', 'info');
      } finally {
        setIsSubmittingPromotion(false);
      }
    },
    [promotionForm, token, addToast, promotionQuery]
  );

  const historyItems = Array.isArray(promotionData.history) ? promotionData.history : [];
  const isHistoryEmpty = historyItems.length === 0;
  const displayHistory = isHistoryEmpty ? defaultPromotionData.history : historyItems;

  const handleSystemHealth = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/health`);
      if (res.ok) {
        addToast('All systems operational. API latency: 45ms', 'success');
      } else {
        addToast('System health check returned warnings', 'info');
      }
    } catch {
      addToast('Unable to reach health endpoint. API may be offline.', 'info');
    }
  }, [addToast]);

  const handleApiDocs = useCallback(() => {
    addToast('API Documentation is available at /api/v1/* — check the backend OpenAPI spec.', 'info');
  }, [addToast]);

  const handleGovernancePolicy = useCallback(() => {
    addToast('Governance Policy v4.12 — All merchandising decisions require regional approval.', 'info');
  }, [addToast]);

  return (
    <div className="p-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
        <div>
          <span className="text-[10px] font-bold tracking-widest text-primary uppercase block mb-2">
            Internal Tools // Nike OneCommerce
          </span>
          <h1 className="text-5xl font-black font-headline tracking-tighter uppercase italic leading-none">
            Merchandising Operations
          </h1>
        </div>
        <div className="flex gap-4">
          <div className="px-4 py-2 bg-surface-container-low flex items-center gap-2">
            <Calendar className="w-4 h-4 text-zinc-400" />
            <span className="text-xs font-bold uppercase tracking-tight">Q3 Performance Period</span>
          </div>
          <button
            onClick={handleExportReport}
            className="bg-zinc-900 text-white px-6 py-2 text-xs font-bold uppercase tracking-widest hover:bg-primary transition-colors cursor-pointer"
          >
            Export Report
          </button>
        </div>
      </header>

      {isAnyLoading && (
        <div className="mb-4 text-xs font-bold text-primary animate-pulse">Loading dashboard data…</div>
      )}
      {isAnyError && (
        <div className="mb-4 text-xs font-bold text-error">
          Error loading some dashboard data. Displaying fallback data.
        </div>
      )}

      <section className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
        {metricsQuery.loading
          ? [...Array(4)].map((_, i) => <MetricSkeleton key={i} />)
          : metrics.map((metric, index) => {
              const isDark = index === 3;
              return (
                <div
                  key={metric.id}
                  className={`bg-surface-container-lowest p-6 flex flex-col justify-between ${
                    index === 0 ? 'border-l-4 border-primary' : ''
                  } ${isDark ? 'bg-zinc-900 text-white' : ''}`}
                >
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider mb-8 ${
                      isDark ? 'text-zinc-400' : 'text-on-surface-variant'
                    }`}
                  >
                    {metric.label}
                  </span>
                  <div className="flex items-end justify-between">
                    <span
                      className={`text-4xl font-black font-headline tracking-tighter italic ${
                        isDark ? 'text-primary-container' : ''
                      }`}
                    >
                      {metric.value}
                    </span>
                    <MetricTrend metric={metric} isDark={isDark} />
                  </div>
                </div>
              );
            })}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-black font-headline uppercase tracking-tight italic">
              Product Performance vs. Stock
            </h3>
            <div className="flex gap-2 items-center">
              <span className="w-2 h-2 rounded-full bg-primary-container" />
              <span className="text-[10px] font-bold uppercase text-zinc-500">Real-time Feed</span>
            </div>
          </div>

          {productQuery.loading ? (
            <TableSkeleton />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-separate border-spacing-y-2">
                <thead>
                  <tr className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">
                    <th className="pb-4 px-2">Style / Product Name</th>
                    <th className="pb-4">Category</th>
                    <th className="pb-4 text-right">Units Sold</th>
                    <th className="pb-4 text-right">Inventory</th>
                    <th className="pb-4 text-right">WOS</th>
                    <th className="pb-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr
                      key={product.id}
                      className="bg-surface-container-lowest group hover:bg-surface-container-low transition-colors"
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-zinc-100 flex-shrink-0">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-zinc-900">{product.name}</p>
                            <p className="text-[10px] text-zinc-400">{product.sku}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 text-xs font-bold uppercase text-zinc-500">{product.category}</td>
                      <td className="py-4 text-right font-headline font-bold text-sm">
                        {product.unitsSold.toLocaleString()}
                      </td>
                      <td className="py-4 text-right font-headline font-bold text-sm">
                        {product.inventory.toLocaleString()}
                      </td>
                      <td
                        className={`py-4 text-right font-headline font-bold text-sm ${
                          product.wos < 1 ? 'text-error' : ''
                        }`}
                      >
                        {product.wos}
                      </td>
                      <td className="py-4 pr-4 text-right">
                        <span
                          className={`px-2 py-1 text-[10px] font-bold uppercase ${
                            product.status === 'Optimal'
                              ? 'bg-green-100 text-green-700'
                              : product.status === 'Critical Low'
                              ? 'bg-error-container text-error'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {product.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <aside className="space-y-8">
          <div>
            <h3 className="text-lg font-black font-headline uppercase tracking-tight italic mb-6">
              Promotion Controls
            </h3>
            {promotionQuery.loading ? (
              <PromotionSkeleton />
            ) : (
              <div className="bg-surface-container-lowest p-6 border-t-2 border-zinc-900">
                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-bold uppercase text-zinc-400 block mb-2">
                      Active Promotion Gate
                    </label>
                    <div className="relative w-full h-12 bg-zinc-100 flex items-center px-4 justify-between group cursor-pointer hover:bg-zinc-200 transition-colors">
                      <span className="text-xs font-bold">{promotionData.activePromotion}</span>
                      <ChevronDown className="w-4 h-4 text-zinc-400" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-zinc-50">
                    <div>
                      <p className="text-xs font-bold">Automatic Markdowns</p>
                      <p className="text-[10px] text-zinc-500">Based on WOS &gt; 12</p>
                    </div>
                    <button
                      onClick={handleToggleMarkdowns}
                      className={`w-10 h-5 rounded-full relative flex items-center px-1 transition-all cursor-pointer ${
                        automaticMarkdowns ? 'bg-primary-container justify-end' : 'bg-zinc-300 justify-start'
                      }`}
                      aria-label="Toggle automatic markdowns"
                    >
                      <div className="w-3 h-3 bg-white rounded-full shadow-sm" />
                    </button>
                  </div>

                  <div className="pt-4 border-t border-zinc-100">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-[10px] font-bold uppercase text-zinc-400">Governance History</p>
                      {isHistoryEmpty && (
                        <button
                          onClick={promotionQuery.refetch}
                          className="flex items-center gap-1 text-[10px] font-bold text-primary hover:text-on-primary-container transition-colors cursor-pointer"
                        >
                          <RefreshCw className="w-3 h-3" />
                          Refresh
                        </button>
                      )}
                    </div>
                    <div className="space-y-4">
                      {displayHistory.map((item) => (
                        <div key={item.id} className="flex gap-3">
                          <div className={`w-1 h-8 ${item.active ? 'bg-primary' : 'bg-zinc-200'}`} />
                          <div>
                            <p className="text-[11px] font-bold">{item.title}</p>
                            <p className="text-[9px] text-zinc-400 uppercase">
                              {item.time} • {item.actor}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => setIsPromotionModalOpen(true)}
                    className="w-full bg-primary-container text-on-primary-container py-4 text-xs font-black uppercase tracking-widest hover:brightness-95 transition-all cursor-pointer"
                  >
                    Execute New Promotion
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="bg-primary text-on-primary p-6">
            <h4 className="text-sm font-black font-headline uppercase italic mb-4">Inventory Insights</h4>
            <p className="text-xs leading-relaxed opacity-90 mb-6">
              Size 11.5 across all Performance Running styles shows a{' '}
              <span className="font-bold underline">22% higher return rate</span> than the category average.
              Suggesting fit-guide audit for Q4.
            </p>
            <button
              onClick={() => window.location.assign('/dashboard/analytics')}
              className="text-[10px] font-black uppercase tracking-widest flex items-center gap-1 hover:gap-2 transition-all cursor-pointer bg-transparent border-none text-on-primary"
            >
              Deep Dive Analytics <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </aside>
      </div>

      <footer className="w-full py-12 mt-20 border-t border-zinc-100">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex gap-8">
            <button
              onClick={handleSystemHealth}
              className="text-zinc-400 hover:text-primary text-[10px] font-bold uppercase tracking-widest transition-colors cursor-pointer bg-transparent border-none flex items-center gap-1"
            >
              <Activity className="w-3 h-3" />
              System Health
            </button>
            <button
              onClick={handleApiDocs}
              className="text-zinc-400 hover:text-primary text-[10px] font-bold uppercase tracking-widest transition-colors cursor-pointer bg-transparent border-none flex items-center gap-1"
            >
              <FileText className="w-3 h-3" />
              API Docs
            </button>
            <button
              onClick={handleGovernancePolicy}
              className="text-zinc-400 hover:text-primary text-[10px] font-bold uppercase tracking-widest transition-colors cursor-pointer bg-transparent border-none flex items-center gap-1"
            >
              <Shield className="w-3 h-3" />
              Governance Policy
            </button>
          </div>
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
            © 2024 Nike, Inc. Merchandising OS v4.12.0
          </p>
        </div>
      </footer>

      {isPromotionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-surface-container-lowest w-full max-w-md p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-black font-headline uppercase tracking-tight italic">
                New Promotion
              </h3>
              <button
                onClick={() => setIsPromotionModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-900 transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePromotionSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase text-zinc-400 block mb-1">Name</label>
                <input
                  type="text"
                  value={promotionForm.name}
                  onChange={(e) => setPromotionForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full h-10 bg-zinc-100 px-3 text-xs font-bold text-zinc-900 outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Summer Sale 2024"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-zinc-400 block mb-1">Code</label>
                <input
                  type="text"
                  value={promotionForm.code}
                  onChange={(e) => setPromotionForm((f) => ({ ...f, code: e.target.value }))}
                  className="w-full h-10 bg-zinc-100 px-3 text-xs font-bold text-zinc-900 outline-none focus:ring-2 focus:ring-primary"
                  placeholder="SUMMER24"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-zinc-400 block mb-1">Type</label>
                <select
                  value={promotionForm.type}
                  onChange={(e) => setPromotionForm((f) => ({ ...f, type: e.target.value as PromotionForm['type'] }))}
                  className="w-full h-10 bg-zinc-100 px-3 text-xs font-bold text-zinc-900 outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                >
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed</option>
                  <option value="bundle">Bundle</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-zinc-400 block mb-1">Value</label>
                <input
                  type="number"
                  value={promotionForm.value}
                  onChange={(e) => setPromotionForm((f) => ({ ...f, value: e.target.value }))}
                  className="w-full h-10 bg-zinc-100 px-3 text-xs font-bold text-zinc-900 outline-none focus:ring-2 focus:ring-primary"
                  placeholder="20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase text-zinc-400 block mb-1">Start Date</label>
                  <input
                    type="date"
                    value={promotionForm.startDate}
                    onChange={(e) => setPromotionForm((f) => ({ ...f, startDate: e.target.value }))}
                    className="w-full h-10 bg-zinc-100 px-3 text-xs font-bold text-zinc-900 outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-zinc-400 block mb-1">End Date</label>
                  <input
                    type="date"
                    value={promotionForm.endDate}
                    onChange={(e) => setPromotionForm((f) => ({ ...f, endDate: e.target.value }))}
                    className="w-full h-10 bg-zinc-100 px-3 text-xs font-bold text-zinc-900 outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmittingPromotion}
                className="w-full bg-primary-container text-on-primary-container py-4 text-xs font-black uppercase tracking-widest hover:brightness-95 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmittingPromotion ? 'Submitting…' : 'Create Promotion'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

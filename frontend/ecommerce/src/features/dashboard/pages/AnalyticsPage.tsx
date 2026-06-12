import { useEffect, useState } from 'react';
import { BarChart3, AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { dashboardService } from '@/services/DashboardService';

interface MetricItem {
  id: string;
  label: string;
  value: string;
  delta: string;
  deltaType: 'positive' | 'negative' | 'stable' | 'alert';
}

interface BarData {
  label: string;
  value: number;
  max: number;
  unit?: string;
}

function SimpleBarChart({ title, data }: { title: string; data: BarData[] }) {
  return (
    <div className="bg-surface-container-lowest p-6">
      <h3 className="text-sm font-black font-headline uppercase tracking-tight italic mb-6">{title}</h3>
      <div className="space-y-4">
        {data.map((item) => {
          const pct = item.max > 0 ? (item.value / item.max) * 100 : 0;
          return (
            <div key={item.label} className="flex items-center gap-4">
              <span className="w-32 text-[10px] font-bold uppercase text-zinc-500 shrink-0 truncate">{item.label}</span>
              <div className="flex-1 h-6 bg-surface-container-high relative">
                <div
                  className="absolute top-0 left-0 h-full bg-primary-container transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="w-20 text-right text-xs font-bold font-headline">
                {item.value.toLocaleString()}
                {item.unit}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MetricCard({ label, value, delta, deltaType }: MetricItem) {
  const deltaColor =
    deltaType === 'positive'
      ? 'text-primary'
      : deltaType === 'negative'
      ? 'text-error'
      : deltaType === 'alert'
      ? 'text-error'
      : 'text-zinc-400';

  return (
    <div className="bg-surface-container-lowest p-6 flex flex-col justify-between">
      <span className="text-[10px] font-bold uppercase tracking-wider mb-4 text-on-surface-variant">{label}</span>
      <div className="flex items-end justify-between">
        <span className="text-3xl font-black font-headline tracking-tighter italic">{value}</span>
        <span className={`text-xs font-bold ${deltaColor}`}>{delta}</span>
      </div>
    </div>
  );
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

export function AnalyticsPage() {
  const token = useAuthStore((s) => s.token);
  const [metrics, setMetrics] = useState<MetricItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    async function load() {
      try {
        const json = await dashboardService.getMetrics(token);
        const data: MetricItem[] = [
          { id: '1', label: 'Total Orders', value: String(json.totalOrders), delta: 'STABLE', deltaType: 'stable' },
          { id: '2', label: 'Total Products', value: String(json.totalProducts), delta: 'STABLE', deltaType: 'stable' },
          { id: '3', label: 'Total Users', value: String(json.totalUsers), delta: 'STABLE', deltaType: 'stable' },
          { id: '4', label: 'Avg Order Value', value: `$${json.avgOrderValue.toFixed(2)}`, delta: 'STABLE', deltaType: 'stable' },
        ];
        if (!cancelled) setMetrics(data);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load metrics');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const performanceBars: BarData[] = metrics.map((m) => {
    const num = parseFloat(m.value.replace(/[^0-9.]/g, ''));
    const isPercentage = m.value.includes('%');
    const isCount = !isPercentage && num > 100;
    const max = isPercentage ? 100 : isCount ? Math.max(num, 5000) : 100;
    return {
      label: m.label,
      value: num || 0,
      max,
      unit: isPercentage ? '%' : '',
    };
  });

  const fallbackBars: BarData[] = [
    { label: 'Conversion Rate', value: 3.42, max: 10, unit: '%' },
    { label: 'Sell-Through', value: 68.1, max: 100, unit: '%' },
    { label: 'Return Rate', value: 14.2, max: 100, unit: '%' },
    { label: 'Aging Inventory', value: 1240, max: 5000, unit: '' },
  ];

  const barData = performanceBars.length > 0 ? performanceBars : fallbackBars;

  const conversionData: BarData[] = [
    { label: 'Jan', value: 2.8, max: 5, unit: '%' },
    { label: 'Feb', value: 3.1, max: 5, unit: '%' },
    { label: 'Mar', value: 2.9, max: 5, unit: '%' },
    { label: 'Apr', value: 3.4, max: 5, unit: '%' },
    { label: 'May', value: 3.2, max: 5, unit: '%' },
    { label: 'Jun', value: 3.8, max: 5, unit: '%' },
  ];

  const channelData: BarData[] = [
    { label: 'Direct Web', value: 58, max: 100, unit: '%' },
    { label: 'Mobile App', value: 28, max: 100, unit: '%' },
    { label: 'Marketplace', value: 10, max: 100, unit: '%' },
    { label: 'Retail POS', value: 4, max: 100, unit: '%' },
  ];

  return (
    <div className="p-8">
      <header className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <BarChart3 className="w-6 h-6 text-primary" />
          <h1 className="text-4xl font-black font-headline tracking-tighter uppercase italic leading-none">
            Analytics
          </h1>
        </div>
        <p className="text-xs text-on-surface-variant">Performance metrics and trends across the business.</p>
      </header>

      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
          {[...Array(4)].map((_, i) => (
            <MetricSkeleton key={i} />
          ))}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-error text-xs font-bold mb-4">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {!loading && !error && metrics.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
          {metrics.map((metric) => (
            <MetricCard key={metric.id} {...metric} />
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <SimpleBarChart title="Current Performance Metrics" data={barData} />
        <SimpleBarChart title="Conversion Rate over time" data={conversionData} />

        <div className="lg:col-span-2">
          <SimpleBarChart title="Channel Breakdown" data={channelData} />
        </div>

        <div className="bg-surface-container-lowest p-6">
          <h3 className="text-sm font-black font-headline uppercase tracking-tight italic mb-4">Key Metrics Summary</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-surface-container-high p-4">
              <p className="text-[10px] font-bold uppercase text-zinc-400 mb-1">Avg. Order Value</p>
              <p className="text-2xl font-black font-headline tracking-tighter">$142.50</p>
            </div>
            <div className="bg-surface-container-high p-4">
              <p className="text-[10px] font-bold uppercase text-zinc-400 mb-1">Customer Retention</p>
              <p className="text-2xl font-black font-headline tracking-tighter">34.2%</p>
            </div>
            <div className="bg-surface-container-high p-4">
              <p className="text-[10px] font-bold uppercase text-zinc-400 mb-1">Return Rate</p>
              <p className="text-2xl font-black font-headline tracking-tighter">8.4%</p>
            </div>
            <div className="bg-surface-container-high p-4">
              <p className="text-[10px] font-bold uppercase text-zinc-400 mb-1">Cart Abandonment</p>
              <p className="text-2xl font-black font-headline tracking-tighter">62.1%</p>
            </div>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-6">
          <h3 className="text-sm font-black font-headline uppercase tracking-tight italic mb-4">Insights</h3>
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="w-1 h-8 bg-primary" />
              <div>
                <p className="text-[11px] font-bold">Size 11.5 shows 22% higher return rate</p>
                <p className="text-[9px] text-zinc-400 uppercase">Performance Running category</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-1 h-8 bg-primary" />
              <div>
                <p className="text-[11px] font-bold">Aging inventory concentrated in apparel</p>
                <p className="text-[9px] text-zinc-400 uppercase">Q3 clearance recommended</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Truck, AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { orderService } from '@/services/OrderService';

interface Order {
  id: number;
  orderNumber: string;
  userId: number;
  status: string;
  totalAmount: number;
  createdAt: string;
}

export function OrdersPage() {
  const token = useAuthStore((s) => s.token);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await orderService.getAll(token);
        if (!cancelled) setOrders(data);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load orders');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString();
    } catch {
      return dateStr;
    }
  };

  const getUserName = (order: Order) => {
    return `User #${order.userId}`;
  };

  return (
    <div className="p-8">
      <header className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <Truck className="w-6 h-6 text-primary" />
          <h1 className="text-4xl font-black font-headline tracking-tighter uppercase italic leading-none">
            Orders
          </h1>
        </div>
        <p className="text-xs text-on-surface-variant">All customer orders and fulfillment status.</p>
      </header>

      {loading && (
        <div className="space-y-2 animate-pulse">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-surface-container-high rounded" />
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
                <th className="pb-4 px-2">Order #</th>
                <th className="pb-4">Customer</th>
                <th className="pb-4">Status</th>
                <th className="pb-4 text-right">Total</th>
                <th className="pb-4 text-right">Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-xs text-zinc-400 font-bold">
                    No orders found.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="bg-surface-container-lowest hover:bg-surface-container-low transition-colors">
                    <td className="py-4 px-4 text-xs font-bold text-zinc-900">{order.orderNumber}</td>
                    <td className="py-4 text-xs font-bold text-zinc-500">{getUserName(order)}</td>
                    <td className="py-4">
                      <span
                        className={`px-2 py-1 text-[10px] font-bold uppercase ${
                          order.status === 'completed' || order.status === 'delivered'
                            ? 'bg-green-100 text-green-700'
                            : order.status === 'pending' || order.status === 'processing'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-error-container text-error'
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="py-4 text-right font-headline font-bold text-sm">
                      ${order.totalAmount?.toFixed(2) ?? '0.00'}
                    </td>
                    <td className="py-4 pr-4 text-right text-xs font-bold text-zinc-500">
                      {formatDate(order.createdAt)}
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

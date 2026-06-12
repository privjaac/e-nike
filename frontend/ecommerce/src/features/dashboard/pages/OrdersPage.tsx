import { useEffect, useState, Fragment } from 'react';
import { Truck, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useToastStore } from '@/stores/toastStore';
import { orderService, type OrderWithItems } from '@/services/OrderService';

const STATUS_OPTIONS = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'] as const;

function statusBadge(status: string) {
  const map: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700',
    confirmed: 'bg-blue-100 text-blue-700',
    processing: 'bg-purple-100 text-purple-700',
    shipped: 'bg-indigo-100 text-indigo-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-error-container text-error',
    returned: 'bg-zinc-200 text-zinc-700',
  };
  return map[status] || 'bg-zinc-100 text-zinc-700';
}

export function OrdersPage() {
  const token = useAuthStore((s) => s.token);
  const addToast = useToastStore((s) => s.addToast);
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await orderService.getAll(token);
        const enriched = await Promise.all(
          data.map(async (o) => {
            try {
              const detail = await orderService.getById(o.id, token);
              return detail;
            } catch {
              return { ...o, items: [] };
            }
          })
        );
        if (!cancelled) setOrders(enriched);
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

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    if (!token) return;
    setUpdatingId(orderId);
    try {
      const updated = await orderService.updateStatus(orderId, newStatus, token);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: updated.status } : o)));
      addToast('Status updated', 'success');
    } catch {
      addToast('Failed to update status', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString();
    } catch {
      return dateStr;
    }
  };

  const getCustomer = (order: OrderWithItems) => {
    return order.userId ? `User #${order.userId}` : 'Guest';
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
                <th className="pb-4"></th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs text-zinc-400 font-bold">
                    No orders found.
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const isExpanded = expandedId === order.id;
                  return (
                    <Fragment key={order.id}>
                      <tr
                        className="bg-surface-container-lowest hover:bg-surface-container-low transition-colors cursor-pointer"
                        onClick={() => setExpandedId(isExpanded ? null : order.id)}
                      >
                        <td className="py-4 px-4 text-xs font-bold text-zinc-900">{order.orderNumber}</td>
                        <td className="py-4 text-xs font-bold text-zinc-500">{getCustomer(order)}</td>
                        <td className="py-4">
                          <select
                            value={order.status}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                            disabled={updatingId === order.id}
                            className={`text-[10px] font-bold uppercase px-2 py-1 border-none outline-none cursor-pointer ${statusBadge(order.status)}`}
                          >
                            {STATUS_OPTIONS.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-4 text-right font-headline font-bold text-sm">
                          ${order.totalAmount?.toFixed(2) ?? '0.00'}
                        </td>
                        <td className="py-4 pr-4 text-right text-xs font-bold text-zinc-500">
                          {formatDate(order.createdAt)}
                        </td>
                        <td className="py-4 pr-4">
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-zinc-400" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-zinc-400" />
                          )}
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr>
                          <td colSpan={6} className="px-4 pb-4">
                            <div className="bg-surface-container-low p-4 space-y-4">
                              <div>
                                <h4 className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-2">
                                  Items
                                </h4>
                                <div className="space-y-2">
                                  {order.items.length === 0 ? (
                                    <p className="text-xs text-zinc-500">No items recorded.</p>
                                  ) : (
                                    order.items.map((item) => (
                                      <div key={item.id} className="flex justify-between text-xs">
                                        <span className="text-zinc-700">
                                          {item.productName} ({item.skuCode}) — Size {item.size} / {item.color}
                                        </span>
                                        <span className="font-bold">
                                          {item.quantity} x ${item.unitPrice.toFixed(2)}
                                        </span>
                                      </div>
                                    ))
                                  )}
                                </div>
                              </div>
                              {order.shippingAddress && (
                                <div>
                                  <h4 className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-2">
                                    Shipping Address
                                  </h4>
                                  <p className="text-xs text-zinc-700">
                                    {order.shippingAddress.street}, {order.shippingAddress.city},{' '}
                                    {order.shippingAddress.state} {order.shippingAddress.zip}
                                  </p>
                                  <p className="text-xs text-zinc-700">{order.shippingAddress.country}</p>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

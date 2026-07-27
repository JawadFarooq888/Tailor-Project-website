import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import Loader from '../../components/common/Loader';
import { formatPrice } from '../../components/common/PriceTag';
import { inputClass } from '../../styles/ui';

const STATUSES = ['pending', 'processing', 'packed', 'shipped', 'delivered', 'cancelled', 'refunded'];

export default function AdminOrders() {
  const [result, setResult] = useState({ items: [], total: 0 });
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/orders', { params: { status: status || undefined, limit: 50 } });
      setResult(data);
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl text-ink">Orders</h1>
        <select className={`${inputClass} w-auto`} value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <Loader />
      ) : (
        <div className="mt-4 overflow-x-auto rounded-lg border border-taupe/20 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-ivory-dark text-xs uppercase text-taupe">
              <tr>
                <th className="px-4 py-3">Order #</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {result.items.map((o) => (
                <tr key={o._id} className="border-t border-taupe/10">
                  <td className="px-4 py-3 font-medium text-ink">{o.orderNumber}</td>
                  <td className="px-4 py-3">{o.customer?.name}</td>
                  <td className="px-4 py-3 text-taupe">{new Date(o.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">{formatPrice(o.grandTotal)}</td>
                  <td className="px-4 py-3 capitalize">{o.status}</td>
                  <td className="px-4 py-3 text-right">
                    <Link to={`/admin/orders/${o._id}`} className="text-xs text-burgundy hover:underline">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
              {result.items.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-taupe">
                    No orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

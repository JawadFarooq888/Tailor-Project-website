import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../api/client';
import Loader from '../../components/common/Loader';
import { formatPrice } from '../../components/common/PriceTag';
import { inputClass, btnPrimary } from '../../styles/ui';

const STATUSES = ['pending', 'processing', 'packed', 'shipped', 'delivered', 'cancelled', 'refunded'];

export default function AdminOrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () => api.get(`/orders/${id}`).then(({ data }) => {
    setOrder(data);
    setStatus(data.status);
  });

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const updateStatus = async () => {
    setSaving(true);
    try {
      await api.patch(`/orders/${id}/status`, { status });
      toast.success('Order status updated');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update status');
    } finally {
      setSaving(false);
    }
  };

  if (!order) return <Loader />;

  return (
    <div className="max-w-3xl">
      <Link to="/admin/orders" className="text-sm text-taupe hover:text-burgundy">
        ← Back to orders
      </Link>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl text-ink">{order.orderNumber}</h1>
        <div className="flex items-center gap-2">
          <select className={`${inputClass} w-auto`} value={status} onChange={(e) => setStatus(e.target.value)}>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <button onClick={updateStatus} disabled={saving || status === order.status} className={btnPrimary}>
            Update Status
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <div className="rounded-lg border border-taupe/20 bg-white p-4">
          <h2 className="font-medium text-ink">Customer</h2>
          <p className="mt-2 text-sm text-ink/80">{order.customer?.name}</p>
          <p className="text-sm text-ink/80">{order.customer?.email}</p>
        </div>
        <div className="rounded-lg border border-taupe/20 bg-white p-4">
          <h2 className="font-medium text-ink">Shipping Address</h2>
          <p className="mt-2 text-sm text-ink/80">
            {order.shippingAddress.fullName} · {order.shippingAddress.phone}
          </p>
          <p className="text-sm text-ink/80">
            {order.shippingAddress.street}, {order.shippingAddress.city} {order.shippingAddress.state}{' '}
            {order.shippingAddress.postalCode}, {order.shippingAddress.country}
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-lg border border-taupe/20 bg-white p-4">
        <h2 className="font-medium text-ink">Items</h2>
        <div className="mt-3 space-y-2">
          {order.items.map((i) => (
            <div key={i.product} className="flex justify-between border-b border-taupe/10 py-2 text-sm last:border-0">
              <span>
                {i.name} {i.size && `(${i.size}${i.color ? `, ${i.color}` : ''})`} × {i.quantity}
              </span>
              <span>{formatPrice(i.price * i.quantity)}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 space-y-1 border-t border-taupe/20 pt-3 text-sm">
          <div className="flex justify-between text-ink/80">
            <span>Items Total</span>
            <span>{formatPrice(order.itemsTotal)}</span>
          </div>
          <div className="flex justify-between text-ink/80">
            <span>Shipping</span>
            <span>{formatPrice(order.shippingFee)}</span>
          </div>
          <div className="flex justify-between font-semibold text-ink">
            <span>Grand Total</span>
            <span>{formatPrice(order.grandTotal)}</span>
          </div>
        </div>
        <p className="mt-2 text-xs text-taupe">
          Payment: {order.paymentMethod.replace('_', ' ')} · {order.paymentStatus}
          {order.stockRestored && ' · stock restored'}
        </p>
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/client';
import Loader from '../../components/common/Loader';
import { formatPrice } from '../../components/common/PriceTag';

export default function OrderConfirmation() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/orders/${id}`)
      .then(({ data }) => setOrder(data))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Loader />;
  if (!order) return <p className="py-16 text-center text-taupe">Order not found.</p>;

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gold text-2xl text-ink">✓</div>
      <h1 className="font-display text-2xl text-ink">Thank you for your order!</h1>
      <p className="mt-2 text-taupe">
        Order <span className="font-medium text-ink">{order.orderNumber}</span> has been placed successfully.
      </p>
      <div className="mt-8 rounded border border-taupe/20 bg-white p-5 text-left">
        {order.items.map((i) => (
          <div key={i.product} className="flex justify-between border-b border-taupe/10 py-2 text-sm last:border-0">
            <span>
              {i.name} × {i.quantity}
            </span>
            <span>{formatPrice(i.price * i.quantity)}</span>
          </div>
        ))}
        <div className="mt-2 flex justify-between font-semibold text-ink">
          <span>Total</span>
          <span>{formatPrice(order.grandTotal)}</span>
        </div>
      </div>
      <div className="mt-8 flex justify-center gap-4">
        <Link to="/dashboard" className="text-burgundy hover:underline">
          View my orders
        </Link>
        <Link to="/shop" className="text-burgundy hover:underline">
          Continue shopping
        </Link>
      </div>
    </div>
  );
}

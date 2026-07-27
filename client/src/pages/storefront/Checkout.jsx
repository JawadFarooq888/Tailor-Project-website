import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';
import { formatPrice } from '../../components/common/PriceTag';
import { inputClass, labelClass, btnPrimary } from '../../styles/ui';

const SHIPPING_FEE = 250;

export default function Checkout() {
  const { items, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [address, setAddress] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'Pakistan',
  });
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [placing, setPlacing] = useState(false);

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  const submit = async (e) => {
    e.preventDefault();
    setPlacing(true);
    try {
      const orderItems = items.map((i) => ({
        productId: i.product._id,
        quantity: i.quantity,
        size: i.size,
        color: i.color,
      }));
      const { data } = await api.post('/orders', {
        items: orderItems,
        shippingAddress: address,
        paymentMethod,
        shippingFee: SHIPPING_FEE,
      });
      await clearCart();
      toast.success('Order placed successfully!');
      navigate(`/order-confirmation/${data._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not place order');
    } finally {
      setPlacing(false);
    }
  };

  const grandTotal = subtotal + SHIPPING_FEE;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <h1 className="font-display text-2xl text-ink">Checkout</h1>
      <form onSubmit={submit} className="mt-6 grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <div className="rounded border border-taupe/20 bg-white p-5">
            <h2 className="font-medium text-ink">Shipping Address</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Full Name</label>
                <input required className={inputClass} value={address.fullName} onChange={(e) => setAddress((a) => ({ ...a, fullName: e.target.value }))} />
              </div>
              <div>
                <label className={labelClass}>Phone</label>
                <input required className={inputClass} value={address.phone} onChange={(e) => setAddress((a) => ({ ...a, phone: e.target.value }))} />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Street Address</label>
                <input required className={inputClass} value={address.street} onChange={(e) => setAddress((a) => ({ ...a, street: e.target.value }))} />
              </div>
              <div>
                <label className={labelClass}>City</label>
                <input required className={inputClass} value={address.city} onChange={(e) => setAddress((a) => ({ ...a, city: e.target.value }))} />
              </div>
              <div>
                <label className={labelClass}>State / Province</label>
                <input className={inputClass} value={address.state} onChange={(e) => setAddress((a) => ({ ...a, state: e.target.value }))} />
              </div>
              <div>
                <label className={labelClass}>Postal Code</label>
                <input className={inputClass} value={address.postalCode} onChange={(e) => setAddress((a) => ({ ...a, postalCode: e.target.value }))} />
              </div>
              <div>
                <label className={labelClass}>Country</label>
                <input className={inputClass} value={address.country} onChange={(e) => setAddress((a) => ({ ...a, country: e.target.value }))} />
              </div>
            </div>
          </div>

          <div className="rounded border border-taupe/20 bg-white p-5">
            <h2 className="font-medium text-ink">Payment Method</h2>
            <div className="mt-3 space-y-2">
              <label className="flex items-center gap-2 text-sm text-ink/80">
                <input type="radio" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} />
                Cash on Delivery
              </label>
              <label className="flex items-center gap-2 text-sm text-ink/80">
                <input type="radio" checked={paymentMethod === 'bank_transfer'} onChange={() => setPaymentMethod('bank_transfer')} />
                Bank Transfer (manual confirmation)
              </label>
            </div>
          </div>
        </div>

        <div className="h-fit rounded border border-taupe/20 bg-white p-5">
          <h2 className="font-medium text-ink">Order Summary</h2>
          <div className="mt-3 space-y-1 text-sm text-ink/80">
            {items.map((i) => (
              <div key={`${i.product._id}-${i.size}-${i.color}`} className="flex justify-between">
                <span className="truncate pr-2">
                  {i.product.name} × {i.quantity}
                </span>
                <span>{formatPrice(i.product.salePrice * i.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 space-y-1 border-t border-taupe/20 pt-3 text-sm">
            <div className="flex justify-between text-ink/80">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-ink/80">
              <span>Shipping</span>
              <span>{formatPrice(SHIPPING_FEE)}</span>
            </div>
            <div className="flex justify-between text-base font-semibold text-ink">
              <span>Total</span>
              <span>{formatPrice(grandTotal)}</span>
            </div>
          </div>
          <button type="submit" disabled={placing} className={`${btnPrimary} mt-4 w-full`}>
            {placing ? 'Placing Order...' : 'Place Order'}
          </button>
        </div>
      </form>
    </div>
  );
}

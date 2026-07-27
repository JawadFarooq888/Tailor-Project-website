import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { formatPrice } from '../../components/common/PriceTag';
import { btnPrimary } from '../../styles/ui';

export default function Cart() {
  const { items, updateQuantity, removeItem, subtotal, loading } = useCart();
  const navigate = useNavigate();

  if (loading) return null;

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="font-display text-2xl text-ink">Your cart is empty</h1>
        <Link to="/shop" className="mt-4 inline-block text-burgundy hover:underline">
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <h1 className="font-display text-2xl text-ink">Shopping Cart</h1>
      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          {items.map((item) => (
            <div key={`${item.product._id}-${item.size}-${item.color}`} className="flex gap-4 rounded border border-taupe/20 bg-white p-4">
              <div className="h-24 w-20 flex-shrink-0 overflow-hidden rounded bg-ivory-dark">
                {item.product.images?.[0] && (
                  <img src={item.product.images[0]} alt={item.product.name} className="h-full w-full object-cover" />
                )}
              </div>
              <div className="flex-1">
                <Link to={`/product/${item.product.slug}`} className="font-medium text-ink hover:text-burgundy">
                  {item.product.name}
                </Link>
                <p className="text-xs text-taupe">
                  {item.size && `Size: ${item.size}`} {item.color && `· Color: ${item.color}`}
                </p>
                <p className="mt-1 text-sm font-semibold text-ink">{formatPrice(item.product.salePrice)}</p>
                <div className="mt-2 flex items-center gap-3">
                  <input
                    type="number"
                    min={1}
                    max={item.product.stockQty}
                    value={item.quantity}
                    onChange={(e) => updateQuantity(item.product._id, Math.max(1, Number(e.target.value)))}
                    className="w-16 rounded border border-taupe/40 px-2 py-1 text-sm"
                  />
                  <button onClick={() => removeItem(item.product._id)} className="text-xs text-burgundy hover:underline">
                    Remove
                  </button>
                </div>
              </div>
              <p className="font-semibold text-ink">{formatPrice(item.product.salePrice * item.quantity)}</p>
            </div>
          ))}
        </div>

        <div className="h-fit rounded border border-taupe/20 bg-white p-5">
          <h2 className="font-medium text-ink">Order Summary</h2>
          <div className="mt-3 flex justify-between text-sm text-ink/80">
            <span>Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <p className="mt-1 text-xs text-taupe">Shipping calculated at checkout</p>
          <button onClick={() => navigate('/checkout')} className={`${btnPrimary} mt-4 w-full`}>
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
}

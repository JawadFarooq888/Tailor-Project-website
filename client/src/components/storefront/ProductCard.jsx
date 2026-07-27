import { Link } from 'react-router-dom';
import PriceTag from '../common/PriceTag';
import StarRating from '../common/StarRating';
import { useAuth } from '../../context/AuthContext';
import api, { resolveImageUrl } from '../../api/client';
import { useState } from 'react';

export default function ProductCard({ product, wishlist = [], onWishlistToggle }) {
  const { user } = useAuth();
  const [busy, setBusy] = useState(false);
  const isWished = wishlist.includes(product._id);
  const image = resolveImageUrl(product.images?.[0]);

  const toggleWishlist = async (e) => {
    e.preventDefault();
    if (!user) return;
    setBusy(true);
    try {
      await api.post('/wishlist/toggle', { productId: product._id });
      onWishlistToggle?.();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Link
      to={`/product/${product.slug}`}
      className="group block overflow-hidden rounded-lg border border-taupe/20 bg-white transition-shadow hover:shadow-lg"
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-ivory-dark">
        {image ? (
          <img
            src={image}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-taupe text-sm">No image</div>
        )}
        {product.discountPercent > 0 && (
          <span className="absolute left-2 top-2 rounded bg-burgundy px-2 py-0.5 text-xs font-semibold text-ivory">
            -{product.discountPercent}%
          </span>
        )}
        {product.stockQty === 0 && (
          <span className="absolute inset-x-0 bottom-0 bg-ink/80 py-1 text-center text-xs font-medium text-ivory">
            Out of stock
          </span>
        )}
        {user && (
          <button
            onClick={toggleWishlist}
            disabled={busy}
            className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-lg shadow"
            aria-label="Toggle wishlist"
          >
            <span className={isWished ? 'text-burgundy' : 'text-taupe'}>{isWished ? '♥' : '♡'}</span>
          </button>
        )}
      </div>
      <div className="p-3">
        <p className="text-xs uppercase tracking-wide text-taupe">{product.category?.name}</p>
        <h3 className="mt-1 truncate font-medium text-ink">{product.name}</h3>
        <div className="mt-1">
          <StarRating value={product.ratingAverage} count={product.ratingCount} />
        </div>
        <div className="mt-2">
          <PriceTag price={product.price} discountPercent={product.discountPercent} salePrice={product.salePrice} />
        </div>
      </div>
    </Link>
  );
}

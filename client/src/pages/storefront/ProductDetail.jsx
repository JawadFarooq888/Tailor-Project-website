import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api, { resolveImageUrl } from '../../api/client';
import Loader from '../../components/common/Loader';
import PriceTag from '../../components/common/PriceTag';
import StarRating from '../../components/common/StarRating';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { btnPrimary, btnOutline, inputClass, labelClass } from '../../styles/ui';

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [size, setSize] = useState('');
  const [color, setColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState([]);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    setLoading(true);
    api
      .get(`/products/${slug}`)
      .then(async ({ data }) => {
        setProduct(data);
        setSize(data.sizes?.[0] || '');
        setColor(data.colors?.[0] || '');
        setActiveImage(0);
        const reviewsRes = await api.get(`/reviews/product/${data._id}`);
        setReviews(reviewsRes.data);
      })
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleAddToCart = async () => {
    if (!user) {
      toast.error('Please login to add items to your cart');
      navigate('/login');
      return;
    }
    try {
      await addToCart(product._id, quantity, size, color);
      toast.success('Added to cart');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not add to cart');
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to write a review');
      return navigate('/login');
    }
    setSubmittingReview(true);
    try {
      await api.post('/reviews', { productId: product._id, ...reviewForm });
      toast.success('Review submitted — thanks!');
      setReviewForm({ rating: 5, comment: '' });
      const reviewsRes = await api.get(`/reviews/product/${product._id}`);
      setReviews(reviewsRes.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return <Loader />;
  if (!product) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="text-taupe">Product not found.</p>
        <Link to="/shop" className="mt-4 inline-block text-burgundy hover:underline">
          Back to shop
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="grid gap-10 lg:grid-cols-2">
        <div>
          <div className="aspect-[3/4] overflow-hidden rounded-lg bg-ivory-dark">
            {product.images?.[activeImage] ? (
              <img src={resolveImageUrl(product.images[activeImage])} alt={product.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-taupe">No image</div>
            )}
          </div>
          {product.images?.length > 1 && (
            <div className="mt-3 flex gap-2">
              {product.images.map((img, i) => (
                <button
                  key={img}
                  onClick={() => setActiveImage(i)}
                  className={`h-16 w-16 overflow-hidden rounded border ${
                    i === activeImage ? 'border-gold' : 'border-taupe/30'
                  }`}
                >
                  <img src={resolveImageUrl(img)} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="text-xs uppercase tracking-wide text-taupe">{product.category?.name}</p>
          <h1 className="mt-1 font-display text-2xl text-ink">{product.name}</h1>
          <div className="mt-2">
            <StarRating value={product.ratingAverage} count={product.ratingCount} />
          </div>
          <div className="mt-4">
            <PriceTag price={product.price} discountPercent={product.discountPercent} salePrice={product.salePrice} size="text-2xl" />
          </div>
          <p className="mt-4 text-sm leading-relaxed text-ink/80">{product.description}</p>

          <dl className="mt-4 grid grid-cols-2 gap-2 text-sm text-ink/70">
            {product.brand && (
              <div>
                <dt className="text-taupe">Brand</dt>
                <dd>{product.brand}</dd>
              </div>
            )}
            {product.fabric && (
              <div>
                <dt className="text-taupe">Fabric</dt>
                <dd>{product.fabric}</dd>
              </div>
            )}
            <div>
              <dt className="text-taupe">SKU</dt>
              <dd>{product.sku}</dd>
            </div>
            <div>
              <dt className="text-taupe">Availability</dt>
              <dd>{product.stockQty > 0 ? `${product.stockQty} in stock` : 'Out of stock'}</dd>
            </div>
          </dl>

          <div className="mt-6 space-y-4">
            {product.sizes?.length > 0 && (
              <div>
                <label className={labelClass}>Size</label>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSize(s)}
                      className={`rounded border px-3 py-1.5 text-sm ${
                        size === s ? 'border-ink bg-ink text-ivory' : 'border-taupe/40 text-ink'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {product.colors?.length > 0 && (
              <div>
                <label className={labelClass}>Color</label>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((c) => (
                    <button
                      key={c}
                      onClick={() => setColor(c)}
                      className={`rounded border px-3 py-1.5 text-sm ${
                        color === c ? 'border-ink bg-ink text-ivory' : 'border-taupe/40 text-ink'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="flex items-center gap-3">
              <label className={labelClass}>Quantity</label>
              <input
                type="number"
                min={1}
                max={product.stockQty}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                className={`${inputClass} w-20`}
              />
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button onClick={handleAddToCart} disabled={product.stockQty === 0} className={btnPrimary}>
              {product.stockQty === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
            <button
              onClick={async () => {
                if (!user) return navigate('/login');
                await api.post('/wishlist/toggle', { productId: product._id });
                toast.success('Wishlist updated');
              }}
              className={btnOutline}
            >
              ♡ Wishlist
            </button>
          </div>
        </div>
      </div>

      <section className="mt-16 max-w-3xl">
        <h2 className="font-display text-xl text-ink">Customer Reviews</h2>
        <div className="mt-4 space-y-4">
          {reviews.length === 0 && <p className="text-sm text-taupe">No reviews yet. Be the first to review this product.</p>}
          {reviews.map((r) => (
            <div key={r._id} className="rounded border border-taupe/20 bg-white p-4">
              <div className="flex items-center justify-between">
                <p className="font-medium text-ink">{r.customer?.name || 'Customer'}</p>
                <StarRating value={r.rating} />
              </div>
              {r.comment && <p className="mt-2 text-sm text-ink/80">{r.comment}</p>}
            </div>
          ))}
        </div>

        <form onSubmit={submitReview} className="mt-6 space-y-3 rounded border border-taupe/20 bg-white p-4">
          <p className="font-medium text-ink">Write a review</p>
          <div>
            <label className={labelClass}>Rating</label>
            <select
              className={inputClass}
              value={reviewForm.rating}
              onChange={(e) => setReviewForm((f) => ({ ...f, rating: Number(e.target.value) }))}
            >
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={n}>
                  {n} star{n > 1 ? 's' : ''}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Comment</label>
            <textarea
              className={inputClass}
              rows={3}
              value={reviewForm.comment}
              onChange={(e) => setReviewForm((f) => ({ ...f, comment: e.target.value }))}
            />
          </div>
          <button type="submit" disabled={submittingReview} className={btnPrimary}>
            Submit Review
          </button>
        </form>
      </section>
    </div>
  );
}

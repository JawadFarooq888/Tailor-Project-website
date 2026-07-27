import { useEffect, useState, useCallback } from 'react';
import api from '../../api/client';
import ProductCard from '../../components/storefront/ProductCard';
import Loader from '../../components/common/Loader';

export default function Wishlist() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/wishlist');
      setItems(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <Loader />;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="font-display text-2xl text-ink">My Wishlist</h1>
      {items.length === 0 ? (
        <p className="mt-6 text-taupe">Your wishlist is empty.</p>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((p) => (
            <ProductCard key={p._id} product={p} wishlist={items.map((i) => i._id)} onWishlistToggle={load} />
          ))}
        </div>
      )}
    </div>
  );
}

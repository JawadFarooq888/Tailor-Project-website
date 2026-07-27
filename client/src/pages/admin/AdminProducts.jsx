import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../api/client';
import Loader from '../../components/common/Loader';
import { formatPrice } from '../../components/common/PriceTag';
import { btnDark, inputClass } from '../../styles/ui';

export default function AdminProducts() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/products', { params: { admin: 'true', limit: 60, search: search || undefined } });
      setItems(data.items);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    load();
  }, [load]);

  const remove = async (id) => {
    if (!confirm('Delete this product? This cannot be undone.')) return;
    await api.delete(`/products/${id}`);
    toast.success('Product deleted');
    load();
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl text-ink">Products</h1>
        <Link to="/admin/products/new" className={btnDark}>
          + Add Product
        </Link>
      </div>

      <input
        placeholder="Search products..."
        className={`${inputClass} mt-4 max-w-sm`}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {loading ? (
        <Loader />
      ) : (
        <div className="mt-4 overflow-x-auto rounded-lg border border-taupe/20 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-ivory-dark text-xs uppercase text-taupe">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">SKU</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Featured</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((p) => (
                <tr key={p._id} className="border-t border-taupe/10">
                  <td className="flex items-center gap-3 px-4 py-3">
                    <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded bg-ivory-dark">
                      {p.images?.[0] && <img src={p.images[0]} alt="" className="h-full w-full object-cover" />}
                    </div>
                    <span className="font-medium text-ink">{p.name}</span>
                  </td>
                  <td className="px-4 py-3 text-taupe">{p.sku}</td>
                  <td className="px-4 py-3">{formatPrice(p.salePrice)}</td>
                  <td className={`px-4 py-3 ${p.stockQty <= p.lowStockThreshold ? 'font-semibold text-burgundy' : ''}`}>
                    {p.stockQty}
                  </td>
                  <td className="px-4 py-3 capitalize">{p.status}</td>
                  <td className="px-4 py-3">{p.isFeatured ? '★' : ''}</td>
                  <td className="px-4 py-3 text-right">
                    <Link to={`/admin/products/${p._id}`} className="mr-3 text-xs text-ink hover:text-burgundy">
                      Edit
                    </Link>
                    <button onClick={() => remove(p._id)} className="text-xs text-burgundy hover:underline">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-taupe">
                    No products found.
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

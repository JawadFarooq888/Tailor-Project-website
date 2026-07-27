import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../api/client';
import ProductCard from '../../components/storefront/ProductCard';
import Loader from '../../components/common/Loader';
import { inputClass, labelClass } from '../../styles/ui';

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const COLORS = ['Charcoal', 'Ivory', 'Burgundy', 'Navy', 'Black', 'White'];

export default function Shop() {
  const [params, setParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [result, setResult] = useState({ items: [], total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);

  const filters = {
    search: params.get('search') || '',
    category: params.get('category') || '',
    size: params.get('size') || '',
    color: params.get('color') || '',
    minPrice: params.get('minPrice') || '',
    maxPrice: params.get('maxPrice') || '',
    featured: params.get('featured') || '',
    sort: params.get('sort') || 'newest',
    page: params.get('page') || '1',
  };

  const updateFilter = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== 'page') next.delete('page');
    setParams(next);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/products', { params: { ...filters, limit: 12 } });
      setResult(data);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.toString()]);

  useEffect(() => {
    api.get('/categories').then((r) => setCategories(r.data));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="font-display text-2xl text-ink">Shop</h1>
      <div className="mt-6 grid gap-8 lg:grid-cols-[240px_1fr]">
        <aside className="space-y-6">
          <div>
            <label className={labelClass}>Category</label>
            <select className={inputClass} value={filters.category} onChange={(e) => updateFilter('category', e.target.value)}>
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Size</label>
            <select className={inputClass} value={filters.size} onChange={(e) => updateFilter('size', e.target.value)}>
              <option value="">Any Size</option>
              {SIZES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Color</label>
            <select className={inputClass} value={filters.color} onChange={(e) => updateFilter('color', e.target.value)}>
              <option value="">Any Color</option>
              {COLORS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Price Range (Rs.)</label>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Min"
                className={inputClass}
                value={filters.minPrice}
                onChange={(e) => updateFilter('minPrice', e.target.value)}
              />
              <input
                type="number"
                placeholder="Max"
                className={inputClass}
                value={filters.maxPrice}
                onChange={(e) => updateFilter('maxPrice', e.target.value)}
              />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-ink/80">
            <input
              type="checkbox"
              checked={filters.featured === 'true'}
              onChange={(e) => updateFilter('featured', e.target.checked ? 'true' : '')}
            />
            Featured only
          </label>
          <button
            className="text-sm text-burgundy hover:underline"
            onClick={() => setParams({})}
          >
            Clear filters
          </button>
        </aside>

        <div>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-taupe">{result.total} products</p>
            <select className={`${inputClass} w-auto`} value={filters.sort} onChange={(e) => updateFilter('sort', e.target.value)}>
              <option value="newest">Newest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="best_selling">Best Selling</option>
            </select>
          </div>

          {loading ? (
            <Loader />
          ) : result.items.length === 0 ? (
            <p className="py-16 text-center text-taupe">No products match your filters.</p>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {result.items.map((p) => (
                  <ProductCard key={p._id} product={p} />
                ))}
              </div>
              {result.pages > 1 && (
                <div className="mt-8 flex justify-center gap-2">
                  {Array.from({ length: result.pages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => updateFilter('page', String(p))}
                      className={`h-8 w-8 rounded text-sm ${
                        Number(filters.page) === p ? 'bg-ink text-ivory' : 'border border-taupe/30 text-ink'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

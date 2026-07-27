import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import ProductCard from '../../components/storefront/ProductCard';
import Loader from '../../components/common/Loader';

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [featuredRes, newRes, catRes] = await Promise.all([
          api.get('/products', { params: { featured: 'true', limit: 8 } }),
          api.get('/products', { params: { sort: 'newest', limit: 8 } }),
          api.get('/categories'),
        ]);
        setFeatured(featuredRes.data.items);
        setNewArrivals(newRes.data.items);
        setCategories(catRes.data);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div>
      <section className="bg-ink text-ivory">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24">
          <div>
            <p className="mb-3 text-sm uppercase tracking-[0.2em] text-gold">Bespoke &amp; Ready-to-Wear</p>
            <h1 className="font-display text-4xl font-semibold leading-tight sm:text-5xl">
              Tailored for you, <span className="text-gold">crafted to last</span>
            </h1>
            <p className="mt-4 max-w-md text-ivory/70">
              Discover premium fabrics and hand-finished tailoring — from formal suits to everyday essentials.
            </p>
            <div className="mt-8 flex gap-3">
              <Link to="/shop" className="inline-flex items-center justify-center rounded bg-gold px-4 py-2 text-sm font-semibold text-ink hover:bg-gold-light">
                Shop Collection
              </Link>
              <Link to="/about" className="inline-flex items-center justify-center rounded border border-ivory/40 px-4 py-2 text-sm font-semibold text-ivory hover:bg-ivory/10">
                Our Story
              </Link>
            </div>
          </div>
          <div className="hidden aspect-[4/3] overflow-hidden rounded-lg lg:block">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/6/62/Bocu_men_women_kids_fashion_apparelC.jpg"
              alt="Curated apparel display"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <h2 className="mb-5 font-display text-xl text-ink">Shop by Category</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {categories.slice(0, 8).map((c) => (
            <Link
              key={c._id}
              to={`/shop?category=${c._id}`}
              className="rounded-lg border border-taupe/20 bg-white p-6 text-center font-medium text-ink transition-shadow hover:shadow-md"
            >
              {c.name}
            </Link>
          ))}
        </div>
      </section>

      {loading ? (
        <Loader />
      ) : (
        <>
          <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-display text-xl text-ink">Featured Products</h2>
              <Link to="/shop?featured=true" className="text-sm font-medium text-burgundy hover:underline">
                View all
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {featured.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </section>

          <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-display text-xl text-ink">New Arrivals</h2>
              <Link to="/shop?sort=newest" className="text-sm font-medium text-burgundy hover:underline">
                View all
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {newArrivals.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

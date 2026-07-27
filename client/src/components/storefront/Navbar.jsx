import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

const NAV_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Shop', to: '/shop' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  const submitSearch = (e) => {
    e.preventDefault();
    navigate(`/shop?search=${encodeURIComponent(search)}`);
    setMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-taupe/20 bg-ivory/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link to="/" className="font-display text-xl font-semibold tracking-wide text-ink">
          Tailor <span className="text-gold">Boutique</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map((l) => (
            <Link key={l.to} to={l.to} className="text-sm font-medium text-ink/80 hover:text-burgundy">
              {l.label}
            </Link>
          ))}
        </nav>

        <form onSubmit={submitSearch} className="hidden flex-1 max-w-xs items-center md:flex">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full rounded-l border border-taupe/40 bg-white px-3 py-1.5 text-sm outline-none focus:border-gold"
          />
          <button type="submit" className="rounded-r bg-ink px-3 py-1.5 text-sm text-ivory hover:bg-ink-light">
            Search
          </button>
        </form>

        <div className="flex items-center gap-4">
          <Link to="/wishlist" className="text-sm text-ink/80 hover:text-burgundy" title="Wishlist">
            ♥
          </Link>
          <Link to="/cart" className="relative text-sm text-ink/80 hover:text-burgundy" title="Cart">
            🛍
            {count > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-burgundy text-[10px] text-ivory">
                {count}
              </span>
            )}
          </Link>
          {user ? (
            <div className="hidden items-center gap-3 md:flex">
              <Link to="/dashboard" className="text-sm font-medium text-ink hover:text-burgundy">
                {user.name.split(' ')[0]}
              </Link>
              <button onClick={logout} className="text-sm text-taupe hover:text-burgundy">
                Logout
              </button>
            </div>
          ) : (
            <Link to="/login" className="hidden rounded bg-ink px-3 py-1.5 text-sm text-ivory hover:bg-ink-light md:block">
              Login
            </Link>
          )}
          <button className="md:hidden" onClick={() => setMenuOpen((v) => !v)} aria-label="Toggle menu">
            ☰
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="border-t border-taupe/20 bg-ivory px-4 py-3 md:hidden">
          <form onSubmit={submitSearch} className="mb-3 flex">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="w-full rounded-l border border-taupe/40 bg-white px-3 py-1.5 text-sm outline-none"
            />
            <button type="submit" className="rounded-r bg-ink px-3 py-1.5 text-sm text-ivory">
              Go
            </button>
          </form>
          <div className="flex flex-col gap-2">
            {NAV_LINKS.map((l) => (
              <Link key={l.to} to={l.to} className="py-1 text-sm font-medium text-ink" onClick={() => setMenuOpen(false)}>
                {l.label}
              </Link>
            ))}
            {user ? (
              <>
                <Link to="/dashboard" className="py-1 text-sm font-medium text-ink" onClick={() => setMenuOpen(false)}>
                  My Dashboard
                </Link>
                <button onClick={logout} className="py-1 text-left text-sm text-taupe">
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login" className="py-1 text-sm font-medium text-burgundy" onClick={() => setMenuOpen(false)}>
                Login / Register
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

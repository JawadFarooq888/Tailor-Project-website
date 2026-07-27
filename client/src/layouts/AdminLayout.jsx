import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LINKS = [
  { to: '/admin', label: 'Dashboard', end: true, icon: '📊' },
  { to: '/admin/products', label: 'Products', icon: '👗' },
  { to: '/admin/inventory', label: 'Inventory', icon: '📋' },
  { to: '/admin/categories', label: 'Categories', icon: '🗂' },
  { to: '/admin/orders', label: 'Orders', icon: '📦' },
  { to: '/admin/customers', label: 'Customers', icon: '👥' },
  { to: '/admin/reviews', label: 'Reviews', icon: '⭐' },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  return (
    <div className="flex min-h-screen bg-ivory-dark">
      <aside className="hidden w-64 flex-col bg-ink text-ivory md:flex">
        <div className="border-b border-ivory/10 px-6 py-5">
          <p className="font-display text-lg text-gold">Tailor Boutique</p>
          <p className="text-xs text-ivory/60">Admin Panel</p>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-4">
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded px-3 py-2 text-sm font-medium transition-colors ${
                  isActive ? 'bg-gold text-ink' : 'text-ivory/80 hover:bg-ink-light'
                }`
              }
            >
              <span>{l.icon}</span>
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-ivory/10 px-4 py-4">
          <p className="truncate text-sm text-ivory/80">{user?.name}</p>
          <button onClick={handleLogout} className="mt-2 text-xs text-taupe hover:text-gold">
            Logout
          </button>
        </div>
      </aside>
      <div className="flex-1">
        <header className="flex items-center justify-between border-b border-taupe/20 bg-white px-4 py-3 md:hidden">
          <p className="font-display text-lg text-ink">Admin Panel</p>
          <button onClick={handleLogout} className="text-sm text-burgundy">
            Logout
          </button>
        </header>
        <main className="p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

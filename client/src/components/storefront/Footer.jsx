import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-taupe/20 bg-ink text-ivory">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
        <div>
          <h3 className="font-display text-lg text-gold">Tailor Boutique</h3>
          <p className="mt-3 text-sm text-ivory/70">
            Bespoke and ready-to-wear clothing, crafted with premium fabric and finished by hand.
          </p>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gold">Shop</h4>
          <ul className="space-y-2 text-sm text-ivory/70">
            <li><Link to="/shop" className="hover:text-gold">All Products</Link></li>
            <li><Link to="/shop?featured=true" className="hover:text-gold">Featured</Link></li>
            <li><Link to="/shop?sort=newest" className="hover:text-gold">New Arrivals</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gold">Account</h4>
          <ul className="space-y-2 text-sm text-ivory/70">
            <li><Link to="/dashboard" className="hover:text-gold">My Dashboard</Link></li>
            <li><Link to="/wishlist" className="hover:text-gold">Wishlist</Link></li>
            <li><Link to="/cart" className="hover:text-gold">Cart</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gold">Company</h4>
          <ul className="space-y-2 text-sm text-ivory/70">
            <li><Link to="/about" className="hover:text-gold">About Us</Link></li>
            <li><Link to="/contact" className="hover:text-gold">Contact</Link></li>
            <li><Link to="/admin/login" className="hover:text-gold">Admin Login</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-ivory/10 py-4 text-center text-xs text-ivory/50">
        © {new Date().getFullYear()} Tailor Boutique. All rights reserved.
      </div>
    </footer>
  );
}

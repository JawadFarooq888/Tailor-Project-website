import { Outlet } from 'react-router-dom';
import Navbar from '../components/storefront/Navbar';
import Footer from '../components/storefront/Footer';

export default function StorefrontLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-ivory text-ink">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

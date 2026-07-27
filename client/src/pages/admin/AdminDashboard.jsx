import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import api from '../../api/client';
import Loader from '../../components/common/Loader';
import StatCard from '../../components/admin/StatCard';
import { formatPrice } from '../../components/common/PriceTag';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/dashboard').then(({ data }) => setStats(data));
  }, []);

  if (!stats) return <Loader />;

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl text-ink">Dashboard</h1>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Revenue" value={formatPrice(stats.revenue)} sub={`${formatPrice(stats.monthlyRevenue)} this month`} accent="burgundy" />
        <StatCard label="Total Orders" value={stats.totalOrders} sub={`${stats.pendingOrders} pending`} />
        <StatCard label="Completed Orders" value={stats.completedOrders} accent="ink" />
        <StatCard label="Customers" value={stats.customersCount} />
        <StatCard label="Low Stock Products" value={stats.lowStockCount} accent="burgundy" />
        <StatCard label="Out of Stock" value={stats.outOfStockCount} accent="burgundy" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="rounded-lg border border-taupe/20 bg-white p-5">
          <h2 className="mb-4 font-medium text-ink">Monthly Sales (last 6 months)</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={stats.monthlySales}>
              <CartesianGrid strokeDasharray="3 3" stroke="#a79a8730" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#a79a87' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#a79a87' }} axisLine={false} tickLine={false} width={70} tickFormatter={(v) => `Rs.${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => formatPrice(v)} contentStyle={{ borderRadius: 8, border: '1px solid #a79a8740', fontSize: 12 }} />
              <Bar dataKey="total" name="Revenue" fill="#7a2e2e" radius={[4, 4, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-lg border border-taupe/20 bg-white p-5">
          <h2 className="mb-4 font-medium text-ink">Best Sellers</h2>
          <ul className="space-y-3">
            {stats.bestSellers.length === 0 && <p className="text-sm text-taupe">No sales yet.</p>}
            {stats.bestSellers.map((p) => (
              <li key={p._id} className="flex justify-between text-sm">
                <span className="truncate pr-2 text-ink/80">{p.name}</span>
                <span className="font-medium text-ink">{p.unitsSold} sold</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-taupe/20 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-medium text-ink">Recent Orders</h2>
            <Link to="/admin/orders" className="text-xs text-burgundy hover:underline">View all</Link>
          </div>
          <div className="space-y-2">
            {stats.recentOrders.map((o) => (
              <div key={o._id} className="flex items-center justify-between border-b border-taupe/10 py-2 text-sm last:border-0">
                <div>
                  <p className="font-medium text-ink">{o.orderNumber}</p>
                  <p className="text-xs text-taupe">{o.customer?.name}</p>
                </div>
                <span className="capitalize text-taupe">{o.status}</span>
                <span className="font-medium text-ink">{formatPrice(o.grandTotal)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-taupe/20 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-medium text-ink">Low Stock Alerts</h2>
            <Link to="/admin/products" className="text-xs text-burgundy hover:underline">Manage products</Link>
          </div>
          <div className="space-y-2">
            {stats.lowStockProducts.length === 0 && <p className="text-sm text-taupe">All products are well stocked.</p>}
            {stats.lowStockProducts.map((p) => (
              <div key={p._id} className="flex items-center justify-between border-b border-taupe/10 py-2 text-sm last:border-0">
                <span className="text-ink/80">{p.name}</span>
                <span className={`font-medium ${p.stockQty === 0 ? 'text-burgundy' : 'text-ink'}`}>
                  {p.stockQty} left
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

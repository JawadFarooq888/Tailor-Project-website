import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import Loader from '../../components/common/Loader';
import { formatPrice } from '../../components/common/PriceTag';
import { inputClass, labelClass, btnPrimary, btnOutline } from '../../styles/ui';

const STATUS_STYLES = {
  pending: 'bg-taupe/20 text-ink',
  processing: 'bg-gold/30 text-ink',
  packed: 'bg-gold/30 text-ink',
  shipped: 'bg-ink/10 text-ink',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  refunded: 'bg-red-100 text-red-800',
};

const TABS = ['Orders', 'Profile', 'Addresses'];

export default function Dashboard() {
  const { user, setUser, refresh } = useAuth();
  const [tab, setTab] = useState('Orders');
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [profile, setProfile] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [newAddress, setNewAddress] = useState({ label: 'Home', fullName: '', phone: '', street: '', city: '', state: '', postalCode: '', country: 'Pakistan', isDefault: false });

  useEffect(() => {
    api
      .get('/orders/mine')
      .then(({ data }) => setOrders(data))
      .finally(() => setLoadingOrders(false));
  }, []);

  const saveProfile = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.patch('/auth/me', profile);
      setUser(data);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  const addAddress = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/me/addresses', newAddress);
      await refresh();
      toast.success('Address added');
      setNewAddress({ label: 'Home', fullName: '', phone: '', street: '', city: '', state: '', postalCode: '', country: 'Pakistan', isDefault: false });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not add address');
    }
  };

  const removeAddress = async (id) => {
    await api.delete(`/auth/me/addresses/${id}`);
    await refresh();
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <h1 className="font-display text-2xl text-ink">My Dashboard</h1>
      <p className="text-sm text-taupe">Welcome back, {user?.name}</p>

      <div className="mt-6 flex gap-2 border-b border-taupe/20">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium ${tab === t ? 'border-b-2 border-gold text-ink' : 'text-taupe'}`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'Orders' &&
        (loadingOrders ? (
          <Loader />
        ) : orders.length === 0 ? (
          <p className="mt-6 text-taupe">
            No orders yet. <Link to="/shop" className="text-burgundy hover:underline">Start shopping</Link>
          </p>
        ) : (
          <div className="mt-6 space-y-3">
            {orders.map((o) => (
              <div key={o._id} className="rounded border border-taupe/20 bg-white p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-medium text-ink">{o.orderNumber}</p>
                    <p className="text-xs text-taupe">{new Date(o.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${STATUS_STYLES[o.status]}`}>
                    {o.status}
                  </span>
                  <p className="font-semibold text-ink">{formatPrice(o.grandTotal)}</p>
                </div>
                <div className="mt-2 text-sm text-ink/70">
                  {o.items.map((i) => `${i.name} × ${i.quantity}`).join(', ')}
                </div>
              </div>
            ))}
          </div>
        ))}

      {tab === 'Profile' && (
        <form onSubmit={saveProfile} className="mt-6 max-w-md space-y-4">
          <div>
            <label className={labelClass}>Full Name</label>
            <input className={inputClass} value={profile.name} onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))} />
          </div>
          <div>
            <label className={labelClass}>Phone</label>
            <input className={inputClass} value={profile.phone} onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))} />
          </div>
          <div>
            <label className={labelClass}>Email</label>
            <input className={inputClass} value={user?.email} disabled />
          </div>
          <button type="submit" className={btnPrimary}>
            Save Changes
          </button>
        </form>
      )}

      {tab === 'Addresses' && (
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="space-y-3">
            {(user?.addresses || []).length === 0 && <p className="text-taupe">No saved addresses.</p>}
            {(user?.addresses || []).map((a) => (
              <div key={a._id} className="rounded border border-taupe/20 bg-white p-4">
                <p className="font-medium text-ink">
                  {a.label} {a.isDefault && <span className="text-xs text-gold">(default)</span>}
                </p>
                <p className="text-sm text-ink/70">{a.fullName} · {a.phone}</p>
                <p className="text-sm text-ink/70">{a.street}, {a.city} {a.state} {a.postalCode}, {a.country}</p>
                <button onClick={() => removeAddress(a._id)} className="mt-2 text-xs text-burgundy hover:underline">
                  Remove
                </button>
              </div>
            ))}
          </div>
          <form onSubmit={addAddress} className="space-y-3 rounded border border-taupe/20 bg-white p-4">
            <p className="font-medium text-ink">Add New Address</p>
            <input required placeholder="Label (Home, Office)" className={inputClass} value={newAddress.label} onChange={(e) => setNewAddress((a) => ({ ...a, label: e.target.value }))} />
            <input required placeholder="Full Name" className={inputClass} value={newAddress.fullName} onChange={(e) => setNewAddress((a) => ({ ...a, fullName: e.target.value }))} />
            <input required placeholder="Phone" className={inputClass} value={newAddress.phone} onChange={(e) => setNewAddress((a) => ({ ...a, phone: e.target.value }))} />
            <input required placeholder="Street Address" className={inputClass} value={newAddress.street} onChange={(e) => setNewAddress((a) => ({ ...a, street: e.target.value }))} />
            <div className="grid grid-cols-2 gap-2">
              <input required placeholder="City" className={inputClass} value={newAddress.city} onChange={(e) => setNewAddress((a) => ({ ...a, city: e.target.value }))} />
              <input placeholder="Postal Code" className={inputClass} value={newAddress.postalCode} onChange={(e) => setNewAddress((a) => ({ ...a, postalCode: e.target.value }))} />
            </div>
            <label className="flex items-center gap-2 text-sm text-ink/80">
              <input type="checkbox" checked={newAddress.isDefault} onChange={(e) => setNewAddress((a) => ({ ...a, isDefault: e.target.checked }))} />
              Set as default
            </label>
            <button type="submit" className={btnOutline}>
              Add Address
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

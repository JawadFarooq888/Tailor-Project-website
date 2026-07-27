import { useEffect, useState, useCallback } from 'react';
import api from '../../api/client';
import Loader from '../../components/common/Loader';
import { inputClass } from '../../styles/ui';

export default function AdminCustomers() {
  const [result, setResult] = useState({ items: [], total: 0 });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/customers', { params: { search: search || undefined, limit: 50 } });
      setResult(data);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    load();
  }, [load]);

  const toggleActive = async (c) => {
    await api.patch(`/customers/${c._id}/active`, { isActive: !c.isActive });
    load();
  };

  return (
    <div>
      <h1 className="font-display text-2xl text-ink">Customers</h1>
      <input
        placeholder="Search by name or email..."
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
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Joined</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {result.items.map((c) => (
                <tr key={c._id} className="border-t border-taupe/10">
                  <td className="px-4 py-3 font-medium text-ink">{c.name}</td>
                  <td className="px-4 py-3 text-taupe">{c.email}</td>
                  <td className="px-4 py-3 text-taupe">{c.phone}</td>
                  <td className="px-4 py-3 text-taupe">{new Date(c.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleActive(c)} className={c.isActive ? 'text-green-700' : 'text-burgundy'}>
                      {c.isActive ? 'Active' : 'Deactivated'}
                    </button>
                  </td>
                </tr>
              ))}
              {result.items.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-taupe">
                    No customers found.
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

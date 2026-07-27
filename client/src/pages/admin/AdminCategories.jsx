import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/client';
import Loader from '../../components/common/Loader';
import { inputClass, labelClass, btnPrimary } from '../../styles/ui';

export default function AdminCategories() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', description: '' });
  const [editingId, setEditingId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/categories', { params: { all: 'true' } });
      setItems(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const submit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.patch(`/categories/${editingId}`, form);
        toast.success('Category updated');
      } else {
        await api.post('/categories', form);
        toast.success('Category created');
      }
      setForm({ name: '', description: '' });
      setEditingId(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not save category');
    }
  };

  const edit = (c) => {
    setEditingId(c._id);
    setForm({ name: c.name, description: c.description || '' });
  };

  const remove = async (id) => {
    if (!confirm('Delete this category?')) return;
    await api.delete(`/categories/${id}`);
    toast.success('Category deleted');
    load();
  };

  const toggleActive = async (c) => {
    await api.patch(`/categories/${c._id}`, { isActive: !c.isActive });
    load();
  };

  return (
    <div>
      <h1 className="font-display text-2xl text-ink">Categories</h1>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        {loading ? (
          <Loader />
        ) : (
          <div className="overflow-x-auto rounded-lg border border-taupe/20 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="bg-ivory-dark text-xs uppercase text-taupe">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {items.map((c) => (
                  <tr key={c._id} className="border-t border-taupe/10">
                    <td className="px-4 py-3 font-medium text-ink">{c.name}</td>
                    <td className="px-4 py-3 text-taupe">{c.description}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleActive(c)} className={c.isActive ? 'text-green-700' : 'text-taupe'}>
                        {c.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => edit(c)} className="mr-3 text-xs text-ink hover:text-burgundy">
                        Edit
                      </button>
                      <button onClick={() => remove(c._id)} className="text-xs text-burgundy hover:underline">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <form onSubmit={submit} className="h-fit space-y-3 rounded-lg border border-taupe/20 bg-white p-4">
          <p className="font-medium text-ink">{editingId ? 'Edit Category' : 'Add Category'}</p>
          <div>
            <label className={labelClass}>Name</label>
            <input required className={inputClass} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <label className={labelClass}>Description</label>
            <textarea className={inputClass} rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          </div>
          <div className="flex gap-2">
            <button type="submit" className={btnPrimary}>
              {editingId ? 'Update' : 'Add'}
            </button>
            {editingId && (
              <button
                type="button"
                className="text-sm text-taupe hover:underline"
                onClick={() => {
                  setEditingId(null);
                  setForm({ name: '', description: '' });
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

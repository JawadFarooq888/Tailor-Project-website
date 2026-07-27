import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/client';
import Loader from '../../components/common/Loader';
import { inputClass, labelClass, btnPrimary, btnOutline } from '../../styles/ui';

const REASONS = {
  in: [
    { value: 'restock', label: 'Restock' },
    { value: 'purchase_received', label: 'Purchase Received' },
    { value: 'customer_return', label: 'Customer Return' },
    { value: 'other', label: 'Other' },
  ],
  out: [
    { value: 'damaged', label: 'Damaged / Defective' },
    { value: 'lost', label: 'Lost / Missing' },
    { value: 'sample_given', label: 'Sample Given' },
    { value: 'other', label: 'Other' },
  ],
  correction: [
    { value: 'stock_count_correction', label: 'Stock Count Correction' },
    { value: 'other', label: 'Other' },
  ],
};

const STATUS_BADGE = {
  in_stock: 'bg-green-100 text-green-800',
  low_stock: 'bg-gold/30 text-ink',
  out_of_stock: 'bg-red-100 text-red-800',
};
const STATUS_LABEL = { in_stock: 'In Stock', low_stock: 'Low Stock', out_of_stock: 'Out of Stock' };

function AdjustStockModal({ product, onClose, onSaved }) {
  const [type, setType] = useState('in');
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState(REASONS.in[0].value);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const changeType = (t) => {
    setType(t);
    setReason(REASONS[t][0].value);
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post(`/inventory/${product._id}/adjust`, { type, quantity: Number(quantity), reason, note });
      toast.success('Stock updated');
      onSaved();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update stock');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <h2 className="font-display text-lg text-ink">Adjust Stock — {product.name}</h2>
        <p className="mt-1 text-sm text-taupe">Current stock: {product.stockQty}</p>

        <form onSubmit={submit} className="mt-4 space-y-4">
          <div>
            <label className={labelClass}>Adjustment Type</label>
            <div className="flex gap-2">
              {[
                { value: 'in', label: 'Stock In' },
                { value: 'out', label: 'Stock Out' },
                { value: 'correction', label: 'Correction' },
              ].map((t) => (
                <button
                  type="button"
                  key={t.value}
                  onClick={() => changeType(t.value)}
                  className={`flex-1 rounded border px-3 py-1.5 text-sm ${
                    type === t.value ? 'border-ink bg-ink text-ivory' : 'border-taupe/40 text-ink'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className={labelClass}>
              {type === 'correction' ? 'New Stock Count' : type === 'in' ? 'Quantity to Add' : 'Quantity to Remove'}
            </label>
            <input
              type="number"
              min={0}
              required
              className={inputClass}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </div>

          <div>
            <label className={labelClass}>Reason</label>
            <select className={inputClass} value={reason} onChange={(e) => setReason(e.target.value)}>
              {REASONS[type].map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>Note (optional)</label>
            <textarea className={inputClass} rows={2} value={note} onChange={(e) => setNote(e.target.value)} />
          </div>

          <div className="flex gap-3">
            <button type="submit" disabled={saving || !quantity} className={btnPrimary}>
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button type="button" onClick={onClose} className={btnOutline}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminInventory() {
  const [result, setResult] = useState({ items: [], total: 0 });
  const [history, setHistory] = useState([]);
  const [search, setSearch] = useState('');
  const [stockStatus, setStockStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [adjustingProduct, setAdjustingProduct] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [invRes, historyRes] = await Promise.all([
        api.get('/inventory', { params: { search: search || undefined, stockStatus: stockStatus || undefined, limit: 50 } }),
        api.get('/inventory/history', { params: { limit: 15 } }),
      ]);
      setResult(invRes.data);
      setHistory(historyRes.data.items);
    } finally {
      setLoading(false);
    }
  }, [search, stockStatus]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div>
      <h1 className="font-display text-2xl text-ink">Inventory</h1>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <input
          placeholder="Search products..."
          className={`${inputClass} max-w-xs`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className={`${inputClass} w-auto`} value={stockStatus} onChange={(e) => setStockStatus(e.target.value)}>
          <option value="">All stock levels</option>
          <option value="low">Low stock</option>
          <option value="out">Out of stock</option>
        </select>
      </div>

      {loading ? (
        <Loader />
      ) : (
        <div className="mt-4 overflow-x-auto rounded-lg border border-taupe/20 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-ivory-dark text-xs uppercase text-taupe">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">SKU</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {result.items.map((p) => (
                <tr key={p._id} className="border-t border-taupe/10">
                  <td className="px-4 py-3 font-medium text-ink">{p.name}</td>
                  <td className="px-4 py-3 text-taupe">{p.sku}</td>
                  <td className="px-4 py-3 text-taupe">{p.category?.name}</td>
                  <td className="px-4 py-3 font-medium text-ink">{p.stockQty}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_BADGE[p.stockStatus]}`}>
                      {STATUS_LABEL[p.stockStatus]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => setAdjustingProduct(p)} className="text-xs text-burgundy hover:underline">
                      Adjust Stock
                    </button>
                  </td>
                </tr>
              ))}
              {result.items.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-taupe">
                    No products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <h2 className="mt-8 font-display text-xl text-ink">Recent Stock Movements</h2>
      <div className="mt-4 overflow-x-auto rounded-lg border border-taupe/20 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-ivory-dark text-xs uppercase text-taupe">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Change</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Reason</th>
              <th className="px-4 py-3">By</th>
            </tr>
          </thead>
          <tbody>
            {history.map((h) => (
              <tr key={h._id} className="border-t border-taupe/10">
                <td className="px-4 py-3 text-taupe">{new Date(h.createdAt).toLocaleString()}</td>
                <td className="px-4 py-3 text-ink">{h.product?.name}</td>
                <td className="px-4 py-3 capitalize text-ink">{h.type}</td>
                <td className={`px-4 py-3 font-medium ${h.quantityChange >= 0 ? 'text-green-700' : 'text-burgundy'}`}>
                  {h.quantityChange >= 0 ? `+${h.quantityChange}` : h.quantityChange}
                </td>
                <td className="px-4 py-3 text-taupe">
                  {h.previousStock} → {h.newStock}
                </td>
                <td className="px-4 py-3 text-taupe">{h.reason.replace(/_/g, ' ')}</td>
                <td className="px-4 py-3 text-taupe">{h.admin?.name}</td>
              </tr>
            ))}
            {history.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-taupe">
                  No stock movements yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {adjustingProduct && (
        <AdjustStockModal
          product={adjustingProduct}
          onClose={() => setAdjustingProduct(null)}
          onSaved={() => {
            setAdjustingProduct(null);
            load();
          }}
        />
      )}
    </div>
  );
}

import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/client';
import Loader from '../../components/common/Loader';
import StarRating from '../../components/common/StarRating';

export default function AdminReviews() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/reviews');
      setItems(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const approve = async (id) => {
    await api.patch(`/reviews/${id}/approve`);
    toast.success('Review approved');
    load();
  };

  const remove = async (id) => {
    if (!confirm('Delete this review?')) return;
    await api.delete(`/reviews/${id}`);
    toast.success('Review deleted');
    load();
  };

  if (loading) return <Loader />;

  return (
    <div>
      <h1 className="font-display text-2xl text-ink">Reviews</h1>
      <div className="mt-6 space-y-3">
        {items.length === 0 && <p className="text-taupe">No reviews yet.</p>}
        {items.map((r) => (
          <div key={r._id} className="rounded-lg border border-taupe/20 bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-medium text-ink">{r.product?.name}</p>
                <p className="text-xs text-taupe">
                  {r.customer?.name} · {r.customer?.email}
                </p>
              </div>
              <StarRating value={r.rating} />
            </div>
            {r.comment && <p className="mt-2 text-sm text-ink/80">{r.comment}</p>}
            <div className="mt-3 flex items-center gap-3">
              <span className={`text-xs font-medium ${r.isApproved ? 'text-green-700' : 'text-taupe'}`}>
                {r.isApproved ? 'Approved' : 'Pending approval'}
              </span>
              {!r.isApproved && (
                <button onClick={() => approve(r._id)} className="text-xs text-burgundy hover:underline">
                  Approve
                </button>
              )}
              <button onClick={() => remove(r._id)} className="text-xs text-burgundy hover:underline">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

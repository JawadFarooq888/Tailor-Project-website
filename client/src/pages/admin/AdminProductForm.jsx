import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api, { resolveImageUrl } from '../../api/client';
import Loader from '../../components/common/Loader';
import { inputClass, labelClass, btnPrimary, btnOutline } from '../../styles/ui';

const emptyForm = {
  name: '',
  sku: '',
  category: '',
  subCategory: '',
  brand: '',
  fabric: '',
  colors: '',
  sizes: '',
  price: '',
  discountPercent: 0,
  description: '',
  tags: '',
  stockQty: 0,
  lowStockThreshold: 5,
  status: 'active',
  isFeatured: false,
  videoUrl: '',
};

export default function AdminProductForm() {
  const { id } = useParams();
  const isEdit = id && id !== 'new';
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [existingImages, setExistingImages] = useState([]);
  const [removeImages, setRemoveImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/categories', { params: { all: 'true' } }).then((r) => setCategories(r.data));
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    api.get(`/products/id/${id}`).then(({ data }) => {
      setForm({
        name: data.name,
        sku: data.sku,
        category: data.category?._id || '',
        subCategory: data.subCategory || '',
        brand: data.brand || '',
        fabric: data.fabric || '',
        colors: (data.colors || []).join(', '),
        sizes: (data.sizes || []).join(', '),
        price: data.price,
        discountPercent: data.discountPercent || 0,
        description: data.description || '',
        tags: (data.tags || []).join(', '),
        stockQty: data.stockQty,
        lowStockThreshold: data.lowStockThreshold,
        status: data.status,
        isFeatured: data.isFeatured,
        videoUrl: data.videoUrl || '',
      });
      setExistingImages(data.images || []);
      setLoading(false);
    });
  }, [id, isEdit]);

  const toggleRemoveImage = (img) => {
    setRemoveImages((prev) => (prev.includes(img) ? prev.filter((i) => i !== img) : [...prev, img]));
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([key, value]) => fd.append(key, value));
      if (removeImages.length) fd.append('removeImages', removeImages.join(','));
      newImages.forEach((file) => fd.append('images', file));

      if (isEdit) {
        await api.patch(`/products/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Product updated');
      } else {
        await api.post('/products', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Product created');
      }
      navigate('/admin/products');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not save product');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-2xl text-ink">{isEdit ? 'Edit Product' : 'Add Product'}</h1>
      <form onSubmit={submit} className="mt-6 space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Product Name</label>
            <input required className={inputClass} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <label className={labelClass}>SKU</label>
            <input required className={inputClass} value={form.sku} onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))} />
          </div>
          <div>
            <label className={labelClass}>Category</label>
            <select required className={inputClass} value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Sub Category</label>
            <input className={inputClass} value={form.subCategory} onChange={(e) => setForm((f) => ({ ...f, subCategory: e.target.value }))} />
          </div>
          <div>
            <label className={labelClass}>Brand</label>
            <input className={inputClass} value={form.brand} onChange={(e) => setForm((f) => ({ ...f, brand: e.target.value }))} />
          </div>
          <div>
            <label className={labelClass}>Fabric</label>
            <input className={inputClass} value={form.fabric} onChange={(e) => setForm((f) => ({ ...f, fabric: e.target.value }))} />
          </div>
          <div>
            <label className={labelClass}>Colors (comma separated)</label>
            <input className={inputClass} value={form.colors} onChange={(e) => setForm((f) => ({ ...f, colors: e.target.value }))} placeholder="Charcoal, Ivory, Navy" />
          </div>
          <div>
            <label className={labelClass}>Sizes (comma separated)</label>
            <input className={inputClass} value={form.sizes} onChange={(e) => setForm((f) => ({ ...f, sizes: e.target.value }))} placeholder="S, M, L, XL" />
          </div>
          <div>
            <label className={labelClass}>Price (Rs.)</label>
            <input required type="number" min={0} className={inputClass} value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} />
          </div>
          <div>
            <label className={labelClass}>Discount %</label>
            <input type="number" min={0} max={100} className={inputClass} value={form.discountPercent} onChange={(e) => setForm((f) => ({ ...f, discountPercent: e.target.value }))} />
          </div>
          <div>
            <label className={labelClass}>Stock Quantity</label>
            <input required type="number" min={0} className={inputClass} value={form.stockQty} onChange={(e) => setForm((f) => ({ ...f, stockQty: e.target.value }))} />
          </div>
          <div>
            <label className={labelClass}>Low Stock Threshold</label>
            <input type="number" min={0} className={inputClass} value={form.lowStockThreshold} onChange={(e) => setForm((f) => ({ ...f, lowStockThreshold: e.target.value }))} />
          </div>
          <div>
            <label className={labelClass}>Status</label>
            <select className={inputClass} value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2 text-sm text-ink/80">
              <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm((f) => ({ ...f, isFeatured: e.target.checked }))} />
              Featured Product
            </label>
          </div>
        </div>

        <div>
          <label className={labelClass}>Tags (comma separated)</label>
          <input className={inputClass} value={form.tags} onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))} placeholder="bestseller, new" />
        </div>

        <div>
          <label className={labelClass}>Description</label>
          <textarea rows={4} className={inputClass} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
        </div>

        <div>
          <label className={labelClass}>Product Video URL (optional)</label>
          <input className={inputClass} value={form.videoUrl} onChange={(e) => setForm((f) => ({ ...f, videoUrl: e.target.value }))} />
        </div>

        {existingImages.length > 0 && (
          <div>
            <label className={labelClass}>Existing Images (click to remove)</label>
            <div className="flex flex-wrap gap-2">
              {existingImages.map((img) => (
                <button
                  type="button"
                  key={img}
                  onClick={() => toggleRemoveImage(img)}
                  className={`relative h-20 w-20 overflow-hidden rounded border ${
                    removeImages.includes(img) ? 'border-burgundy opacity-40' : 'border-taupe/30'
                  }`}
                >
                  <img src={resolveImageUrl(img)} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <label className={labelClass}>Upload New Images</label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => setNewImages(Array.from(e.target.files))}
            className="block text-sm text-ink/80"
          />
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={saving} className={btnPrimary}>
            {saving ? 'Saving...' : 'Save Product'}
          </button>
          <button type="button" onClick={() => navigate('/admin/products')} className={btnOutline}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

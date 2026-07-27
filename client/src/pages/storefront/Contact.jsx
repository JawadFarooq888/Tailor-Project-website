import { useState } from 'react';
import toast from 'react-hot-toast';
import { inputClass, labelClass, btnPrimary } from '../../styles/ui';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });

  const submit = (e) => {
    e.preventDefault();
    toast.success("Thanks for reaching out — we'll get back to you soon.");
    setForm({ name: '', email: '', message: '' });
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <h1 className="font-display text-3xl text-ink">Contact Us</h1>
      <p className="mt-2 text-taupe">Questions about an order or a custom stitching request? Send us a message.</p>
      <form onSubmit={submit} className="mt-8 space-y-4">
        <div>
          <label className={labelClass}>Name</label>
          <input required className={inputClass} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
        </div>
        <div>
          <label className={labelClass}>Email</label>
          <input type="email" required className={inputClass} value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
        </div>
        <div>
          <label className={labelClass}>Message</label>
          <textarea required rows={5} className={inputClass} value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} />
        </div>
        <button type="submit" className={btnPrimary}>
          Send Message
        </button>
      </form>
      <div className="mt-10 text-sm text-ink/70">
        <p>Email: support@tailorboutique.com</p>
        <p>Phone: +92 300 1234567</p>
      </div>
    </div>
  );
}

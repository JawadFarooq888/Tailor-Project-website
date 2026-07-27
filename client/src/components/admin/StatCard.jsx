export default function StatCard({ label, value, sub, accent = 'gold' }) {
  const accentClass = accent === 'burgundy' ? 'text-burgundy' : accent === 'ink' ? 'text-ink' : 'text-gold';
  return (
    <div className="rounded-lg border border-taupe/20 bg-white p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-taupe">{label}</p>
      <p className={`mt-2 font-display text-2xl font-semibold ${accentClass}`}>{value}</p>
      {sub && <p className="mt-1 text-xs text-taupe">{sub}</p>}
    </div>
  );
}

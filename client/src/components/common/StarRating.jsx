export default function StarRating({ value = 0, count, size = 'text-sm' }) {
  const stars = [1, 2, 3, 4, 5];
  return (
    <span className={`inline-flex items-center gap-1 ${size}`}>
      <span className="text-gold">
        {stars.map((s) => (s <= Math.round(value) ? '★' : '☆')).join('')}
      </span>
      {count !== undefined && <span className="text-taupe">({count})</span>}
    </span>
  );
}

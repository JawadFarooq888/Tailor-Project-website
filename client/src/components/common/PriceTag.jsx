function formatPrice(amount) {
  return `Rs. ${Number(amount || 0).toLocaleString('en-PK')}`;
}

export default function PriceTag({ price, discountPercent, salePrice, size = 'text-lg' }) {
  const hasDiscount = discountPercent > 0;
  return (
    <span className={`inline-flex items-baseline gap-2 ${size}`}>
      <span className="font-semibold text-ink">{formatPrice(hasDiscount ? salePrice : price)}</span>
      {hasDiscount && (
        <>
          <span className="text-taupe line-through text-sm">{formatPrice(price)}</span>
          <span className="text-burgundy text-xs font-medium">-{discountPercent}%</span>
        </>
      )}
    </span>
  );
}

export { formatPrice };

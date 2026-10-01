export default function StockBadge({
  stock,
  unit,
  updatedMinAgo,
}: {
  stock: number;
  unit: string;
  updatedMinAgo: number;
}) {
  if (stock <= 0)
    return (
      <span className="badge b-red">
        <span className="dot" /> Out of stock
      </span>
    );
  if (stock <= 20)
    return (
      <span className="badge b-amber">
        <span className="dot" /> Low stock • {stock} {unit}s
      </span>
    );
  const fresh = updatedMinAgo <= 15 ? `updated ${updatedMinAgo} min ago` : 'verified today';
  return (
    <span className="badge b-green">
      <span className="dot" /> In stock • {stock} {unit}s • {fresh}
    </span>
  );
}

const STEPS = ['confirmed', 'preparing', 'out_for_delivery', 'delivered', 'completed'] as const;
const LABELS: Record<string, string> = {
  confirmed: 'Confirmed',
  preparing: 'Preparing',
  out_for_delivery: 'Out for delivery',
  delivered: 'Delivered',
  completed: 'Completed',
};

export default function OrderTracker({ status }: { status: string }) {
  const idx = STEPS.indexOf(status as (typeof STEPS)[number]);
  const now = idx < 0 ? 0 : idx;
  return (
    <div className="tracker" role="list" aria-label="Order progress">
      {STEPS.map((s, i) => (
        <div
          key={s}
          role="listitem"
          className={`step${i < now ? ' done' : i === now ? ' now' : ''}`}
        >
          {LABELS[s]}
        </div>
      ))}
    </div>
  );
}

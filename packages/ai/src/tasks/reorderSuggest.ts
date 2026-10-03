// reorderSuggest — order history → suggested reorder list (recommendation only).

import type { OrderLine, ReorderItem, TaskOutput, VendorAdapter } from '../types.js';

export async function reorderSuggest(
  history: OrderLine[],
  _adapter?: VendorAdapter,
): Promise<TaskOutput<ReorderItem[]>> {
  // Heuristic: suggest anything ordered ≥2 times or with qty ≥ 5; top up to last qty.
  const counts = new Map<string, { line: OrderLine; n: number }>();
  for (const line of history) {
    const e = counts.get(line.itemId);
    if (e) { e.n += 1; e.line = line; } else counts.set(line.itemId, { line, n: 1 });
  }
  const data: ReorderItem[] = [...counts.values()]
    .filter(({ line, n }) => n >= 2 || line.qty >= 5)
    .map(({ line, n }) => ({
      canonicalOrOfferId: line.itemId,
      name: line.name,
      suggestedQty: line.qty,
      unit_type: line.unit_type,
      reason: n >= 2 ? `ordered ${n}× before` : 'bulk staple — top up',
    }))
    .slice(0, 10);
  return {
    data,
    confidence: data.length > 0 ? 0.65 : 0.3,
    needsConfirm: true,
    interpretation:
      data.length > 0
        ? `Suggest reordering ${data.length} item(s): ${data.map((d) => `${d.suggestedQty}× ${d.name}`).join(', ')}. Recommendation only — confirm to add to cart.`
        : 'No repeat pattern yet — no reorder suggested.',
    model: 'stub/reorder-v1',
  };
}

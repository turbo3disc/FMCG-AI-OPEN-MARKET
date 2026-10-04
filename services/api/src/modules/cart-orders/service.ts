import { pool, withTx, type TxClient } from '../../db/pool.js';
import { priceForQty, type PriceBreak } from '../../../../../packages/shared/src/index.js';
import { writeAudit } from '../../common/audit.js';
import { ApiError } from '../../common/errors.js';
import { assertTransition } from './schemas.js';

// --- Cart (single-seller enforced by DB CHECK + here) ---
async function getOrCreateCart(tx: TxClient, buyerId: string, sellerId: string): Promise<string> {
  const r = await tx.query(`SELECT id FROM carts WHERE buyer_id = $1 AND seller_id = $2`, [buyerId, sellerId]);
  if (r.rows.length) return (r.rows[0] as { id: string }).id;
  // One active cart per buyer: drop carts for other sellers (single-seller cart MVP).
  await tx.query(`DELETE FROM carts WHERE buyer_id = $1`, [buyerId]);
  const c = await tx.query(`INSERT INTO carts (buyer_id, seller_id) VALUES ($1,$2) RETURNING id`, [buyerId, sellerId]);
  return (c.rows[0] as { id: string }).id;
}

export async function addToCart(buyerId: string, offerId: string, qty: number) {
  return withTx(async (tx) => {
    const o = await tx.query(`SELECT id, seller_id, price_kobo, moq, unit_type, (on_hand - reserved) AS available FROM seller_offers WHERE id = $1 AND status = 'published'`, [offerId]);
    const offer = o.rows[0] as Record<string, number & string> & { seller_id: string; price_kobo: number; moq: number; available: number } | undefined;
    if (!offer) throw ApiError.notFound('offer not available');
    if (qty < offer.moq) throw ApiError.badRequest(`qty below MOQ ${offer.moq}`, 'MOQ');
    if (qty > offer.available) throw ApiError.badRequest('insufficient stock', 'STOCK');
    const cartId = await getOrCreateCart(tx, buyerId, offer.seller_id);
    await tx.query(
      `INSERT INTO cart_items (cart_id, offer_id, qty, price_kobo) VALUES ($1,$2,$3,$4)
       ON CONFLICT (cart_id, offer_id) DO UPDATE SET qty = cart_items.qty + EXCLUDED.qty`,
      [cartId, offerId, qty, offer.price_kobo],
    );
    await writeAudit(tx, { actorId: buyerId, action: 'cart.add', entity: 'carts', entityId: cartId, meta: { offerId, qty } });
    return getCart(buyerId);
  });
}

export async function getCart(buyerId: string) {
  const c = await pool.query(`SELECT * FROM carts WHERE buyer_id = $1`, [buyerId]);
  if (!c.rows.length) return { items: [] };
  const items = (await pool.query(
    `SELECT ci.*, o.title, o.unit_type, s.business_name AS seller FROM cart_items ci
     JOIN seller_offers o ON o.id = ci.offer_id JOIN seller_profiles s ON s.id = o.seller_id WHERE ci.cart_id = $1`,
    [(c.rows[0] as { id: string }).id],
  )).rows;
  return { cart: c.rows[0], items };
}

export const clearCart = async (buyerId: string) => {
  await pool.query(`DELETE FROM carts WHERE buyer_id = $1`, [buyerId]);
  return { cleared: true };
};

// --- Checkout: order_group + child orders + stock reserve in ONE transaction ---
export async function checkout(buyerId: string, addressId?: string) {
  return withTx(async (tx) => {
    const cart = await getCart(buyerId);
    const items = (cart as { items: Array<{ offer_id: string; qty: number; price_kobo: number }> }).items;
    if (!items.length) throw ApiError.badRequest('cart is empty');

    let subtotal = 0;
    const sellerId = (await tx.query(`SELECT seller_id FROM carts WHERE buyer_id = $1`, [buyerId])).rows[0] as { seller_id: string } | undefined;
    if (!sellerId) throw ApiError.badRequest('cart is empty');

    // Reserve each line under row lock; CHECK available >= 0 blocks oversell.
    // Unit price honors bulk breaks (shared priceForQty): money stays integer kobo.
    for (const it of items) {
      const r = await tx.query(`SELECT price_kobo, bulk_breaks, (on_hand - reserved) AS available FROM seller_offers WHERE id = $1 FOR UPDATE`, [it.offer_id]);
      const row = r.rows[0] as { price_kobo: number; bulk_breaks: PriceBreak[] | string; available: number } | undefined;
      if (!row || row.available < it.qty) throw ApiError.badRequest(`insufficient stock for ${it.offer_id}`, 'STOCK');
      const breaks = typeof row.bulk_breaks === 'string' ? (JSON.parse(row.bulk_breaks) as PriceBreak[]) : (row.bulk_breaks ?? []);
      const unit = priceForQty(row.price_kobo, breaks, it.qty);
      subtotal += unit * it.qty;
      await tx.query(`UPDATE seller_offers SET reserved = reserved + $2 WHERE id = $1`, [it.offer_id, it.qty]);
      await writeAudit(tx, { actorId: buyerId, action: 'inventory.reserve', entity: 'seller_offers', entityId: it.offer_id, meta: { qty: it.qty } });
    }

    const g = await tx.query(
      `INSERT INTO order_groups (buyer_id, total_kobo, address_id, status) VALUES ($1,$2,$3,'pending') RETURNING *`,
      [buyerId, subtotal, addressId ?? null],
    );
    const group = g.rows[0] as { id: string };
    const o = await tx.query(
      `INSERT INTO orders (group_id, buyer_id, seller_id, subtotal_kobo, delivery_fee_kobo, status, payment_state)
       VALUES ($1,$2,$3,$4,0,'pending','PENDING') RETURNING *`,
      [group.id, buyerId, sellerId.seller_id, subtotal],
    );
    const order = o.rows[0] as { id: string };
    for (const it of items) {
      await tx.query(`INSERT INTO order_items (order_id, offer_id, qty, price_kobo) VALUES ($1,$2,$3,$4)`, [
        order.id, it.offer_id, it.qty, it.price_kobo,
      ]);
    }
    await tx.query(`DELETE FROM carts WHERE buyer_id = $1`, [buyerId]);
    await writeAudit(tx, { actorId: buyerId, action: 'order.create', entity: 'orders', entityId: order.id, meta: { groupId: group.id, subtotal } });
    return { group: g.rows[0], order: o.rows[0] };
  });
}

// --- Order lifecycle ---
export const listOrders = async (userId: string, role: string) =>
  (await pool.query(
    role === 'seller'
      ? `SELECT * FROM orders WHERE seller_id IN (SELECT id FROM seller_profiles WHERE user_id = $1) ORDER BY created_at DESC LIMIT 100`
      : `SELECT * FROM orders WHERE buyer_id = $1 ORDER BY created_at DESC LIMIT 100`,
    [userId],
  )).rows;

export async function getOrder(orderId: string, userId: string) {
  const o = (await pool.query(
    `SELECT * FROM orders WHERE id = $1 AND (buyer_id = $2 OR seller_id IN (SELECT id FROM seller_profiles WHERE user_id = $2))`,
    [orderId, userId],
  )).rows[0];
  if (!o) throw ApiError.notFound('order not found');
  const items = (await pool.query(`SELECT * FROM order_items WHERE order_id = $1`, [orderId])).rows;
  return { order: o, items };
}

export async function transitionOrder(orderId: string, to: string, actorId: string) {  const r = await pool.query(`SELECT id, status FROM orders WHERE id = $1`, [orderId]);
  const order = r.rows[0] as { id: string; status: string } | undefined;
  if (!order) throw ApiError.notFound('order not found');
  assertTransition(order.status, to);
  const u = await pool.query(`UPDATE orders SET status = $2 WHERE id = $1 RETURNING *`, [orderId, to]);
  await writeAudit(pool, { actorId, action: 'order.transition', entity: 'orders', entityId: orderId, meta: { from: order.status, to } });
  return u.rows[0];
}

export async function reorder(buyerId: string, orderId: string) {
  const items = (await pool.query(`SELECT offer_id, qty FROM order_items WHERE order_id = $1`, [orderId])).rows as Array<{ offer_id: string; qty: number }>;
  if (!items.length) throw ApiError.notFound('order has no items');
  for (const it of items) await addToCart(buyerId, it.offer_id, it.qty);
  return getCart(buyerId);
}

// Lagos pilot seed: 3 zones, 5 sellers, 20 canonical products, 40 offers.
// Run via `db:seed`. Money in integer kobo. Coordinates around Lagos.
import { pool } from './pool.js';

const SELLERS = [
  { phone: '+234801000001', business: 'Balogun Market Foods', tier: 2 as const, lat: 6.4572, lng: 3.3922 },
  { phone: '+234801000002', business: 'Ikeja Provision Stores', tier: 2 as const, lat: 6.6018, lng: 3.3515 },
  { phone: '+234801000003', business: 'Lekki Everyday Mart', tier: 1 as const, lat: 6.4698, lng: 3.5852 },
  { phone: '+234801000004', business: 'Surulere Wholesale Hub', tier: 2 as const, lat: 6.5001, lng: 3.3582 },
  { phone: '+234801000005', business: 'Ajah Family Groceries', tier: 1 as const, lat: 6.4692, lng: 3.5681 },
];

const PRODUCTS: Array<[string, string, string, string]> = [
  ['Golden Penny Flour 50kg', 'Golden Penny', 'groceries', 'GP-FLOUR-50'],
  ['Dangote Sugar 50kg', 'Dangote', 'groceries', 'DN-SUGAR-50'],
  ['Kings Vegetable Oil 5L', 'Kings', 'groceries', 'KG-OIL-5L'],
  ['Mama Pride Rice 50kg', 'Mama Pride', 'groceries', 'MP-RICE-50'],
  ['Indomie Noodles carton 40', 'Indomie', 'groceries', 'IN-NOOD-40'],
  ['Peak Milk Powder 400g x12', 'Peak', 'beverages', 'PK-MILK-400'],
  ['Milo Refill 800g x6', 'Milo', 'beverages', 'MI-800-6'],
  ['Coca-Cola PET 50cl x12', 'Coca-Cola', 'beverages', 'CC-50-12'],
  ['Chivita Orange 1L x12', 'Chivita', 'beverages', 'CH-ORG-1L'],
  ['Nestle Pure Life 75cl x12', 'Nestle', 'beverages', 'NP-75-12'],
  ['Close-Up Toothpaste 140g x12', 'Close-Up', 'household', 'CU-140-12'],
  ['Morning Fresh 900ml x12', 'Morning Fresh', 'household', 'MF-900-12'],
  ['Omo Detergent 2kg x6', 'Omo', 'household', 'OM-2KG-6'],
  ['Dettol Soap 90g x24', 'Dettol', 'household', 'DT-90-24'],
  ['Belo Cleanser 500ml x12', 'Belo', 'household', 'BE-500-12'],
  ['Ayoola Poundo Yam 5kg', 'Ayoola', 'groceries', 'AY-PY-5'],
  ['Golden Morn 1kg x12', 'Golden Morn', 'groceries', 'GM-1KG-12'],
  ['Three Crowns Milk  evaporated x24', 'Three Crowns', 'beverages', 'TC-EV-24'],
  ['Sunlight Soap 150g x24', 'Sunlight', 'household', 'SU-150-24'],
  ['Pears Baby Lotion 500ml', 'Pears', 'household', 'PE-500-1'],
];

export async function seed(): Promise<void> {
  // Zones
  await pool.query(
    `INSERT INTO delivery_zones (name, center, radius_km, fee_kobo, min_order_kobo) VALUES
     ('Lagos Island', ST_SetSRID(ST_MakePoint(3.3922, 6.4572), 4326), 8, 150000, 200000),
     ('Ikeja / Mainland', ST_SetSRID(ST_MakePoint(3.3515, 6.6018), 4326), 10, 120000, 200000),
     ('Lekki / Ajah', ST_SetSRID(ST_MakePoint(3.5852, 6.4698), 4326), 12, 180000, 250000)
     ON CONFLICT DO NOTHING`,
  );
  const sellerIds: string[] = [];
  for (const s of SELLERS) {
    const u = await pool.query(
      `INSERT INTO users (phone) VALUES ($1) ON CONFLICT (phone) DO UPDATE SET phone = EXCLUDED.phone RETURNING id`,
      [s.phone],
    );
    const uid = (u.rows[0] as { id: string }).id;
    const sp = await pool.query(
      `INSERT INTO seller_profiles (user_id, seller_type, business_name, verification_tier, verification_status)
       VALUES ($1,'wholesaler',$2,$3,'approved') RETURNING id`,
      [uid, s.business, s.tier],
    );
    const sid = (sp.rows[0] as { id: string }).id;
    await pool.query(`UPDATE seller_profiles SET location = ST_SetSRID(ST_MakePoint($2,$3),4326)::geography WHERE id = $1`, [sid, s.lng, s.lat]);
    sellerIds.push(sid);
  }
  const canonIds: string[] = [];
  for (const [name, brand, cat, sku] of PRODUCTS) {
    const c = await pool.query(
      `INSERT INTO canonical_products (name, brand, category, sku, unit_types, status)
       VALUES ($1,$2,$3,$4,'{piece,pack,carton}','canonical') ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name RETURNING id`,
      [name, brand, cat, sku],
    );
    canonIds.push((c.rows[0] as { id: string }).id);
  }
  // 40 offers: each seller lists 8 products, 2 sellers per product avg.
  let n = 0;
  for (let i = 0; i < 40; i++) {
    const seller = sellerIds[i % sellerIds.length];
    const canon = canonIds[(i * 7) % canonIds.length];
    const base = 500000 + ((i * 137000) % 4500000); // ₦5,000–₦50,000 in kobo
    await pool.query(
      `INSERT INTO seller_offers (seller_id, canonical_product_id, title, price_kobo, bulk_breaks, moq, unit_type, on_hand, status)
       VALUES ($1,$2,$3,$4,$5,1,'carton',$6,'published')`,
      [seller, canon, `${PRODUCTS[(i * 7) % PRODUCTS.length][0]} — bulk`, base,
        JSON.stringify([{ minQty: 5, priceKobo: Math.round(base * 0.97) }, { minQty: 20, priceKobo: Math.round(base * 0.93) }]),
        20 + ((i * 13) % 200)],
    );
    n++;
  }
  console.log(`seeded 3 zones, 5 sellers, 20 canonical products, ${n} offers`);
}

seed().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });

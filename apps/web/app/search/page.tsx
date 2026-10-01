import SearchBar from '../../components/SearchBar';
import StockBadge from '../../components/StockBadge';
import DistanceChip from '../../components/DistanceChip';
import { formatNGN } from '../../lib/money';
import { products, sellers, sellerOf } from '../../lib/demo';

export default function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string; cat?: string; radius?: string; unit?: string };
}) {
  const q = (searchParams.q ?? '').toLowerCase();
  const cat = searchParams.cat ?? '';
  const radius = Number(searchParams.radius ?? 5);
  const unit = searchParams.unit ?? '';

  const matched = products.filter(
    (p) =>
      (!q || `${p.name} ${p.brand}`.toLowerCase().includes(q)) &&
      (!cat || p.category === cat) &&
      (!unit || p.unit === unit || p.offers.some((o) => o.unitTypes.includes(unit as never))),
  );

  const rows = matched.flatMap((p) =>
    p.offers
      .filter((o) => sellerOf(o.sellerId).distanceKm <= radius)
      .map((o) => ({ product: p, offer: o, seller: sellerOf(o.sellerId) })),
  );

  const altSellers = sellers.filter((s) => s.distanceKm > radius).slice(0, 2);

  return (
    <div>
      <h1>Search</h1>
      <p className="sub">B2C proximity rank (3–5 km) • B2B zone + stock-depth rank city-wide.</p>
      <SearchBar initial={searchParams.q ?? ''} />
      <form method="get" action="/search" style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
        <input type="hidden" name="q" value={searchParams.q ?? ''} />
        <select name="radius" defaultValue={String(radius)} aria-label="Radius">
          <option value="3">Within 3 km</option>
          <option value="5">Within 5 km</option>
          <option value="50">City-wide (B2B)</option>
        </select>
        <select name="unit" defaultValue={unit} aria-label="Unit type">
          <option value="">Any unit</option>
          <option value="piece">Retail (piece)</option>
          <option value="pack">Pack</option>
          <option value="carton">Bulk (carton)</option>
        </select>
        <button className="btn btn-outline" type="submit">Apply filters</button>
      </form>

      <h2 className="section">Results ({rows.length} offers)</h2>
      <table>
        <thead>
          <tr><th>Seller</th><th>Product</th><th>Distance</th><th>Stock</th><th>Price</th><th>Trust</th></tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              <td><b>{r.seller.name}</b> • {r.seller.market}</td>
              <td><a href={`/product/${r.product.id}`}>{r.product.name}</a></td>
              <td><DistanceChip km={r.seller.distanceKm} /></td>
              <td><StockBadge stock={r.offer.stock} unit={r.product.unit} updatedMinAgo={r.offer.updatedMinAgo} /></td>
              <td><b>{formatNGN(r.offer.priceKobo)}</b></td>
              <td>{r.seller.tier === 2 ? '★★★★☆ Tier 2' : '★★★☆☆ Tier 1'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 && <div className="notice warn">No offers in radius — try City-wide (B2B).</div>}

      {altSellers.length > 0 && (
        <div>
          <h2 className="section">Alternative sellers (outside radius)</h2>
          <div className="grid g2">
            {altSellers.map((s) => (
              <div key={s.id} className="card">
                <b>{s.name}</b> • {s.market} • {s.distanceKm} km
                <div className="sub">Same canonical product, ships city-wide.</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

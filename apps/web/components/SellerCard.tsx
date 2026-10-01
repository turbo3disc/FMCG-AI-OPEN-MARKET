import type { DemoSeller } from '../lib/demo';

export default function SellerCard({ seller }: { seller: DemoSeller }) {
  const initials = seller.name.split(' ').map((w) => w[0]).slice(0, 2).join('');
  const stars = '★'.repeat(Math.round(seller.rating)) + '☆'.repeat(5 - Math.round(seller.rating));
  return (
    <div className="card">
      <div className="seller">
        <div className="avatar">{initials}</div>
        <div>
          <div className="name" style={{ fontWeight: 700 }}>
            {seller.name} — {seller.market}
          </div>
          <div className="stars">
            {stars} {seller.rating.toFixed(1)} ({seller.reviews})
          </div>
          <div style={{ marginTop: 6, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {seller.tier === 2 ? (
              <span className="badge b-green">Tier 2 • Verified</span>
            ) : (
              <span className="badge b-grey">Tier 1 • Basic</span>
            )}
            <span className="badge b-grey">{seller.distanceKm} km</span>
            {seller.codEligible && <span className="badge b-amber">COD eligible</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

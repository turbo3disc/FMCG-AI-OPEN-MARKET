import SearchBar from '../components/SearchBar';
import ProductCard from '../components/ProductCard';
import SellerCard from '../components/SellerCard';
import { categories, products, sellers } from '../lib/demo';

export default function HomePage() {
  const featured = products.slice(0, 4);
  return (
    <div>
      <header className="hero-mix">
        <div className="hero-grid" aria-hidden="true">
          <div className="hero-photo"><img src="/hero-market.jpg" alt="" /></div>
          <div className="hero-photo"><img src="/hero-oils.jpg" alt="" /></div>
          <div className="hero-photo"><img src="/hero-aisle.jpg" alt="" /></div>
          <div className="hero-shade" />
        </div>
        <div className="hero-content">
          <span className="hero-kicker"><span className="dot" /> Lagos pilot — live</span>
          <h1>Fresh stock, nearby sellers, fair prices</h1>
          <p>B2C instant shopping + B2B bulk procurement. Money in kobo, displayed in ₦.</p>
          <div style={{ marginTop: 16, maxWidth: 560 }}>
            <SearchBar />
          </div>
          <div className="hero-cta">
            <a href="/search" className="btn btn-accent">Shop now</a>
            <a href="/dashboard" className="btn hero-ghost">Become a seller</a>
          </div>
          <div className="hero-stats">
            <span><b>Verified</b> sellers</span>
            <span><b>Canonical</b> products</span>
            <span><b>Protected</b> payments + COD</span>
          </div>
        </div>
      </header>

      <h2 className="section">Categories</h2>
      <p className="sub">Three FMCG clusters for the pilot.</p>
      <div className="grid g3">
        {categories.map((c) => (
          <a key={c} href={`/search?cat=${encodeURIComponent(c)}`} className="card">
            <h3>{c}</h3>
            <p className="sub">{products.filter((p) => p.category === c).length} canonical products</p>
          </a>
        ))}
      </div>

      <h2 className="section">Featured offers</h2>
      <p className="sub">Demo data — live API results appear here when localhost:3001 is up.</p>
      <div className="grid g2">
        {featured.map((p) => <ProductCard key={p.id} product={p} />)}
      </div>

      <h2 className="section">Nearby verified sellers</h2>
      <div className="grid g3">
        {sellers.map((s) => <SellerCard key={s.id} seller={s} />)}
      </div>
    </div>
  );
}

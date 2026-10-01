import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'FMCG Open Market — Lagos Pilot',
  description: 'B2C instant + B2B bulk FMCG marketplace for Lagos.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <nav className="topnav">
          <div className="topnav-inner">
            <a href="/" className="brand">
              <span className="brand-mark">◉</span> FMCG Open Market
              <span className="badge b-amber" style={{ marginLeft: 8 }}>Lagos pilot</span>
            </a>
            <div className="topnav-links">
              <a href="/search">Search</a>
              <a href="/cart">Cart</a>
              <a href="/orders">Orders</a>
              <a href="/procurement">Procurement</a>
              <a href="/dashboard">Seller</a>
              <a href="/admin">Admin</a>
            </div>
          </div>
        </nav>
        <main className="wrap">{children}</main>
        <footer className="footer">
          FMCG Open Market • Lagos pilot • Money in kobo, displayed in ₦ • Protected payments + COD
        </footer>
      </body>
    </html>
  );
}

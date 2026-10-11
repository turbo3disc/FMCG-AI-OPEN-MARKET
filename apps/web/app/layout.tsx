import type { Metadata, Viewport } from 'next';
import './globals.css';
import RegisterSW from '../components/RegisterSW';

export const metadata: Metadata = {
  title: 'FMCG Open Market — Lagos Pilot',
  description: 'B2C instant + B2B bulk FMCG marketplace for Lagos.',
  manifest: '/manifest.webmanifest',
  appleWebApp: { capable: true, statusBarStyle: 'default', title: 'FMCG Market' },
  icons: {
    icon: [
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
};

export const viewport: Viewport = {
  themeColor: '#00703A',
  width: 'device-width',
  initialScale: 1,
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
              <a href="/messages">Messages</a>
              <a href="/orders">Orders</a>
              <a href="/procurement">Procurement</a>
              <a href="/dashboard">Seller</a>
              <a href="/join">Join</a>
              <a href="/login">Login</a>
              <a href="/admin">Admin</a>
            </div>
          </div>
        </nav>
        <main className="wrap">{children}</main>
        <footer className="footer">
          FMCG Open Market • Lagos pilot • Money in kobo, displayed in ₦ • Protected payments + COD
        </footer>
        <RegisterSW />
      </body>
    </html>
  );
}

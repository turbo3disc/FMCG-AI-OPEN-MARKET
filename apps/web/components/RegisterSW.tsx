// Registers the next-pwa service worker (explicit — no dependency on
// build-time injection, works identically on Netlify/Vercel/Docker).
'use client';

import { useEffect } from 'react';

export default function RegisterSW() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        /* offline-first is best-effort; the app works without it */
      });
    }
  }, []);
  return null;
}

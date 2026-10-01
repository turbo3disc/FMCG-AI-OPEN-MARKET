'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SearchBar({ initial = '' }: { initial?: string }) {
  const [q, setQ] = useState(initial);
  const router = useRouter();
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        router.push(`/search?q=${encodeURIComponent(q)}`);
      }}
      style={{ display: 'flex', gap: 8 }}
    >
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search Indomie carton, Milo, sugar…"
        aria-label="Search products"
      />
      <button className="btn btn-primary" type="submit">Search</button>
    </form>
  );
}

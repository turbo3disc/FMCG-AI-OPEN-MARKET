'use client';

import { useState } from 'react';
import type { DemoQuote } from '../lib/demo';

export default function QuoteCard({ quote }: { quote: DemoQuote }) {
  const [counter, setCounter] = useState('');
  const [sent, setSent] = useState(false);
  return (
    <div className="card">
      <div className="kicker">{quote.id} • {quote.status}</div>
      <h3 style={{ marginTop: 4 }}>{quote.rfqTitle}</h3>
      <div className="product meta">{quote.buyer} • {quote.expiresIn}</div>
      {quote.versions.map((v, i) => (
        <div key={i} className={`quote-ver${v.accepted ? ' accepted' : ''}`}>
          <span className="who">{v.who}:</span> {v.text}
        </div>
      ))}
      {quote.status === 'open' && (
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <input
            value={counter}
            onChange={(e) => setCounter(e.target.value)}
            placeholder="Counter-offer e.g. 20 cartons @ ₦12,200, Fri PM"
            aria-label="Counter-offer"
          />
          <button
            className="btn btn-accent"
            onClick={() => setSent(true)}
            disabled={!counter.trim()}
          >
            Send counter
          </button>
        </div>
      )}
      {sent && <div className="notice ok">Counter-offer sent — seller has 24h to respond.</div>}
    </div>
  );
}

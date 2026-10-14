// POS reports — daily / weekly / monthly sales + inventory, day-close (Z-report).
// All printable. Reads the same offline-first ledger as the till.
'use client';

import { useState } from 'react';
import type { SellerProduct } from '../lib/inventory';
import type { PosSale, StockMove, UnitKind } from '../lib/pos';
import { formatNGN } from '../lib/money';

type Period = 'day' | 'week' | 'month';

const UNITS: UnitKind[] = ['cartons', 'rolls', 'packs', 'pieces'];
const DKEY = { cartons: 'dCartons', rolls: 'dRolls', packs: 'dPacks', pieces: 'dPieces' } as const;

function signed(m: StockMove, u: UnitKind): number {
  const v = m[DKEY[u]];
  if (m.reason === 'correction') return v;
  const s = m.reason === 'return' || m.reason === 'restock' ? 1 : -1;
  return s * Math.abs(v);
}

function startOf(period: Period): number {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  if (period === 'week') {
    const dow = (d.getDay() + 6) % 7; // Monday start
    d.setDate(d.getDate() - dow);
  } else if (period === 'month') {
    d.setDate(1);
  }
  return d.getTime();
}

const periodLabel = (p: Period) => (p === 'day' ? 'Today' : p === 'week' ? 'This week' : 'This month');

interface DayClose { date: string; revenue: number; receipts: number; units: number; damages: number; returns: number; at: number; }
const CLOSE_KEY = 'fmcg-day-closes-v1';

function loadCloses(): DayClose[] {
  try {
    const v = JSON.parse(localStorage.getItem(CLOSE_KEY) ?? '[]') as DayClose[];
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

export default function PosReports({ items, sales, moves, balances, business }: {
  items: SellerProduct[];
  sales: PosSale[];
  moves: StockMove[];
  balances: Record<string, Record<UnitKind, number>>;
  business: string;
}) {
  const [period, setPeriod] = useState<Period>('day');
  const [closes, setCloses] = useState<DayClose[]>(() => (typeof window === 'undefined' ? [] : loadCloses()));
  const [msg, setMsg] = useState('');

  const start = startOf(period);
  const pSales = sales.filter((s) => s.at >= start);
  const pMoves = moves.filter((m) => m.at >= start);
  const revenue = pSales.reduce((n, s) => n + s.totalKobo, 0);
  const units = pSales.reduce((n, s) => n + s.items.reduce((a, i) => a + i.qty, 0), 0);

  const byDay = new Map<string, { receipts: number; revenue: number }>();
  for (const s of pSales) {
    const d = new Date(s.at).toLocaleDateString();
    const r = byDay.get(d) ?? { receipts: 0, revenue: 0 };
    r.receipts += 1;
    r.revenue += s.totalKobo;
    byDay.set(d, r);
  }

  const top = new Map<string, { qty: number; revenue: number }>();
  for (const s of pSales) {
    for (const i of s.items) {
      const r = top.get(i.name) ?? { qty: 0, revenue: 0 };
      r.qty += i.qty;
      r.revenue += i.qty * i.priceKobo;
      top.set(i.name, r);
    }
  }
  const topRows = Array.from(top.entries()).sort((a, b) => b[1].revenue - a[1].revenue).slice(0, 10);

  const invRows = items.map((p) => {
    const base = { cartons: p.cartons, rolls: p.rolls, packs: p.packs, pieces: p.pieces };
    const before = moves.filter((m) => m.sku === p.sku && m.at < start);
    const during = moves.filter((m) => m.sku === p.sku && m.at >= start);
    const cell = (u: UnitKind) => {
      const opening = base[u] + before.reduce((n, m) => n + signed(m, u), 0);
      const inn = during.filter((m) => m.reason === 'return' || m.reason === 'restock').reduce((n, m) => n + Math.abs(m[DKEY[u]]), 0);
      const out = during.filter((m) => m.reason === 'sale' || m.reason === 'damage').reduce((n, m) => n + Math.abs(m[DKEY[u]]), 0);
      return { opening, in: inn, out, closing: balances[p.id]?.[u] ?? base[u] };
    };
    return { p, cartons: cell('cartons'), rolls: cell('rolls'), packs: cell('packs'), pieces: cell('pieces') };
  });

  const dmg = pMoves.filter((m) => m.reason === 'damage').length;
  const ret = pMoves.filter((m) => m.reason === 'return').length;

  function closeDay() {
    const today = sales.filter((s) => s.at >= startOf('day'));
    const rec: DayClose = {
      date: new Date().toLocaleDateString(),
      revenue: today.reduce((n, s) => n + s.totalKobo, 0),
      receipts: today.length,
      units: today.reduce((n, s) => n + s.items.reduce((a, i) => a + i.qty, 0), 0),
      damages: moves.filter((m) => m.reason === 'damage' && m.at >= startOf('day')).length,
      returns: moves.filter((m) => m.reason === 'return' && m.at >= startOf('day')).length,
      at: Date.now(),
    };
    const next = [rec, ...closes.filter((c) => c.date !== rec.date)].slice(0, 60);
    setCloses(next);
    localStorage.setItem(CLOSE_KEY, JSON.stringify(next));
    setMsg(`Business day closed — ${rec.date}: ${formatNGN(rec.revenue)} across ${rec.receipts} receipts.`);
    setTimeout(() => setMsg(''), 5000);
  }

  const fmt = (c: { opening: number; in: number; out: number; closing: number }) =>
    `${c.opening} → +${c.in} / −${c.out} = ${c.closing}`;

  return (
    <div>
      <div className="btn-row no-print" style={{ marginBottom: 12 }}>
        {(['day', 'week', 'month'] as Period[]).map((x) => (
          <button key={x} className={`btn ${period === x ? 'btn-primary' : 'btn-outline'}`} onClick={() => setPeriod(x)}>
            {x === 'day' ? 'Daily' : x === 'week' ? 'Weekly' : 'Monthly'}
          </button>
        ))}
        <button className="btn btn-outline" onClick={() => window.print()}>Print report</button>
        {period === 'day' && <button className="btn btn-accent" onClick={closeDay}>Close business day</button>}
      </div>
      {msg && <div className="notice ok no-print">{msg}</div>}

      <div className="print-area">
        <h3 style={{ textAlign: 'center' }}>{business} — {periodLabel(period)} report</h3>
        <p className="sub" style={{ textAlign: 'center' }}>{new Date().toLocaleString()}</p>

        <h2 className="section">Sales</h2>
        <div className="grid g4">
          <div className="card"><h3>Revenue</h3><div className="price">{formatNGN(revenue)}</div></div>
          <div className="card"><h3>Receipts</h3><div className="price">{pSales.length}</div></div>
          <div className="card"><h3>Units sold</h3><div className="price">{units}</div></div>
          <div className="card"><h3>Avg ticket</h3><div className="price">{pSales.length ? formatNGN(Math.round(revenue / pSales.length)) : '—'}</div></div>
        </div>

        {byDay.size > 0 && (
          <table style={{ marginTop: 12 }}>
            <thead><tr><th>Date</th><th>Receipts</th><th>Revenue</th></tr></thead>
            <tbody>
              {Array.from(byDay.entries()).map(([d, r]) => (
                <tr key={d}><td>{d}</td><td>{r.receipts}</td><td><b>{formatNGN(r.revenue)}</b></td></tr>
              ))}
            </tbody>
          </table>
        )}

        {topRows.length > 0 && (
          <div>
            <h2 className="section">Top products</h2>
            <table>
              <thead><tr><th>Product</th><th>Qty</th><th>Revenue</th></tr></thead>
              <tbody>
                {topRows.map(([name, r]) => (
                  <tr key={name}><td>{name}</td><td>{r.qty}</td><td><b>{formatNGN(r.revenue)}</b></td></tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <h2 className="section">Inventory — opening → in / out = closing</h2>
        <table>
          <thead><tr><th>Product</th><th>Cartons</th><th>Rolls</th><th>Packs</th><th>Pieces</th></tr></thead>
          <tbody>
            {invRows.map(({ p, cartons, rolls, packs, pieces }) => (
              <tr key={p.id}>
                <td><b>{p.brand} {p.name}</b><div className="sub">{p.sku}</div></td>
                <td style={{ fontSize: 13 }}>{fmt(cartons)}</td>
                <td style={{ fontSize: 13 }}>{fmt(rolls)}</td>
                <td style={{ fontSize: 13 }}>{fmt(packs)}</td>
                <td style={{ fontSize: 13 }}>{fmt(pieces)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="sub">Damages: {dmg} • Returns: {ret} • in = restock + returns, out = sales + damages</p>
      </div>

      {closes.length > 0 && (
        <div className="no-print">
          <h2 className="section">Past day-closes</h2>
          <table>
            <thead><tr><th>Date</th><th>Revenue</th><th>Receipts</th><th>Units</th><th>Dmg/Ret</th></tr></thead>
            <tbody>
              {closes.map((c) => (
                <tr key={c.date + c.at}><td>{c.date}</td><td><b>{formatNGN(c.revenue)}</b></td><td>{c.receipts}</td><td>{c.units}</td><td>{c.damages}/{c.returns}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

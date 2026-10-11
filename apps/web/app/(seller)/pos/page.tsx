// Robotic inventory / POS terminal — offline-first outlet sales + stock-taking.
// Security: till opens per role. Owner (seller-account password) sees everything
// but Stock count / Damages / Returns need a fresh password unlock (15 min).
// Attendants (4-digit PIN) can only Sell + print + see history.
'use client';

import { useMemo, useRef, useState, useSyncExternalStore } from 'react';
import {
  balanceFor, getMovesServerSnapshot, getMovesSnapshot, getSalesServerSnapshot, getSalesSnapshot,
  onlineNow, pendingCount, recordMove, recordSale, subscribePos, syncOutbox,
  type MoveReason, type PosLine, type PosSale, type UnitKind,
} from '../../../lib/pos';
import {
  getInventoryServerSnapshot, getInventorySnapshot, stockLabel, subscribeInventory, type SellerProduct,
} from '../../../lib/inventory';
import {
  canSell, getApplicantsServerSnapshot, getApplicantsSnapshot, myApplicant, subscribeOnboarding,
} from '../../../lib/onboarding';
import {
  getSubServerSnapshot, getSubSnapshot, posUnlocked,
  subscribeBilling, subscription,
} from '../../../lib/billing';
import {
  addAttendant, attendantLogin, getOutletSessionServerSnapshot, getOutletSessionSnapshot,
  getStaffServerSnapshot, getStaffSnapshot, lockSensitive,
  outletLogout, outletSession, ownerLogin, removeAttendant, sensitiveUnlocked,
  subscribeStaff, unlockSensitive,
} from '../../../lib/staff';
import { formatNGN } from '../../../lib/money';

const UNITS: Array<{ key: UnitKind; label: string }> = [
  { key: 'cartons', label: 'Cartons' }, { key: 'rolls', label: 'Rolls' },
  { key: 'packs', label: 'Packs' }, { key: 'pieces', label: 'Pieces' },
];

type Tab = 'sell' | 'count' | 'damage' | 'return' | 'history' | 'staff';
const SENSITIVE: Tab[] = ['count', 'damage', 'return'];

export default function PosPage() {
  useSyncExternalStore(subscribeOnboarding, getApplicantsSnapshot, getApplicantsServerSnapshot);
  const items = useSyncExternalStore(subscribeInventory, getInventorySnapshot, getInventoryServerSnapshot);
  const sales = useSyncExternalStore(subscribePos, getSalesSnapshot, getSalesServerSnapshot);
  const moves = useSyncExternalStore(subscribePos, getMovesSnapshot, getMovesServerSnapshot);
  useSyncExternalStore(subscribeBilling, getSubSnapshot, getSubServerSnapshot);
  const staff = useSyncExternalStore(subscribeStaff, getStaffSnapshot, getStaffServerSnapshot);
  const session = useSyncExternalStore(subscribeStaff, getOutletSessionSnapshot, getOutletSessionServerSnapshot);

  const [tab, setTab] = useState<Tab>('sell');
  const [ticket, setTicket] = useState<Record<string, Record<UnitKind, number>>>({});
  const [receipt, setReceipt] = useState<PosSale | null>(null);
  const [note, setNote] = useState('');
  const [syncMsg, setSyncMsg] = useState('');
  const [online, setOnline] = useState(onlineNow());
  const [loginMode, setLoginMode] = useState<'owner' | 'attendant'>('attendant');
  const [secret, setSecret] = useState('');
  const [loginErr, setLoginErr] = useState('');
  const [unlockPw, setUnlockPw] = useState('');
  const [unlockErr, setUnlockErr] = useState('');
  const [newName, setNewName] = useState('');
  const [newPin, setNewPin] = useState('');
  const [staffMsg, setStaffMsg] = useState('');
  const charging = useRef(false);

  const me = myApplicant();
  const sub = subscription();
  const pending = pendingCount();
  const unlocked = sensitiveUnlocked();

  const openTill = () => {
    try {
      if (loginMode === 'attendant') attendantLogin(secret);
      else ownerLogin(secret);
      setSecret('');
      setLoginErr('');
    } catch (e) {
      setLoginErr((e as Error).message);
    }
  };

  const balances = useMemo(() => {
    const out: Record<string, Record<UnitKind, number>> = {};
    for (const p of items) {
      out[p.id] = balanceFor(p.sku, { cartons: p.cartons, rolls: p.rolls, packs: p.packs, pieces: p.pieces });
    }
    return out;
  }, [items, sales.length, moves.length]);

  if (!canSell()) {
    return (
      <div>
        <a href="/dashboard">← dashboard</a>
        <h1 style={{ marginTop: 8 }}>Outlet POS</h1>
        <div className="notice warn" style={{ marginTop: 12 }}>
          <b>Sellers only.</b> <a href="/join">Create your seller account</a> or <a href="/login">log in</a> — upload unlocks after Admin approval.
        </div>
      </div>
    );
  }
  if (!posUnlocked()) {
    return (
      <div>
        <a href="/dashboard">← dashboard</a>
        <h1 style={{ marginTop: 8 }}>Outlet POS</h1>
        <div className="notice warn" style={{ marginTop: 12 }}>
          <b>Subscription expired.</b> The POS suite is a paid add-on — <a href="/billing">renew your plan</a> to keep selling.
        </div>
      </div>
    );
  }

  // --- Till login: owner password opens everything, attendant PIN opens sales only.
  if (!session) {
    return (
      <div>
        <a href="/dashboard">← dashboard</a>
        <h1 style={{ marginTop: 8 }}>Open the till — {me?.businessName}</h1>
        <p className="sub">Sales staff use their 4-digit PIN (sales only). The outlet admin password opens stock, damages and returns too.</p>
        <div className="btn-row" style={{ margin: '12px 0' }}>
          <button className={`btn ${loginMode === 'attendant' ? 'btn-primary' : 'btn-outline'}`} onClick={() => { setLoginMode('attendant'); setSecret(''); setLoginErr(''); }}>Sales staff (PIN)</button>
          <button className={`btn ${loginMode === 'owner' ? 'btn-primary' : 'btn-outline'}`} onClick={() => { setLoginMode('owner'); setSecret(''); setLoginErr(''); }}>Outlet admin (password)</button>
        </div>
        <div className="card" style={{ maxWidth: 440 }}>
          <label className="field" htmlFor="till-secret">{loginMode === 'attendant' ? '4-digit PIN' : 'Owner password'}</label>
          <input id="till-secret" type="password" inputMode={loginMode === 'attendant' ? 'numeric' : undefined}
            placeholder={loginMode === 'attendant' ? '••••' : 'Seller-account password'}
            value={secret} onChange={(e) => setSecret(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') openTill(); }} />
          <div style={{ marginTop: 12 }}>
            <button className="btn btn-primary" onClick={openTill}>Open till</button>
          </div>
          {loginErr && <div className="notice warn">{loginErr}</div>}
        </div>
      </div>
    );
  }

  const isOwner = session?.role === 'owner';
  const who = session?.name ?? 'till';
  const visibleTabs: Array<{ id: Tab; label: string }> = isOwner
    ? [{ id: 'sell', label: 'Sell' }, { id: 'count', label: 'Stock count 🔒' }, { id: 'damage', label: 'Damages 🔒' }, { id: 'return', label: 'Returns 🔒' }, { id: 'history', label: 'History' }, { id: 'staff', label: 'Staff' }]
    : [{ id: 'sell', label: 'Sell' }, { id: 'history', label: 'History' }];
  const cur: Tab = visibleTabs.some((t) => t.id === tab) ? tab : 'sell';

  const bump = (id: string, u: UnitKind, d: number) =>
    setTicket((t) => ({ ...t, [id]: { ...(t[id] ?? { cartons: 0, rolls: 0, packs: 0, pieces: 0 }), [u]: Math.max(0, (t[id]?.[u] ?? 0) + d) } }));

  const ticketLines: PosLine[] = items.flatMap((p) => {
    const q = ticket[p.id];
    if (!q) return [];
    return (Object.keys(q) as UnitKind[])
      .filter((u) => q[u] > 0)
      .map((u) => ({ sku: p.sku, name: `${p.brand} ${p.name} ${p.size}`, unit: u.slice(0, -1), qty: q[u], priceKobo: p.priceKobo }));
  });
  const ticketTotal = ticketLines.reduce((n, l) => n + l.qty * l.priceKobo, 0);

  function charge() {
    if (!ticketLines.length || charging.current) return;
    charging.current = true;
    setTicket({});
    const sale = recordSale(ticketLines);
    for (const p of items) {
      const q = ticket[p.id];
      if (!q) continue;
      recordMove({
        sku: p.sku, name: `${p.brand} ${p.name}`, dCartons: -q.cartons, dRolls: -q.rolls,
        dPacks: -q.packs, dPieces: -q.pieces, reason: 'sale', note: `${sale.receiptNo} • by ${who}`,
      });
    }
    setTicket({});
    setReceipt(sale);
    setTimeout(() => { charging.current = false; }, 1500);
  }

  function adjust(p: SellerProduct, u: UnitKind, d: number, reason: MoveReason) {
    const key = { cartons: 'dCartons', rolls: 'dRolls', packs: 'dPacks', pieces: 'dPieces' }[u] as 'dCartons' | 'dRolls' | 'dPacks' | 'dPieces';
    recordMove({
      sku: p.sku, name: `${p.brand} ${p.name}`, dCartons: 0, dRolls: 0, dPacks: 0, dPieces: 0,
      [key]: reason === 'return' || reason === 'restock' ? Math.abs(d) : -Math.abs(d),
      reason, note: `${note || reason} • by ${who}`,
    });
  }

  function stocktake(p: SellerProduct, u: UnitKind, counted: number) {
    const bal = balances[p.id]?.[u] ?? 0;
    if (counted === bal) return; // no change — keep the ledger noise-free
    const key = { cartons: 'dCartons', rolls: 'dRolls', packs: 'dPacks', pieces: 'dPieces' }[u] as 'dCartons' | 'dRolls' | 'dPacks' | 'dPieces';
    recordMove({
      sku: p.sku, name: `${p.brand} ${p.name}`, dCartons: 0, dRolls: 0, dPacks: 0, dPieces: 0,
      [key]: counted - bal, reason: 'correction', note: `${note || 'stock count'} • by ${who}`,
    });
  }

  async function sync() {
    const r = await syncOutbox();
    setOnline(onlineNow());
    setSyncMsg(r.pushed ? `Synced ${r.pushed} record${r.pushed === 1 ? '' : 's'} to FMCG cloud.` : onlineNow() ? 'Everything already synced.' : 'Still offline — records are safe on this device.');
    setTimeout(() => setSyncMsg(''), 4000);
  }

  function doUnlock() {
    try {
      unlockSensitive(unlockPw);
      setUnlockPw('');
      setUnlockErr('');
    } catch (e) {
      setUnlockErr((e as Error).message);
    }
  }

  function addStaff() {
    try {
      addAttendant(newName, newPin);
      setStaffMsg(`${newName} can now open sales with PIN ${newPin}.`);
      setNewName('');
      setNewPin('');
    } catch (e) {
      setStaffMsg((e as Error).message);
    }
    setTimeout(() => setStaffMsg(''), 5000);
  }

  const stepper = (value: number, onMinus: () => void, onPlus: () => void) => (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <button className="btn btn-outline" onClick={onMinus} aria-label="minus">−</button>
      <b style={{ minWidth: 28, textAlign: 'center' }}>{value}</b>
      <button className="btn btn-outline" onClick={onPlus} aria-label="plus">+</button>
    </span>
  );

  return (
    <div>
      <a href="/dashboard">← dashboard</a>
      <h1 style={{ marginTop: 8 }}>Outlet POS — {me?.businessName}</h1>
      <p className="sub">
        <span className={`badge ${session.role === 'owner' ? 'b-green' : 'b-sky'}`}>{session.role === 'owner' ? '● Outlet admin' : `● Sales: ${session.name}`}</span>{' '}
        <span className={`badge ${online ? 'b-green' : 'b-amber'}`}>{online ? '● Online' : '○ Offline — keeps working'}</span>{' '}
        <span className="badge b-grey">{pending} queued</span>{' '}
        <span className="badge b-sky">{sub.sub?.plan === 'trial' ? `Trial • ${sub.daysLeft}d left` : `${sub.sub?.plan} • ${sub.daysLeft}d left`}</span>{' '}
        <button className="btn btn-outline" onClick={sync}>Sync now</button>{' '}
        <button className="btn btn-outline" onClick={() => { outletLogout(); lockSensitive(); }}>Lock till</button>
      </p>
      {syncMsg && <div className="notice ok">{syncMsg}</div>}

      <div className="btn-row" style={{ margin: '12px 0' }}>
        {visibleTabs.map((t) => (
          <button key={t.id} className={`btn ${cur === t.id ? 'btn-primary' : 'btn-outline'}`} onClick={() => setTab(t.id)}>{t.label}</button>
        ))}
      </div>

      {items.length === 0 && (
        <div className="notice info">No products yet — <a href="/products/new">add products</a> first, then sell them here.</div>
      )}

      {cur === 'sell' && (
        <div className="grid g2" style={{ alignItems: 'start' }}>
          <div>
            {items.map((p) => (
              <div key={p.id} className="card" style={{ marginBottom: 10 }}>
                <b>{p.brand} {p.name}</b> <span className="sub">{p.size} • {p.sku} • {formatNGN(p.priceKobo)}/{p.sellBy}</span>
                <div className="sub">Balance: <b>{stockLabel({ ...p, cartons: balances[p.id]?.cartons ?? p.cartons, rolls: balances[p.id]?.rolls ?? p.rolls, packs: balances[p.id]?.packs ?? p.packs, pieces: balances[p.id]?.pieces ?? p.pieces } as SellerProduct)}</b></div>
                <div className="grid g4" style={{ marginTop: 8 }}>
                  {UNITS.map((u) => (
                    <div key={u.key}>
                      <div className="sub">{u.label}</div>
                      {stepper(ticket[p.id]?.[u.key] ?? 0, () => bump(p.id, u.key, -1), () => bump(p.id, u.key, 1))}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="card">
            <h3>Ticket {ticketLines.length ? `(${ticketLines.length} lines)` : ''}</h3>
            {ticketLines.length === 0 && <p className="sub">Tap + on any unit to build the sale.</p>}
            {ticketLines.map((l, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                <span>{l.qty} × {l.name} ({l.unit})</span><b>{formatNGN(l.qty * l.priceKobo)}</b>
              </div>
            ))}
            <div className="price" style={{ marginTop: 8 }}>Total: {formatNGN(ticketTotal)}</div>
            <div style={{ marginTop: 12 }}>
              <button className="btn btn-primary" disabled={!ticketLines.length} onClick={charge}>Charge {formatNGN(ticketTotal)} + print</button>
            </div>
          </div>
        </div>
      )}

      {SENSITIVE.includes(cur) && !unlocked && (
        <div className="card" style={{ maxWidth: 480 }}>
          <h3>🔒 {cur === 'count' ? 'Stock count' : cur === 'damage' ? 'Damages' : 'Returns'} — outlet admin only</h3>
          <p className="sub">Nobody can interfere with inventory. Enter the outlet admin (seller-account) password to unlock for 15 minutes.</p>
          <label className="field" htmlFor="unlock">Owner password</label>
          <input id="unlock" type="password" value={unlockPw} onChange={(e) => setUnlockPw(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') doUnlock(); }} />
          <div style={{ marginTop: 12 }}>
            <button className="btn btn-primary" onClick={doUnlock}>Unlock {cur === 'count' ? 'stock count' : cur}</button>
          </div>
          {unlockErr && <div className="notice warn">{unlockErr}</div>}
        </div>
      )}

      {SENSITIVE.includes(cur) && unlocked && (cur === 'count' || cur === 'damage' || cur === 'return') && (
        <div>
          <div className="notice ok">Unlocked for inventory — {session.name}. <button className="btn btn-outline" onClick={() => lockSensitive()}>Lock now</button></div>
          <label className="field" htmlFor="note">Note (reason / batch)</label>
          <input id="note" placeholder="e.g. evening count, broken in transit, customer return" value={note} onChange={(e) => setNote(e.target.value)} style={{ maxWidth: 520 }} />
          {items.map((p) => (
            <CountRow key={p.id} p={p} bal={balances[p.id]} mode={cur as 'count' | 'damage' | 'return'} stepper={stepper} adjust={adjust} stocktake={stocktake} />
          ))}
        </div>
      )}

      {cur === 'history' && (
        <div className="grid g2" style={{ alignItems: 'start' }}>
          <div>
            <h2 className="section">Sales records ({sales.length})</h2>
            {sales.map((s) => (
              <div key={s.id} className="card" style={{ marginBottom: 8 }}>
                <b>{s.receiptNo}</b> • {formatNGN(s.totalKobo)} • {new Date(s.at).toLocaleString()}
                <div className="sub">{s.items.map((i) => `${i.qty}× ${i.name}`).join('; ')}</div>
                <div className="btn-row" style={{ marginTop: 8 }}>
                  <span className={`badge ${s.synced ? 'b-green' : 'b-amber'}`}>{s.synced ? 'synced' : 'on device'}</span>
                  <button className="btn btn-outline" onClick={() => setReceipt(s)}>Reprint</button>
                </div>
              </div>
            ))}
          </div>
          <div>
            <h2 className="section">Damages & returns ({moves.filter((m) => m.reason === 'damage' || m.reason === 'return').length})</h2>
            {isOwner || unlocked ? moves.filter((m) => m.reason === 'damage' || m.reason === 'return').map((m) => (
              <div key={m.id} className="card" style={{ marginBottom: 8 }}>
                <span className={`badge ${m.reason === 'damage' ? 'b-red' : 'b-sky'}`}>{m.reason}</span>{' '}
                <b>{m.name}</b>
                <div className="sub">{[m.dCartons && `${m.dCartons} cartons`, m.dRolls && `${m.dRolls} rolls`, m.dPacks && `${m.dPacks} packs`, m.dPieces && `${m.dPieces} pcs`].filter(Boolean).join(' • ')}{m.note ? ` — ${m.note}` : ''}</div>
              </div>
            )) : <p className="sub">Damages & returns are visible to the outlet admin only.</p>}
          </div>
        </div>
      )}

      {cur === 'staff' && isOwner && (
        <div>
          <h2 className="section">Sales personnel</h2>
          <p className="sub">PINs open <b>sales only</b> — staff can never touch stock, damages or returns.</p>
          <div className="card" style={{ maxWidth: 560 }}>
            <div className="form-row">
              <div>
                <label className="field" htmlFor="sname">Staff name</label>
                <input id="sname" placeholder="e.g. Ngozi (morning shift)" value={newName} onChange={(e) => setNewName(e.target.value)} />
              </div>
              <div>
                <label className="field" htmlFor="spin">4-digit PIN</label>
                <input id="spin" inputMode="numeric" placeholder="e.g. 2410" value={newPin} onChange={(e) => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 4))} />
              </div>
            </div>
            <div style={{ marginTop: 12 }}>
              <button className="btn btn-primary" onClick={addStaff}>Create PIN</button>
            </div>
            {staffMsg && <div className="notice ok">{staffMsg}</div>}
          </div>
          <table style={{ marginTop: 12 }}>
            <thead><tr><th>Name</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>
              {staff.map((a) => (
                <tr key={a.id}>
                  <td><b>{a.name}</b><div className="sub">PIN sales only</div></td>
                  <td><span className="badge b-green">active</span></td>
                  <td><button className="btn btn-outline" onClick={() => removeAttendant(a.id)}>Remove</button></td>
                </tr>
              ))}
            </tbody>
          </table>
          {staff.length === 0 && <p className="sub">No sales staff yet.</p>}
        </div>
      )}

      {receipt && (
        <div className="card" style={{ marginTop: 16 }}>
          <div className="print-area">
            <h3 style={{ textAlign: 'center' }}>{me?.businessName}</h3>
            <p className="sub" style={{ textAlign: 'center' }}>{me?.addressLine1}, {me?.area} • {me?.phone}</p>
            <p style={{ textAlign: 'center' }}><b>Receipt {receipt.receiptNo}</b> • {new Date(receipt.at).toLocaleString()} • served by {session.name}</p>
            <hr />
            {receipt.items.map((i, k) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                <span>{i.qty} × {i.name} ({i.unit})</span><span>{formatNGN(i.qty * i.priceKobo)}</span>
              </div>
            ))}
            <hr />
            <div className="price" style={{ textAlign: 'right' }}>TOTAL: {formatNGN(receipt.totalKobo)}</div>
            <p className="sub" style={{ textAlign: 'center' }}>Thank you — FMCG Open Market</p>
          </div>
          <div className="btn-row no-print" style={{ marginTop: 12 }}>
            <button className="btn btn-primary" onClick={() => window.print()}>Print receipt</button>
            <button className="btn btn-outline" onClick={() => setReceipt(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

function CountRow({ p, bal, mode, stepper, adjust, stocktake }: {
  p: SellerProduct; bal: Record<UnitKind, number> | undefined; mode: 'count' | 'damage' | 'return';
  stepper: (v: number, minus: () => void, plus: () => void) => React.ReactNode;
  adjust: (p: SellerProduct, u: UnitKind, d: number, r: 'damage' | 'return') => void;
  stocktake: (p: SellerProduct, u: UnitKind, counted: number) => void;
}) {
  const [vals, setVals] = useState<Record<UnitKind, number>>({ cartons: 0, rolls: 0, packs: 0, pieces: 0 });
  const bump = (u: UnitKind, d: number) => setVals((v) => ({ ...v, [u]: Math.max(0, v[u] + d) }));
  const labels = { cartons: 'Cartons', rolls: 'Rolls', packs: 'Packs', pieces: 'Pieces' } as Record<UnitKind, string>;
  return (
    <div className="card" style={{ marginBottom: 10 }}>
      <b>{p.brand} {p.name}</b> <span className="sub">{p.sku}</span>
      <div className="sub">Balance: cartons <b>{bal?.cartons ?? p.cartons}</b> • rolls <b>{bal?.rolls ?? p.rolls}</b> • packs <b>{bal?.packs ?? p.packs}</b> • pieces <b>{bal?.pieces ?? p.pieces}</b></div>
      <div className="grid g4" style={{ marginTop: 8 }}>
        {(Object.keys(labels) as UnitKind[]).map((u) => (
          <div key={u}>
            <div className="sub">{mode === 'count' ? `Counted ${labels[u]}` : `${labels[u]} ${mode === 'damage' ? 'damaged' : 'returned'}`}</div>
            {stepper(vals[u], () => bump(u, -1), () => bump(u, 1))}
          </div>
        ))}
      </div>
      <div style={{ marginTop: 8 }}>
        {mode === 'count' && (
          <button className="btn btn-primary" onClick={() => {
            (Object.keys(labels) as UnitKind[]).forEach((u) => stocktake(p, u, vals[u]));
            setVals({ cartons: 0, rolls: 0, packs: 0, pieces: 0 });
          }}>Save count</button>
        )}
        {mode !== 'count' && (
          <button className="btn btn-primary" onClick={() => {
            (Object.keys(labels) as UnitKind[]).forEach((u) => { if (vals[u] > 0) adjust(p, u, vals[u], mode); });
            setVals({ cartons: 0, rolls: 0, packs: 0, pieces: 0 });
          }}>Record {mode}</button>
        )}
      </div>
    </div>
  );
}


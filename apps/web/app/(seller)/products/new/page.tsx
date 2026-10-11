'use client';

import { useMemo, useState, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import {
  KNOWN_BRANDS, loadInventory, newProduct, skuTaken, suggestSku, upsertProduct,
} from '../../../../lib/inventory';
import {
  canSell, getApplicantsServerSnapshot, getApplicantsSnapshot, myApplicant, subscribeOnboarding,
} from '../../../../lib/onboarding';
import { formatNGN } from '../../../../lib/money';

type SellBy = 'carton' | 'pack' | 'roll' | 'piece';

export default function NewProductPage() {
  const router = useRouter();
  useSyncExternalStore(subscribeOnboarding, getApplicantsSnapshot, getApplicantsServerSnapshot);
  const [form, setForm] = useState(newProduct());
  const [error, setError] = useState('');
  const [done, setDone] = useState('');

  if (!canSell()) {
    const me = myApplicant();
    return (
      <div>
        <a href="/dashboard">← dashboard</a>
        <h1 style={{ marginTop: 8 }}>Add a product</h1>
        <div className="notice warn" style={{ marginTop: 12 }}>
          <b>Locked.</b>{' '}
          {!me && <>Only registered sellers can add products. <a href="/join">Create your seller account</a> or <a href="/login">log in</a>.</>}
          {!!me && me.status === 'pending' && <>Your application is under review — upload unlocks once Admin approves and you log in.</>}
          {!!me && me.status !== 'pending' && me.status !== 'approved' && <>Your application needs attention ({me.status}).</>}
        </div>
      </div>
    );
  }

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const autoSku = useMemo(
    () => suggestSku(form.brand || 'Product', form.size || form.category, form.category),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [form.brand, form.size, form.category],
  );

  const num = (v: string) => Math.max(0, Math.floor(Number(v) || 0));

  function validate(): string {
    if (!form.brand.trim()) return 'Brand is required (e.g. Indomie).';
    if (!form.name.trim()) return 'Product name is required.';
    if (!form.size.trim()) return 'Size is required (e.g. 40×70g, 5L, 2kg).';
    const sku = form.sku.trim() || autoSku;
    if (skuTaken(loadInventory(), sku)) return `SKU ${sku} already exists — pick another.`;
    if (!(form.priceKobo > 0)) return 'Selling price must be above ₦0.';
    if (form.cartons + form.rolls + form.packs + form.pieces <= 0)
      return 'Enter stock in at least one of cartons, rolls, packs or pieces.';
    return '';
  }

  function submit(publish: boolean) {
    const err = validate();
    if (err) { setError(err); setDone(''); return; }
    const me = myApplicant();
    const saved = {
      ...form,
      brand: form.brand.trim(), name: form.name.trim(), size: form.size.trim(),
      sku: form.sku.trim() || autoSku,
      sellerName: me?.businessName ?? 'Verified seller',
      sellerArea: me?.area ?? 'Mile 12 / Ketu',
      sellerLat: me?.lat ?? '6.6044',
      sellerLng: me?.lng ?? '3.3912',
      status: (publish ? 'live' : 'draft') as 'live' | 'draft',
    };
    upsertProduct(saved);
    setDone(publish
      ? `“${saved.name}” is LIVE — buyers can see it in Search now.`
      : `“${saved.name}” saved as draft — press “Make live” on the dashboard when ready.`);
    setError('');
    if (publish) setTimeout(() => router.push('/dashboard'), 1200);
  }

  const qty = (label: string, hint: string, value: number, onChange: (n: number) => void) => (
    <div>
      <label className="field">{label}</label>
      <input type="number" min={0} value={value} onChange={(e) => onChange(num(e.target.value))} />
      <div className="sub" style={{ fontSize: 12 }}>{hint}</div>
    </div>
  );

  return (
    <div>
      <a href="/dashboard">← dashboard</a>
      <h1 style={{ marginTop: 8 }}>Add a product</h1>
      <p className="sub">Fill brand → name → size → stock. Save as draft, or publish straight to buyers.</p>

      <div className="card" style={{ marginTop: 12, maxWidth: 680 }}>
        <div className="kicker">Step 1 · What is it?</div>
        <div className="form-row">
          <div>
            <label className="field" htmlFor="brand">Brand *</label>
            <input id="brand" list="brands" placeholder="e.g. Indomie" value={form.brand}
              onChange={(e) => set('brand', e.target.value)} />
            <datalist id="brands">{KNOWN_BRANDS.map((b) => <option key={b} value={b} />)}</datalist>
          </div>
          <div>
            <label className="field" htmlFor="cat">Category</label>
            <select id="cat" value={form.category} onChange={(e) => set('category', e.target.value)}>
              <option>Groceries</option><option>Beverages</option><option>Household</option>
            </select>
          </div>
        </div>
        <label className="field" htmlFor="name">Product name *</label>
        <input id="name" placeholder="e.g. Instant Noodles" value={form.name}
          onChange={(e) => set('name', e.target.value)} />
        <div className="form-row">
          <div>
            <label className="field" htmlFor="size">Size / variant *</label>
            <input id="size" placeholder="e.g. 40×70g, 5L, 2kg" value={form.size}
              onChange={(e) => set('size', e.target.value)} />
          </div>
          <div>
            <label className="field" htmlFor="sku">SKU {form.sku ? '' : <span className="sub">(auto: {autoSku})</span>}</label>
            <input id="sku" placeholder={autoSku} value={form.sku}
              onChange={(e) => set('sku', e.target.value.toUpperCase().replace(/\s+/g, ''))} />
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 12, maxWidth: 680 }}>
        <div className="kicker">Step 2 · How much stock?</div>
        <div className="form-row">
          <div>
            <label className="field" htmlFor="sellby">I sell by</label>
            <select id="sellby" value={form.sellBy}
              onChange={(e) => set('sellBy', e.target.value as SellBy)}>
              <option value="carton">Carton (bulk)</option>
              <option value="pack">Pack</option>
              <option value="roll">Roll</option>
              <option value="piece">Piece (retail)</option>
            </select>
          </div>
          <div>
            <label className="field" htmlFor="moq">Minimum order (MOQ)</label>
            <input id="moq" type="number" min={1} value={form.moq}
              onChange={(e) => set('moq', Math.max(1, num(e.target.value)))} />
          </div>
        </div>
        <div className="grid g4" style={{ marginTop: 4 }}>
          {qty('Cartons', 'Big boxes', form.cartons, (n) => set('cartons', n))}
          {qty('Rolls', 'Tissue, towels…', form.rolls, (n) => set('rolls', n))}
          {qty('Packs', 'Bundles', form.packs, (n) => set('packs', n))}
          {qty('Pieces', 'Single units', form.pieces, (n) => set('pieces', n))}
        </div>
      </div>

      <div className="card" style={{ marginTop: 12, maxWidth: 680 }}>
        <div className="kicker">Step 3 · Price it</div>
        <div className="form-row">
          <div>
            <label className="field" htmlFor="price">Price per {form.sellBy} (₦) *</label>
            <input id="price" type="number" min={0} placeholder="e.g. 6500" value={form.priceKobo / 100 || ''}
              onChange={(e) => set('priceKobo', Math.round((Number(e.target.value) || 0) * 100))} />
          </div>
          <div>
            <label className="field">Preview</label>
            <div className="price" style={{ marginTop: 10 }}>
              {form.priceKobo > 0 ? formatNGN(form.priceKobo) : '—'} <small>/ {form.sellBy}</small>
            </div>
          </div>
        </div>
        <div className="btn-row" style={{ marginTop: 16 }}>
          <button className="btn btn-outline" onClick={() => submit(false)}>Save as draft</button>
          <button className="btn btn-primary" onClick={() => submit(true)}>Publish — make it live</button>
        </div>
        {error && <div className="notice warn">{error}</div>}
        {done && <div className="notice ok">{done}</div>}
      </div>
    </div>
  );
}

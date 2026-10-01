'use client';

import { useState } from 'react';

export default function NewProductPage() {
  const [breaks, setBreaks] = useState([{ minQty: 10, price: '' }]);
  const [saved, setSaved] = useState(false);
  return (
    <div>
      <a href="/dashboard">← dashboard</a>
      <h1 style={{ marginTop: 8 }}>Add SKU</h1>
      <p className="sub">Unit types + conversion + bulk breaks + MOQ. Links to a canonical product for alternative-seller matching.</p>
      <form
        className="card"
        onSubmit={(e) => { e.preventDefault(); setSaved(true); }}
        style={{ marginTop: 12, maxWidth: 640 }}
      >
        <label className="field" htmlFor="name">Product name</label>
        <input id="name" required placeholder="e.g. Indomie Instant Noodles — Carton (40×70g)" />
        <div className="form-row">
          <div>
            <label className="field" htmlFor="brand">Brand</label>
            <input id="brand" placeholder="Indomie" />
          </div>
          <div>
            <label className="field" htmlFor="cat">Category</label>
            <select id="cat"><option>Groceries</option><option>Beverages</option><option>Household</option></select>
          </div>
        </div>
        <label className="field">Unit types offered</label>
        <div style={{ display: 'flex', gap: 12, fontSize: 14 }}>
          <label><input type="checkbox" style={{ width: 'auto' }} defaultChecked /> piece</label>
          <label><input type="checkbox" style={{ width: 'auto' }} defaultChecked /> pack</label>
          <label><input type="checkbox" style={{ width: 'auto' }} defaultChecked /> carton</label>
        </div>
        <div className="form-row">
          <div>
            <label className="field" htmlFor="price">Base price (₦, per base unit)</label>
            <input id="price" type="number" required placeholder="12500" />
          </div>
          <div>
            <label className="field" htmlFor="moq">MOQ</label>
            <input id="moq" type="number" defaultValue={2} min={1} />
          </div>
        </div>
        <label className="field">Bulk price breaks</label>
        {breaks.map((b, i) => (
          <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <input type="number" placeholder="Min qty" value={b.minQty} onChange={(e) => {
              const n = [...breaks]; n[i].minQty = Number(e.target.value); setBreaks(n);
            }} aria-label="Min qty" />
            <input placeholder="Price ₦" value={b.price} onChange={(e) => {
              const n = [...breaks]; n[i].price = e.target.value; setBreaks(n);
            }} aria-label="Break price" />
            <button type="button" className="btn btn-outline" onClick={() => setBreaks(breaks.filter((_, j) => j !== i))}>✕</button>
          </div>
        ))}
        <button type="button" className="btn btn-outline" onClick={() => setBreaks([...breaks, { minQty: 50, price: '' }])}>
          + Add break
        </button>
        <label className="field" htmlFor="canon">Canonical link</label>
        <select id="canon">
          <option>Link to existing canonical: Indomie 70g carton</option>
          <option>Request new canonical (admin moderation queue)</option>
        </select>
        <div style={{ marginTop: 16 }}>
          <button className="btn btn-primary" type="submit">Publish SKU</button>
        </div>
        {saved && <div className="notice ok">SKU draft saved — pending canonical approval, then it goes live.</div>}
      </form>
    </div>
  );
}

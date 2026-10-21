// Seller photo uploader — carton / pack / product shots per SKU.
// Photos are compressed in the browser; the first one is the cover.
'use client';

import { useRef, useState } from 'react';
import { MAX_IMAGES, compressImage, dataUrlKb } from '../lib/images';

export default function ProductImageUploader({ images, onChange }: {
  images: string[];
  onChange: (next: string[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  async function pick(files: FileList | null) {
    if (!files || !files.length) return;
    setBusy(true);
    setErr('');
    const next = [...images];
    for (const f of Array.from(files)) {
      if (next.length >= MAX_IMAGES) break;
      if (!f.type.startsWith('image/')) { setErr('Only image files (JPG/PNG) can be uploaded.'); continue; }
      try {
        next.push(await compressImage(f));
      } catch (e) {
        setErr((e as Error).message);
      }
    }
    onChange(next);
    setBusy(false);
    if (inputRef.current) inputRef.current.value = '';
  }

  const remove = (i: number) => onChange(images.filter((_, k) => k !== i));
  const makeCover = (i: number) => {
    const copy = [...images];
    const [x] = copy.splice(i, 1);
    onChange([x, ...copy]);
  };

  const totalKb = images.reduce((n, d) => n + dataUrlKb(d), 0);

  return (
    <div>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        {images.map((src, i) => (
          <div key={i} style={{ position: 'relative', width: 108 }}>
            <img src={src} alt={`Product photo ${i + 1}`}
              style={{ width: 108, height: 108, objectFit: 'cover', borderRadius: 10, border: i === 0 ? '2.5px solid var(--primary)' : '1px solid var(--line)', display: 'block' }} />
            {i === 0 && <span className="badge b-green" style={{ position: 'absolute', left: 6, top: 6 }}>Cover</span>}
            <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
              {i !== 0 && <button type="button" className="btn btn-outline" style={{ padding: '4px 8px', fontSize: 12 }} onClick={() => makeCover(i)}>Set cover</button>}
              <button type="button" className="btn btn-outline" style={{ padding: '4px 8px', fontSize: 12 }} onClick={() => remove(i)}>✕</button>
            </div>
          </div>
        ))}
        {images.length < MAX_IMAGES && (
          <button type="button" onClick={() => inputRef.current?.click()} disabled={busy}
            style={{ width: 108, height: 108, borderRadius: 10, border: '2px dashed var(--line)', background: '#fff', cursor: 'pointer', color: 'var(--muted)', fontSize: 13, fontWeight: 600 }}>
            {busy ? 'Processing…' : '+ Add photo'}
          </button>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/*" multiple hidden onChange={(e) => pick(e.target.files)} />
      <div className="sub" style={{ marginTop: 6 }}>
        Up to {MAX_IMAGES} photos — carton shot, pack shot, shelf shot. First photo is the cover buyers see. ({images.length}/{MAX_IMAGES} • {totalKb} KB)
      </div>
      {err && <div className="notice warn">{err}</div>}
    </div>
  );
}

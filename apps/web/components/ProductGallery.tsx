// Buyer-facing product gallery — big cover, swipeable thumbnails, soft backdrop.
'use client';

import { useState } from 'react';

export default function ProductGallery({ images, title, emoji, badge }: {
  images: string[]; title: string; emoji?: string; badge?: string;
}) {
  const [active, setActive] = useState(0);
  const list = images.filter(Boolean);

  if (!list.length) {
    return (
      <div className="gallery">
        <div className="gallery-cover gallery-empty">
          <span style={{ fontSize: 64 }}>{emoji ?? '📦'}</span>
          <div className="sub" style={{ marginTop: 8 }}>No photo yet — seller is preparing shots</div>
        </div>
      </div>
    );
  }

  const cur = Math.min(active, list.length - 1);
  return (
    <div className="gallery">
      <div className="gallery-cover">
        <img src={list[cur]} alt={title} />
        {badge && <span className="gallery-badge">{badge}</span>}
      </div>
      {list.length > 1 && (
        <div className="gallery-thumbs">
          {list.map((src, i) => (
            <button key={i} type="button" className={`gallery-thumb${i === cur ? ' on' : ''}`} onClick={() => setActive(i)}>
              <img src={src} alt={`${title} photo ${i + 1}`} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

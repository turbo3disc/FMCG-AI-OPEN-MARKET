// Buyer area picker — remembers the buyer's location across visits.
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LAGOS_AREAS } from '../lib/geo';
import { buyerArea, setBuyerArea } from '../lib/buyer';

export default function AreaMemory({ param }: { param: string }) {
  const router = useRouter();
  const [area, setArea] = useState(param);

  useEffect(() => {
    // No explicit ?area= in the URL and we remember one → jump to it.
    const hasParam = new URLSearchParams(window.location.search).has('area');
    if (!hasParam) {
      const remembered = buyerArea();
      if (remembered !== param) {
        const sp = new URLSearchParams(window.location.search);
        sp.set('area', remembered);
        router.replace(`/search?${sp.toString()}`);
        return;
      }
    }
    setBuyerArea(param);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function change(v: string) {
    setArea(v);
    setBuyerArea(v);
    const sp = new URLSearchParams(window.location.search);
    sp.set('area', v);
    router.push(`/search?${sp.toString()}`);
  }

  return (
    <select name="area" value={area} onChange={(e) => change(e.target.value)} aria-label="My area">
      {LAGOS_AREAS.map((a) => <option key={a.area} value={a.area}>{a.area}</option>)}
    </select>
  );
}

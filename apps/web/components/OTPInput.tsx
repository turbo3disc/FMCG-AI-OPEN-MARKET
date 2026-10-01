'use client';

import { useState } from 'react';

export default function OTPInput({ length = 6, onDone }: { length?: number; onDone?: (code: string) => void }) {
  const [digits, setDigits] = useState<string[]>(Array(length).fill(''));
  const set = (i: number, v: string) => {
    const d = v.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[i] = d;
    setDigits(next);
    if (next.every((x) => x !== '') && onDone) onDone(next.join(''));
  };
  return (
    <div className="otp" aria-label="Delivery OTP">
      {digits.map((d, i) => (
        <input
          key={i}
          value={d}
          inputMode="numeric"
          maxLength={1}
          aria-label={`Digit ${i + 1}`}
          onChange={(e) => set(i, e.target.value)}
        />
      ))}
    </div>
  );
}

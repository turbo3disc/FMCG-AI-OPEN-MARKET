// Product photo helpers — compress uploads in the browser so the outlet
// device stays light and the demo store fits in localStorage.
'use client';

export const MAX_IMAGES = 4;
export const MAX_DIM = 900;
export const JPEG_QUALITY = 0.72;

/** Read a picked file, downscale + re-encode as JPEG data URL. */
export async function compressImage(file: File): Promise<string> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(new Error('Could not read that file.'));
    r.readAsDataURL(file);
  });

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const im = new Image();
    im.onload = () => resolve(im);
    im.onerror = () => reject(new Error('That file is not a readable image.'));
    im.src = dataUrl;
  });

  const scale = Math.min(1, MAX_DIM / Math.max(img.width, img.height));
  const w = Math.max(1, Math.round(img.width * scale));
  const h = Math.max(1, Math.round(img.height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return dataUrl;
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(img, 0, 0, w, h);
  return canvas.toDataURL('image/jpeg', JPEG_QUALITY);
}

/** Rough storage size of a data URL in KB. */
export function dataUrlKb(dataUrl: string): number {
  return Math.round((dataUrl.length * 0.75) / 1024);
}

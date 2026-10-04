// Smart routing: cloud LLM (Groq free tier / Neon Gateway) when a key exists,
// Ollama local when running, else null → deterministic rule fallbacks.
// Nothing here ever moves money or stock; outputs always need human confirm.

import type { VendorAdapter } from './types.js';
import { ollamaAdapter } from './vendors/ollama.js';
import { openaiCompatAdapter, openaiCompatAvailable } from './vendors/openaiCompat.js';

export async function pickAdapter(explicit?: VendorAdapter): Promise<VendorAdapter | null> {
  if (explicit) return explicit;
  const p = (process.env.AI_PROVIDER ?? 'auto').toLowerCase();
  if (['groq', 'gateway', 'openai', 'openai-compat'].includes(p)) {
    return openaiCompatAvailable() ? openaiCompatAdapter : null;
  }
  if (p === 'ollama') return (await ollamaAdapter.isAvailable()) ? ollamaAdapter : null;
  if (openaiCompatAvailable()) return openaiCompatAdapter;
  if (await ollamaAdapter.isAvailable().catch(() => false)) return ollamaAdapter;
  return null;
}

/** Pull the first {...} JSON object out of model chatter. */
export function extractJson(text: string): Record<string, unknown> {
  const m = text.match(/\{[\s\S]*\}/);
  if (!m) throw new Error('no JSON in model output');
  return JSON.parse(m[0]) as Record<string, unknown>;
}

export const asUnit = (v: unknown, fb: 'piece' | 'pack' | 'carton'): 'piece' | 'pack' | 'carton' =>
  v === 'piece' || v === 'pack' || v === 'carton' ? v : fb;

export const asPosInt = (v: unknown, fb: number): number =>
  typeof v === 'number' && Number.isInteger(v) && v > 0 ? v : fb;

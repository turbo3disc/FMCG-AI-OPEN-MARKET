// Ollama local adapter — free/open-weights dev default (Phase 7).
// No external deps; uses global fetch. Model: llama3.1 on http://localhost:11434.

import type { CompleteOpts, CompleteResult, VendorAdapter } from '../types.js';

const BASE = process.env.OLLAMA_HOST ?? 'http://localhost:11434';
const MODEL = process.env.OLLAMA_MODEL ?? 'llama3.1';

export async function isAvailable(): Promise<boolean> {
  try {
    const res = await fetch(`${BASE}/api/tags`, { signal: AbortSignal.timeout(3000) });
    return res.ok;
  } catch {
    return false;
  }
}

export async function complete(prompt: string, opts: CompleteOpts = {}): Promise<CompleteResult> {
  const res = await fetch(`${BASE}/api/generate`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      model: MODEL,
      prompt,
      stream: false,
      options: {
        temperature: opts.temperature ?? 0.2,
        num_predict: opts.maxTokens ?? 512,
      },
    }),
    signal: opts.signal,
  });
  if (!res.ok) throw new Error(`ollama generate failed: ${res.status}`);
  const body = (await res.json()) as { response?: string };
  return { text: body.response ?? '', model: `ollama/${MODEL}`, confidence: 0.5 };
}

export const ollamaAdapter: VendorAdapter = { name: 'ollama', complete, isAvailable };

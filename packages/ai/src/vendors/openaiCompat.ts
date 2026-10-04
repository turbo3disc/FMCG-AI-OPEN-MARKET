// OpenAI-compatible chat-completions adapter — one file for Groq, Neon AI
// Gateway, OpenAI, or any /v1-compatible endpoint. Chosen by environment:
//   AI_PROVIDER=groq|gateway|openai   (default: auto)
//   AI_BASE_URL — e.g. https://api.groq.com/openai/v1 (groq),
//                 https://<branch>-api.ai.<region>.aws.neon.tech/v1 (gateway)
//   AI_API_KEY  — Groq key (free tier, no card) or NEON_AI_GATEWAY_TOKEN
//   AI_MODEL    — e.g. llama-3.1-8b-instant (groq), claude-haiku-4-5 (gateway)
// No external deps; uses global fetch.

import type { CompleteOpts, CompleteResult, VendorAdapter } from '../types.js';

const PRESETS: Record<string, { base: string; model: string }> = {
  groq: { base: 'https://api.groq.com/openai/v1', model: 'llama-3.1-8b-instant' },
  openai: { base: 'https://api.openai.com/v1', model: 'gpt-4o-mini' },
};

function resolveBase(): string {
  if (process.env.AI_BASE_URL) return process.env.AI_BASE_URL.replace(/\/$/, '');
  const p = (process.env.AI_PROVIDER ?? '').toLowerCase();
  if (PRESETS[p]) return PRESETS[p].base;
  return PRESETS.groq.base; // cheapest default: Groq free tier
}

function resolveModel(): string {
  if (process.env.AI_MODEL) return process.env.AI_MODEL;
  const p = (process.env.AI_PROVIDER ?? '').toLowerCase();
  if (PRESETS[p]) return PRESETS[p].model;
  return PRESETS.groq.model;
}

export function openaiCompatAvailable(): boolean {
  return Boolean(process.env.AI_API_KEY);
}

export interface ChatOpts extends CompleteOpts {
  system?: string;
  json?: boolean;
}

export async function complete(prompt: string, opts: CompleteOpts = {}): Promise<CompleteResult> {
  const o = opts as ChatOpts;
  const res = await fetch(`${resolveBase()}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.AI_API_KEY ?? ''}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: resolveModel(),
      messages: [
        { role: 'system', content: o.system ?? 'You are a precise FMCG marketplace assistant. Reply with JSON only.' },
        { role: 'user', content: prompt },
      ],
      temperature: o.temperature ?? 0,
      max_tokens: o.maxTokens ?? 512,
      ...(o.json ? { response_format: { type: 'json_object' } } : {}),
    }),
    signal: o.signal,
  });
  if (!res.ok) throw new Error(`ai gateway failed: ${res.status}`);
  const body = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
  return { text: body.choices?.[0]?.message?.content ?? '', model: `compat/${resolveModel()}`, confidence: 0.85 };
}

export const openaiCompatAdapter: VendorAdapter = { name: 'openai-compat', complete, isAvailable: () => Promise.resolve(openaiCompatAvailable()) };

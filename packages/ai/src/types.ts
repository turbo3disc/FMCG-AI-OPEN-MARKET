// @fmcg/ai — shared task + vendor types (ADR-0009).
// Money: integer kobo. All high-impact outputs require human confirmation.

export type UnitType = 'piece' | 'pack' | 'carton';

export interface CompleteOpts {
  maxTokens?: number;
  temperature?: number;
  /** Hint that the caller wants JSON back (adapters enforce via prompting). */
  json?: boolean;
  signal?: AbortSignal;
}

export interface CompleteResult {
  text: string;
  model: string;
  /** 0..1. Rule-based adapters return heuristic scores; vendors return self-reported or 0.5. */
  confidence: number;
}

/** Vendor adapter every AI provider must implement. Swapped via env, never via business logic. */
export interface VendorAdapter {
  name: string;
  complete(prompt: string, opts?: CompleteOpts): Promise<CompleteResult>;
  /** Returns false when the vendor is unreachable (e.g. Ollama not running). */
  isAvailable(): Promise<boolean>;
}

/** Generic task envelope: input in, human-confirmable output out. */
export interface TaskInput {
  /** Raw user text for the task (query, keywords, chat transcript, etc.). */
  text: string;
}

export interface TaskOutput<T> {
  data: T;
  /** 0..1 confidence shown in UI next to the result. */
  confidence: number;
  /** Always true for P1 tasks: seller/buyer must confirm before anything touches money/stock. */
  needsConfirm: true;
  /** Human-readable paraphrase shown in UI and stored in audit log. Editable by user. */
  interpretation: string;
  model: string;
}

// --- Task payloads (mirrors packages/shared money/unit conventions) ---

export interface ParsedSearch {
  q: string;
  qty: number;
  unit_type: UnitType;
  radius_km: number;
  max_price_kobo: number | null;
}

export interface ListingDraft {
  title: string;
  description: string;
  tags: string[];
  suggestedCategory: string;
  /** Always true: seller must publish explicitly. */
  draft: true;
}

export interface ThreadSummary {
  product: string;
  quantity: number;
  price_kobo: number | null;
  delivery: string | null;
}

export interface ReorderItem {
  canonicalOrOfferId: string;
  name: string;
  suggestedQty: number;
  unit_type: UnitType;
  reason: string;
}

export interface OrderLine {
  itemId: string;
  name: string;
  qty: number;
  unit_type: UnitType;
  lastOrderedAt?: string;
}

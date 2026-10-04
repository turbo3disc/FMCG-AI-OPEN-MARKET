// draftListing — seller keywords/images-meta → draft listing (seller must publish).

import type { ListingDraft, TaskOutput, VendorAdapter } from '../types.js';
import { extractJson, pickAdapter } from '../smart.js';

export interface DraftListingInput {
  keywords: string;
  imageMeta?: string[];
  categoryHint?: string;
}

const CATEGORY_RULES: Array<[RegExp, string]> = [
  [/indomie|spaghetti|noodle|rice|sugar|flour|maggi|knorr|oil|milo|milk|tea|cocoa/i, 'groceries'],
  [/coke|water|juice|eva|aqua|drink|beverage|malt|fanta|sprite/i, 'beverages'],
  [/soap|detergent|tissue|diaper|toothpaste|omo|sunlight|dettol/i, 'household essentials'],
];

function guessCategory(text: string, hint?: string): string {
  if (hint) return hint;
  for (const [re, cat] of CATEGORY_RULES) if (re.test(text)) return cat;
  return 'groceries';
}

function titleFrom(keywords: string): string {
  const words = keywords.split(/[\s,;]+/).filter((w) => w.length > 1).slice(0, 8);
  return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

export function ruleDraft(input: DraftListingInput): TaskOutput<ListingDraft> {
  const { keywords, imageMeta = [], categoryHint } = input;
  const suggestedCategory = guessCategory(`${keywords} ${imageMeta.join(' ')}`, categoryHint);
  const title = titleFrom(keywords) || 'Untitled product';
  const tags = keywords.toLowerCase().split(/[\s,;]+/).filter((w, i, a) => w.length > 2 && a.indexOf(w) === i).slice(0, 8);
  const descParts = [`${title} — quality FMCG stock for retail and bulk buyers.`];
  if (imageMeta.length > 0) descParts.push(`Photos show: ${imageMeta.join('; ')}.`);
  descParts.push('Seller to confirm pack size, expiry date and bulk breaks before publishing.');
  const data: ListingDraft = {
    title,
    description: descParts.join(' '),
    tags,
    suggestedCategory,
    draft: true,
  };
  return {
    data,
    confidence: keywords.trim() ? 0.7 : 0.3,
    needsConfirm: true,
    interpretation: `Draft listing "${title}" in ${suggestedCategory}. Review and publish — nothing is live until you approve.`,
    model: 'stub/draft-v1',
  };
}

export async function draftListing(
  input: DraftListingInput,
  adapter?: VendorAdapter,
): Promise<TaskOutput<ListingDraft>> {
  const a = await pickAdapter(adapter);
  if (a && input.keywords.trim()) {
    try {
      const out = await a.complete(
        `Write an FMCG marketplace listing as JSON {"title": string, "description": string, "tags": string[max 8], "suggestedCategory": "groceries"|"beverages"|"household essentials"} for: ${input.keywords}. Photos: ${(input.imageMeta ?? []).join('; ') || 'none'}.`,
        { temperature: 0.4, maxTokens: 512 },
      );
      const j = extractJson(out.text);
      const fb = ruleDraft(input).data;
      const data: ListingDraft = {
        title: typeof j.title === 'string' && j.title.trim() ? j.title.trim().slice(0, 120) : fb.title,
        description: typeof j.description === 'string' && j.description.trim() ? j.description.trim().slice(0, 600) : fb.description,
        tags: Array.isArray(j.tags) && j.tags.length ? (j.tags as unknown[]).filter((t): t is string => typeof t === 'string').slice(0, 8) : fb.tags,
        suggestedCategory: typeof j.suggestedCategory === 'string' && j.suggestedCategory ? j.suggestedCategory.slice(0, 40) : fb.suggestedCategory,
        draft: true,
      };
      return { data, confidence: 0.85, needsConfirm: true, interpretation: `Draft listing "${data.title}" in ${data.suggestedCategory}. Review and publish — nothing is live until you approve.`, model: out.model };
    } catch {
      /* fall through to deterministic rules */
    }
  }
  return ruleDraft(input);
}

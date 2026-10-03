// draftListing — seller keywords/images-meta → draft listing (seller must publish).

import type { ListingDraft, TaskOutput, VendorAdapter } from '../types.js';

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

export async function draftListing(
  input: DraftListingInput,
  _adapter?: VendorAdapter,
): Promise<TaskOutput<ListingDraft>> {
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

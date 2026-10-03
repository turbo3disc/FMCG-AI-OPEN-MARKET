// Eval fixtures — 10 FMCG queries, pidgin + formal English.

export interface Fixture {
  input: string;
  expectQ: string;
  expectQty: number;
  expectUnit: 'piece' | 'pack' | 'carton';
  expectRadius: number;
}

export const FIXTURES: Fixture[] = [
  { input: 'I wan buy 2 cartons of Indomie within 5 km', expectQ: 'indomie', expectQty: 2, expectUnit: 'carton', expectRadius: 5 },
  { input: 'Abeg find me 5 cartons of Milo near me within 3 km', expectQ: 'milo', expectQty: 5, expectUnit: 'carton', expectRadius: 3 },
  { input: 'Need 10 bags of sugar within 7 km for my shop', expectQ: 'sugar', expectQty: 10, expectUnit: 'pack', expectRadius: 7 },
  { input: 'Show me Eva water 20 bottles within 4 km', expectQ: 'eva water', expectQty: 20, expectUnit: 'piece', expectRadius: 4 },
  { input: 'Buy 1 carton of Indomie chicken flavour', expectQ: 'indomie', expectQty: 1, expectUnit: 'carton', expectRadius: 5 },
  { input: 'I want 3 packs of Peak milk under 15000', expectQ: 'peak', expectQty: 3, expectUnit: 'pack', expectRadius: 5 },
  { input: 'Maggi cubes 12 packs within 2 km', expectQ: 'maggi', expectQty: 12, expectUnit: 'pack', expectRadius: 2 },
  { input: 'Coke 50cl, 24 bottles for party within 10 km', expectQ: 'coke', expectQty: 24, expectUnit: 'piece', expectRadius: 10 },
  { input: 'Abeg 1 carton of Knorr cubes near me', expectQ: 'knorr', expectQty: 1, expectUnit: 'carton', expectRadius: 5 },
  { input: 'Golden Penny sugar 5kg, 4 packs within 6 km', expectQ: 'sugar', expectQty: 4, expectUnit: 'pack', expectRadius: 6 },
];

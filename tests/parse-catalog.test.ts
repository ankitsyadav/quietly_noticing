import { describe, expect, it } from 'vitest';
import { buildCatalog, parseCategories, type ValueGrid } from '../src/lib/parse-catalog';

const productHeaders = [
  'Id', 'Title', 'Note', 'Description', 'Category', 'Platform',
  'Affiliate_Link', 'Price', 'MRP', 'Badge', 'Featured', 'Status',
  'Pic_1', 'Pic_2', 'Pic_3', 'Pic_4',
];

const longNote = 'I loved this because it looks so premium without being expensive at all, and it genuinely photographs beautifully in every light I have tried.';

function row(overrides: Record<string, string>): string[] {
  const base: Record<string, string> = {
    Id: '1', Title: 'Gold Plated Hoops', Note: longNote, Description: 'Lightweight everyday hoops.',
    Category: 'Jewellery', Platform: '', Affiliate_Link: 'https://amazon.in/x', Price: '299', MRP: '999',
    Badge: '', Featured: '', Status: '', Pic_1: 'https://i.postimg.cc/a/x.jpg', Pic_2: '', Pic_3: '', Pic_4: '',
  };
  const merged = { ...base, ...overrides };
  return productHeaders.map((h) => merged[h] ?? '');
}

const categoriesGrid: ValueGrid = [
  ['Name', 'Slug', 'Order', 'Cover', 'Blurb', 'Featured'],
  ['Jewellery', 'jewellery', '1', '', 'Everyday gold-tone pieces.', 'true'],
];

function catalog(rows: string[][]) {
  return buildCatalog({
    productsGrid: [productHeaders, ...rows],
    categoriesGrid,
    collectionsGrid: [['Name', 'Slug', 'Product_Ids', 'Caption', 'Cover']],
    syncedAt: new Date().toISOString(),
    fromSnapshot: false,
  });
}

describe('buildCatalog — happy path', () => {
  it('parses a well-formed row into a product', () => {
    const c = catalog([row({})]);
    expect(c.issues).toHaveLength(0);
    expect(c.products).toHaveLength(1);
    const p = c.products[0]!;
    expect(p.slug).toBe('gold-plated-hoops-1');
    expect(p.discountPercent).toBe(70);
    expect(p.platform).toBe('Amazon'); // inferred, since Platform column left blank
    expect(p.indexable).toBe(true); // note is >=120 chars
  });

  it('header order does not matter for parsing correctness', () => {
    // Shuffle headers and the corresponding row values together.
    const shuffled = [...productHeaders].reverse();
    const values = row({});
    const map = new Map(productHeaders.map((h, i) => [h, values[i]]));
    const shuffledRow = shuffled.map((h) => map.get(h) ?? '');
    const c = buildCatalog({
      productsGrid: [shuffled, shuffledRow],
      categoriesGrid,
      collectionsGrid: [['Name']],
      syncedAt: new Date().toISOString(),
      fromSnapshot: false,
    });
    expect(c.products).toHaveLength(1);
    expect(c.products[0]!.title).toBe('Gold Plated Hoops');
  });
});

describe('buildCatalog — resilience', () => {
  it('skips a row with a bad price instead of throwing, and explains why', () => {
    const c = catalog([row({ Id: '2', Price: 'call for price' })]);
    expect(c.products).toHaveLength(0);
    expect(c.issues[0]?.reason).toMatch(/Price/);
  });

  it('skips a row missing the affiliate link', () => {
    const c = catalog([row({ Id: '3', Affiliate_Link: '' })]);
    expect(c.issues[0]?.reason).toMatch(/Affiliate_Link is empty/);
  });

  it('flags duplicate Ids without crashing', () => {
    const c = catalog([row({ Id: '9' }), row({ Id: '9', Title: 'Different Title' })]);
    expect(c.products).toHaveLength(1);
    expect(c.issues.some((i) => i.reason.includes('duplicate Id'))).toBe(true);
  });

  it('hides Draft rows without counting them as issues', () => {
    const c = catalog([row({ Id: '4', Status: 'Draft' })]);
    expect(c.products).toHaveLength(0);
    expect(c.issues).toHaveLength(0);
    expect(c.draftCount).toBe(1);
  });

  it('marks Sold Out products as soldOut rather than dropping them', () => {
    const c = catalog([row({ Id: '5', Status: 'Sold Out' })]);
    expect(c.products).toHaveLength(1);
    expect(c.products[0]!.soldOut).toBe(true);
  });

  it('ignores a fully blank row silently', () => {
    const c = catalog([row({}), productHeaders.map(() => '')]);
    expect(c.products).toHaveLength(1);
    expect(c.issues).toHaveLength(0);
  });

  it('an unknown category still produces a working product', () => {
    const c = catalog([row({ Id: '6', Category: 'Stationery' })]);
    expect(c.products).toHaveLength(1);
    expect(c.categories.some((cat) => cat.slug === 'stationery')).toBe(true);
  });
});

describe('buildCatalog — indexability gate', () => {
  it('a short or missing note is not indexable', () => {
    const c = catalog([row({ Id: '7', Note: 'Cute!' })]);
    expect(c.products[0]!.indexable).toBe(false);
    expect(c.notIndexable).toHaveLength(1);
  });

  it('sold-out products are excluded from the notIndexable nudge', () => {
    const c = catalog([row({ Id: '8', Note: '', Status: 'Sold Out' })]);
    expect(c.notIndexable).toHaveLength(0);
  });
});

describe('parseCategories', () => {
  it('sorts by Order', () => {
    const grid: ValueGrid = [
      ['Name', 'Slug', 'Order', 'Cover', 'Blurb', 'Featured'],
      ['Beauty', 'beauty', '2', '', '', ''],
      ['Jewellery', 'jewellery', '1', '', '', ''],
    ];
    const cats = parseCategories(grid);
    expect(cats.map((c) => c.slug)).toEqual(['jewellery', 'beauty']);
  });
});

import { describe, expect, it } from 'vitest';
import { buildCatalog } from '../src/lib/parse-catalog';

const headers = ['Id', 'Title', 'Description', 'Category', 'Affliate_Link', 'Pic_1', 'Pic_2', 'Pic_3', 'Pic_4'];

const longDescription =
  'These stunning oxidized silver jhumkas feature vibrant red, green, and pink hues, perfect for festive occasions and everyday wear alike.';

function row(overrides: Record<string, string>): string[] {
  const base: Record<string, string> = {
    Id: '1', Title: 'Oxidized Silver Jhumkas', Description: longDescription,
    Category: 'Jewellery', Affliate_Link: 'https://affiliate.meesho.com/collection/abc',
    Pic_1: 'https://images.meesho.com/images/products/1/a.avif', Pic_2: '', Pic_3: '', Pic_4: '',
  };
  const merged = { ...base, ...overrides };
  return headers.map((h) => merged[h] ?? '');
}

function catalog(rows: string[][]) {
  return buildCatalog({
    productsGrid: [headers, ...rows],
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
    expect(p.slug).toBe('oxidized-silver-jhumkas-1');
    expect(p.platform).toBe('Meesho'); // inferred from the affiliate URL
    expect(p.indexable).toBe(true); // description is >=120 chars
  });

  it('header order does not matter for parsing correctness', () => {
    const shuffled = [...headers].reverse();
    const values = row({});
    const map = new Map(headers.map((h, i) => [h, values[i]]));
    const shuffledRow = shuffled.map((h) => map.get(h) ?? '');
    const c = buildCatalog({
      productsGrid: [shuffled, shuffledRow],
      syncedAt: new Date().toISOString(),
      fromSnapshot: false,
    });
    expect(c.products).toHaveLength(1);
    expect(c.products[0]!.title).toBe('Oxidized Silver Jhumkas');
  });

  it('accepts the corrected "Affiliate_Link" spelling too', () => {
    const fixedHeaders = headers.map((h) => (h === 'Affliate_Link' ? 'Affiliate_Link' : h));
    const c = buildCatalog({
      productsGrid: [fixedHeaders, row({})],
      syncedAt: new Date().toISOString(),
      fromSnapshot: false,
    });
    expect(c.products).toHaveLength(1);
  });
});

describe('buildCatalog — resilience', () => {
  it('skips a row missing the affiliate link', () => {
    const c = catalog([row({ Id: '2', Affliate_Link: '' })]);
    expect(c.issues[0]?.reason).toMatch(/Affliate_Link is empty/);
  });

  it('skips a row with a non-https affiliate link', () => {
    const c = catalog([row({ Id: '3', Affliate_Link: 'meesho.com/x' })]);
    expect(c.issues[0]?.reason).toMatch(/https:\/\//);
  });

  it('flags duplicate Ids without crashing', () => {
    const c = catalog([row({ Id: '9' }), row({ Id: '9', Title: 'Different Title' })]);
    expect(c.products).toHaveLength(1);
    expect(c.issues.some((i) => i.reason.includes('duplicate Id'))).toBe(true);
  });

  it('ignores a fully blank row silently', () => {
    const c = catalog([row({}), headers.map(() => '')]);
    expect(c.products).toHaveLength(1);
    expect(c.issues).toHaveLength(0);
  });

  it('rejects a row with no valid Pic_1', () => {
    const c = catalog([row({ Id: '4', Pic_1: '' })]);
    expect(c.issues[0]?.reason).toMatch(/Pic_1/);
  });

  it('an unknown category still produces a working product with its own derived category', () => {
    const c = catalog([row({ Id: '6', Category: 'Stationery' })]);
    expect(c.products).toHaveLength(1);
    expect(c.categories.some((cat) => cat.slug === 'stationery')).toBe(true);
  });
});

describe('buildCatalog — indexability gate', () => {
  it('a short or missing description is not indexable', () => {
    const c = catalog([row({ Id: '7', Description: 'Cute!' })]);
    expect(c.products[0]!.indexable).toBe(false);
    expect(c.notIndexable).toHaveLength(1);
  });

  it('description is optional — a missing one just is not indexable', () => {
    const c = catalog([row({ Id: '8', Description: '' })]);
    expect(c.products).toHaveLength(1);
    expect(c.products[0]!.indexable).toBe(false);
  });
});

describe('categories — pure derivation (no Categories tab)', () => {
  it('derives categories from distinct product Category values, sorted alphabetically', () => {
    const c = catalog([
      row({ Id: '1', Category: 'Jewellery' }),
      row({ Id: '2', Category: 'Bags' }),
      row({ Id: '3', Category: 'Jewellery' }),
    ]);
    expect(c.categories.map((cat) => cat.name)).toEqual(['Bags', 'Jewellery']);
  });
});

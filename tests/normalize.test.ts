import { describe, expect, it } from 'vitest';
import { inferPlatform, normalizeImageUrl, productSlug, slugify } from '../src/lib/normalize';

describe('slugify / productSlug', () => {
  it('slugifies titles predictably', () => {
    expect(slugify('Gold Plated Hoops')).toBe('gold-plated-hoops');
    expect(slugify("Women's Ribbed Tote & Bag")).toBe('women-s-ribbed-tote-and-bag');
  });
  it('falls back rather than returning empty', () => {
    expect(slugify('!!!')).toBe('item');
  });
  it('anchors the slug on the id so retitles do not break URLs', () => {
    expect(productSlug('Gold Earings', '14')).toBe('gold-earings-14');
    expect(productSlug('Gold Plated Hoops', '14')).toBe('gold-plated-hoops-14');
  });
});

describe('inferPlatform', () => {
  it.each([
    ['https://amazon.in/dp/example', 'Amazon'],
    ['https://amzn.to/abc123', 'Amazon'],
    ['https://affiliate.meesho.com/collection/xyz', 'Meesho'],
    ['https://www.flipkart.com/item', 'Flipkart'],
    ['https://myntra.com/item', 'Myntra'],
    ['https://ajio.com/item', 'Ajio'],
    ['https://nykaa.com/item', 'Nykaa'],
  ])('infers %s -> %s', (url, expected) => {
    expect(inferPlatform(url)).toBe(expected);
  });

  it('falls back to the bare hostname for an unknown merchant', () => {
    expect(inferPlatform('https://example-store.com/item')).toBe('example-store.com');
  });

  it('falls back to "Other" for an unparseable URL', () => {
    expect(inferPlatform('not a url')).toBe('Other');
  });
});

describe('normalizeImageUrl', () => {
  it('accepts a plain https image URL', () => {
    const result = normalizeImageUrl('https://i.postimg.cc/abc123/hoops.jpg');
    expect(result).toEqual({ url: 'https://i.postimg.cc/abc123/hoops.jpg' });
  });
  it('accepts a real Meesho CDN image URL', () => {
    const result = normalizeImageUrl('https://images.meesho.com/images/products/470217206/ej4hl_512.avif?width=512');
    expect('url' in result).toBe(true);
  });
  it('rewrites a Google Drive share link to a direct-serve URL', () => {
    const result = normalizeImageUrl('https://drive.google.com/file/d/1AbCdEfGhIjKlMn/view?usp=sharing');
    expect('url' in result && result.url).toBe('https://lh3.googleusercontent.com/d/1AbCdEfGhIjKlMn');
  });
  it('rejects Google Photos links with an actionable message', () => {
    const result = normalizeImageUrl('https://photos.google.com/share/abc');
    expect('error' in result && result.error).toMatch(/postimages/i);
  });
  it('catches the postimages page link vs the direct link mistake', () => {
    const result = normalizeImageUrl('https://postimg.cc/abc123');
    expect('error' in result && result.error).toMatch(/direct link/i);
  });
  it('rejects non-URLs', () => {
    expect('error' in normalizeImageUrl('not a url')).toBe(true);
    expect('error' in normalizeImageUrl('')).toBe(true);
  });
});

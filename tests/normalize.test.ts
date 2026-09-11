import { describe, expect, it } from 'vitest';
import { discountPercent, formatPrice, normalizeImageUrl, parsePrice, productSlug, slugify } from '../src/lib/normalize';

describe('parsePrice', () => {
  it.each([
    ['299', 299],
    ['₹299', 299],
    ['Rs. 1,299', 1299],
    ['1,299.00', 1299],
    ['299/-', 299],
    ['  649  ', 649],
    ['INR 999', 999],
  ])('parses %s -> %d', (input, expected) => {
    expect(parsePrice(input)).toBe(expected);
  });

  it.each(['', 'free', 'call for price', '12a3', '-50', '0'])('rejects %s', (input) => {
    expect(parsePrice(input)).toBeNull();
  });
});

describe('discountPercent', () => {
  it('computes whole-percent savings', () => {
    expect(discountPercent(299, 999)).toBe(70);
  });
  it('returns null when MRP is missing', () => {
    expect(discountPercent(299, null)).toBeNull();
  });
  it('returns null when MRP is not actually higher', () => {
    expect(discountPercent(299, 299)).toBeNull();
    expect(discountPercent(299, 250)).toBeNull();
  });
  it('returns null for a sub-1% rounding artifact', () => {
    expect(discountPercent(999, 1000)).toBeNull();
  });
});

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

describe('formatPrice', () => {
  it('formats with Indian grouping and no decimals', () => {
    expect(formatPrice(1299)).toBe('₹1,299');
    expect(formatPrice(299)).toBe('₹299');
  });
});

describe('normalizeImageUrl', () => {
  it('accepts a plain https image URL', () => {
    const result = normalizeImageUrl('https://i.postimg.cc/abc123/hoops.jpg');
    expect(result).toEqual({ url: 'https://i.postimg.cc/abc123/hoops.jpg' });
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

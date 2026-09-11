import 'server-only';

/**
 * Vercel's documented recipe for next/og: the Google Fonts css2 endpoint
 * serves TrueType (not WOFF2) to a plain server-side fetch() with no
 * browser-like Accept header, which is what satori (behind ImageResponse)
 * needs. `text` scopes the request to only the glyphs actually used, which
 * keeps the font payload small for a short title/price string.
 */
export async function loadGoogleFont(family: string, text: string, weight = 400): Promise<ArrayBuffer | null> {
  try {
    const cssUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@${weight}&text=${encodeURIComponent(text)}`;
    const css = await (await fetch(cssUrl)).text();
    const match = css.match(/src: url\(([^)]+)\) format\('(opentype|truetype)'\)/);
    if (!match?.[1]) return null;
    const res = await fetch(match[1]);
    if (!res.ok) return null;
    return await res.arrayBuffer();
  } catch {
    return null; // OG image falls back to a system font rather than 500ing
  }
}

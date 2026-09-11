/**
 * Safely serializes an object for a `<script type="application/ld+json">`
 * tag. JSON.stringify alone isn't enough here: product titles/notes flow in
 * from Neha's Google Sheet, and a literal "</script>" in one would close
 * the tag early and let whatever follows run as markup/script. Escaping
 * "<" to its unicode form is the standard mitigation — it's invisible to
 * JSON-LD consumers (Google, JSON.parse) but can't be used to break out.
 */
export function jsonLdScript(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

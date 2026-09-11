/**
 * Generates src/app/theme.generated.css from src/config/theme.ts.
 *
 * Tailwind's own palette, radii and font stacks are wiped with `initial` so
 * that `bg-gray-100`, `rounded-lg` and friends simply do not exist. The only
 * reachable utilities are the ones defined here, which is what makes
 * "no hardcoded colours" enforceable rather than aspirational.
 *
 * Run by predev / prebuild. Never edit the output by hand.
 */
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { colors, radius, fonts, motion, imageRatio } from '../src/config/theme.ts';

const kebab = (s: string) => s.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);

const lines: string[] = [
  '/* AUTO-GENERATED from src/config/theme.ts — do not edit. */',
  '',
  '@theme {',
  '  /* Wipe Tailwind defaults so only our tokens resolve. */',
  '  --color-*: initial;',
  '  --radius-*: initial;',
  '  --font-*: initial;',
  '',
];

for (const [name, value] of Object.entries(colors)) {
  lines.push(`  --color-${kebab(name)}: ${value};`);
}
lines.push('');
for (const [name, value] of Object.entries(radius)) {
  lines.push(`  --radius-${kebab(name)}: ${value};`);
}
lines.push('');
for (const [name, value] of Object.entries(fonts)) {
  // next/font (layout.tsx) supplies --font-{name}-loaded with the actual
  // self-hosted font + its own metric-matched fallback; this stack is the
  // final fallback if that variable is ever undefined.
  lines.push(`  --font-${kebab(name)}: var(--font-${kebab(name)}-loaded), ${value};`);
}
lines.push('}', '', ':root {');

for (const [name, value] of Object.entries(motion.duration)) {
  lines.push(`  --duration-${kebab(name)}: ${value}s;`);
}
for (const [name, value] of Object.entries(motion.ease)) {
  lines.push(`  --ease-${kebab(name)}: cubic-bezier(${value.join(', ')});`);
}
lines.push(`  --stagger: ${motion.stagger}s;`);
lines.push(`  --image-ratio: ${imageRatio};`);
lines.push('}', '');

writeFileSync(resolve(import.meta.dirname, '../src/app/theme.generated.css'), lines.join('\n'), 'utf8');
console.log('theme.generated.css written');

/**
 * Quietly Noticing — single source of truth for the visual system.
 *
 * Nothing in src/components may contain a raw colour. Every value below is
 * emitted as a CSS custom property by scripts/gen-theme-css.ts (run on
 * predev/prebuild) and exposed to Tailwind through src/app/theme.generated.css.
 *
 * Contrast ratios are measured against `bone` (#FBF9F6) and must hold:
 *   ink        16.6:1  — body copy, headings
 *   muted       4.56:1 — secondary copy (AA, normal text)
 *   accent      4.39:1 — NOT AA for normal text. Backgrounds, borders,
 *                        and type at 24px+ only.
 *   accentText  5.38:1 — the accent hue, safe at any size.
 */

export const colors = {
  /** Page ground. Warm off-white, never pure #fff. */
  bone: '#FBF9F6',
  /** Raised surfaces: bottom sheets, sticky bars, image letterboxing. */
  surface: '#FFFFFF',
  /** A half-step down from bone, for skeletons and inset wells. */
  sink: '#F3EFE9',

  /** Primary type. */
  ink: '#1C1917',
  /** Secondary type: platform names, captions, muted copy. */
  muted: '#78716C',

  /** Decorative clay: CTA fills, rules, 24px+ display type. */
  accent: '#A0674F',
  /** Clay, darkened to clear AA at body size: "70% off", inline links. */
  accentText: '#8F5A44',
  /** Type placed on top of an `accent` fill. 4.62:1. */
  onAccent: '#FFFFFF',

  /** Hairlines and card edges. */
  line: '#EAE4DC',
  /** Borders that need to actually read, e.g. the Shop now divider. */
  lineStrong: '#DDD3C6',

  /** Status — /health only, never merchandising. */
  positive: '#4A6B4F',
  caution: '#8A6524',
  critical: '#8C3A32',
} as const;

export const radius = {
  sm: '0.25rem',
  md: '0.625rem',
  /** Cards, images, bottom sheets. */
  lg: '1rem',
  xl: '1.5rem',
  /** Chips, pills, the avatar. */
  full: '9999px',
} as const;

export const fonts = {
  /** Fraunces — wordmark, page headings, product titles. */
  display: "'Fraunces Variable', 'Fraunces', Georgia, 'Times New Roman', serif",
  /** Inter — everything else. Numerals use its tabular figures. */
  body: "'Inter Variable', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
} as const;

/**
 * Motion. Framer Motion is used heavily, but these are the only durations
 * and curves anything may use — see src/lib/motion.ts for the variants.
 */
export const motion = {
  duration: {
    /** Taps, focus rings, colour changes. */
    micro: 0.15,
    /** Card reveals, staggered children. */
    reveal: 0.22,
    /** Bottom sheets, route transitions. */
    sheet: 0.3,
    /** The hero entrance cascade. */
    hero: 0.45,
  },
  ease: {
    /** Entrances — fast out of the gate, soft landing. */
    out: [0.2, 0, 0, 1],
    /** Exits — reluctant start, quick departure. */
    in: [0.3, 0, 0.8, 0.15],
    inOut: [0.4, 0, 0.2, 1],
  },
  /** Delay between staggered siblings, in seconds. */
  stagger: 0.045,
} as const;

/** The one image ratio in every grid. Product pages show images uncropped. */
export const imageRatio = '4 / 5';

export const theme = { colors, radius, fonts, motion, imageRatio } as const;
export type ThemeColor = keyof typeof colors;

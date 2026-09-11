// Next.js 16 dropped `next lint` in favor of the plain ESLint CLI, and
// eslint-config-next now ships pre-built flat-config arrays for it directly
// — no next/eslintrc compat shim needed.
import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';

const eslintConfig = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    ignores: ['data/snapshot.json', '.next/**', 'node_modules/**'],
  },
  {
    // ImageResponse's JSX (opengraph-image/icon routes) is satori markup,
    // not real DOM — next/image doesn't apply there, so <img> is correct.
    files: ['**/opengraph-image.tsx', '**/twitter-image.tsx', '**/icon.tsx'],
    rules: { '@next/next/no-img-element': 'off' },
  },
  {
    // A leading underscore is the standard signal for "intentionally
    // unused, kept for documentation/future use" — e.g. photo(_keywords)
    // in the fixture, which keeps each image call self-documenting even
    // while the source doesn't do keyword matching.
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
];

export default eslintConfig;

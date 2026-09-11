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
];

export default eslintConfig;

# Config & Lint

## TypeScript
- `tsconfig.json` extends Expo base with `strict: true` — good. Consider adding:
  - `noUncheckedIndexedAccess: true`
  - `noImplicitOverride: true`
  - `exactOptionalPropertyTypes: true`
  - Path aliases for features (already `@/*`).

## ESLint
- Current: `eslint-config-expo` flat config only. Add rules:
  - `no-console` (allow warn/error) in src; or custom logger only.
  - `react/no-array-index-key` to prevent index keys in lists.
  - `import/no-deprecated`, `import/no-cycle` with dependency-cruiser or madge in CI.
  - `@typescript-eslint/consistent-type-definitions` and `no-explicit-any` (warn) with typed escape hatches.

## Metro/Babel
- Ensure reanimated plugin order (already RN 0.79 compatible via Expo SDK 53); confirm in app entry if needed.

## Env/config
- Move edge function URL to config (`app.config.js` extra) and read via a typed config module; avoid hard-coded URLs in services.

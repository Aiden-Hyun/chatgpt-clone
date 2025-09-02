// eslint.config.js
import eslint from '@eslint/js';
import expo from 'eslint-config-expo';
import unusedImports from 'eslint-plugin-unused-imports';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['dist/*', 'supabase/functions/**', '.expo/*', 'node_modules/*'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  ...tseslint.configs.stylistic,
  expo,
  {
    plugins: {
      'unused-imports': unusedImports,
    },
    rules: {
      // ##################################################################
      // ARCHITECTURAL BOUNDARY RULES
      // ##################################################################
      'no-restricted-imports': ['error', {
        patterns: [
          // 1. Forbid features from importing from other features' internal files.
          {
            group: ['~/features/*/**'],
            from: '~/features/*',
            message: 'Cross-feature imports are not allowed. Use the public API of an entity or a shared module instead.',
          },
          // 2. Forbid deep imports into features or entities (enforce public API via index.ts).
          {
            group: ['~/features/*/*/**', '~/entities/*/*/**'],
            message: 'Use the public API (index.ts) for features and entities.',
          },
          // 3. Forbid shared layer from importing from features or entities.
          {
            group: ['~/features/**', '~/entities/**'],
            from: '~/shared/**',
            message: 'The shared layer cannot import from features or entities.',
          },
          // 4. Forbid app layer from making deep imports into features.
          {
            group: ['~/features/*/**'],
            from: '~/app/**',
            message: 'The app layer should only import from the public API (index.ts) of a feature.',
          },
        ],
      }],

      // ##################################################################
      // CODE QUALITY & CONSISTENCY RULES
      // ##################################################################

      // Enforce import order for consistency.
      'import/order': ['error', {
        groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
        'newlines-between': 'always',
        alphabetize: { order: 'asc', caseInsensitive: true },
      }],

      // Disallow duplicate imports.
      'import/no-duplicates': 'error',

      // Auto-fixable rule to remove unused imports.
      'unused-imports/no-unused-imports': 'error',

      // Standard 'no-unused-vars' but allows prefixing with `_` to ignore.
      '@typescript-eslint/no-unused-vars': ['error', {
        args: 'after-used',
        ignoreRestSiblings: true,
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      }],

      // Forbid 'any' type to encourage type safety.
      '@typescript-eslint/no-explicit-any': 'warn',

      // Prefer using array literals `[]`.
      '@typescript-eslint/array-type': ['error', { default: 'array' }],

      // Disable the exhaustive-deps rule for React hooks as it can be noisy.
      'react-hooks/exhaustive-deps': 'off',
    },
  },
);

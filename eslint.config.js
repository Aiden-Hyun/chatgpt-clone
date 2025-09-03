// eslint.config.js
import expo from 'eslint-config-expo/flat.js';
import nPlugin from 'eslint-plugin-n';
import unusedImports from 'eslint-plugin-unused-imports';

export default [
  // Global ignores
  {
    ignores: [
      'dist/*',
      'supabase/functions/**',
      '.expo/*',
      'node_modules/*',
      'babel.config.js',
      'metro.config.js',
      'jest.config.js',
    ],
  },

  // Spread the recommended Expo config
  ...expo,

  // Custom rules for TypeScript files
  {
    files: ['src/**/*.{ts,tsx}', 'app/**/*.{ts,tsx}'],
    plugins: {
      'unused-imports': unusedImports,
      n: nPlugin,
    },
    settings: {
      // Ensure import/no-unresolved can resolve TS path aliases and extensions
      'import/resolver': {
        typescript: {
          project: ['./tsconfig.json'],
          alwaysTryTypes: true,
        },
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
          moduleDirectory: ['node_modules', 'src/'],
        },
      },
    },
    rules: {
      // ##################################################################
      // ARCHITECTURAL BOUNDARY RULES
      // ##################################################################
      'no-restricted-imports': ['error', {
        patterns: [
          {
            group: ['@/features/*/**'],
            message: 'Use the public API (index.ts) for features and entities.',
          },
          {
            group: ['@/entities/*/*/**'],
            message: 'Use the public API (index.ts) for features and entities.',
          },
        ],
      }],

      // ##################################################################
      // CODE QUALITY & CONSISTENCY RULES
      // ##################################################################
      'import/order': ['error', {
        groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
        'newlines-between': 'always',
        alphabetize: { order: 'asc', caseInsensitive: true },
      }],
      'import/no-duplicates': 'error',
      'unused-imports/no-unused-imports': 'error',
      '@typescript-eslint/no-unused-vars': ['error', {
        args: 'after-used',
        ignoreRestSiblings: true,
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      }],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/array-type': ['error', { default: 'array' }],
      'react-hooks/exhaustive-deps': 'off',
      'react/prop-types': 'off',
      'react/react-in-jsx-scope': 'off',

      // ##################################################################
      // IMPORT VALIDATION RULES
      // ##################################################################
      // Make sure resolver above is configured so this rule can work with TS aliases
      'import/no-unresolved': 'error',

      // Use eslint-plugin-n to catch missing require() imports (CommonJS)
      'n/no-missing-require': 'error',

      // Optional: disallow CommonJS in your TS files (force ESM)
      // 'import/no-commonjs': 'error',
    },
  },
];

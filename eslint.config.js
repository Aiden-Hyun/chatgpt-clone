// eslint.config.js
import expo from 'eslint-config-expo/flat.js';
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
      'jest.config.js'
    ],
  },

  // Spread the recommended Expo config
  ...expo,

  // Our custom configuration object for TypeScript files
  {
    files: ['src/**/*.{ts,tsx}', 'app/**/*.{ts,tsx}'],
    plugins: {
      'unused-imports': unusedImports,
    },
    settings: {
      'import/resolver': {
        typescript: true,
        node: true,
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
      'react-hooks/exhaustive-deps': 'off', // User preference
      'react/prop-types': 'off', // Not needed with TypeScript
      'react/react-in-jsx-scope': 'off', // Not needed with modern React/Expo
    }
  }
];

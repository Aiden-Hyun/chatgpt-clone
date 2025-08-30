// eslint.config.js
/* eslint-disable no-useless-escape */
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

// LAW: The system shall define the architectural layers in the following strict order.
const LAYERS = ['presentation', 'business', 'service', 'persistence', 'database'];

// LAW: Each layer is permitted to import only from itself and the explicitly allowed layers below.
const ALLOWED = {
  presentation: ['presentation', 'business', 'service'],
  business:     ['business', 'service', 'persistence'],
  service:      ['service', 'persistence'],
  persistence:  ['persistence', 'database'],
  database:     ['database'],
};

// LAW: All imports between layers not explicitly allowed are strictly forbidden.
const zones = [];
for (const target of LAYERS) {
  const allowed = new Set(ALLOWED[target]);
  for (const from of LAYERS) {
    if (!allowed.has(from)) {
      zones.push({
        target: `source/${target}/**/*`,
        from:   `source/${from}/**/*`,
        message: `${capitalize(target)} layer cannot import from ${capitalize(from)} layer.`
      });
    }
  }
}

// LAW: A layer shall not use interfaces from any other layer; it may only use its own interfaces.
for (const target of LAYERS) {
  for (const from of LAYERS) {
    const isSame = target === from;
    if (!isSame) {
      zones.push({
        target: `source/${target}/**/*`,
        from:   `source/${from}/interfaces/**/*`,
        message: `${capitalize(target)} layer must not use ${capitalize(from)} interfaces.`,
      });
    }
  }
}

// LAW: Each layer's /interfaces folder must remain sovereign and independent.
// It is forbidden to import implementation files or interfaces from other layers into a layer's /interfaces.
zones.push({
  target: /^source\/(presentation|business|service|persistence|database)\/interfaces\/.*$/,
  from: [
    // It is forbidden to import implementation files from any layer.
    '^source/(presentation|business|service|persistence|database)/(?!interfaces/).*',
    // It is forbidden to import interfaces from any layer other than the target's own.
    '^source/(presentation|business|service|persistence|database)/interfaces/((?!\\1).)*$',
  ],
  message:
    "Each layer's /interfaces must be independent. Don't import other layers or non-interface code.",
});

function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

module.exports = defineConfig([
  expoConfig,
  // LAW: The following paths are to be ignored by all linting rules.
  { ignores: ['dist/*', 'supabase/functions/**'] },

  {
    // LAW: The 'unused-imports' plugin shall be enforced for all code.
    plugins: { 
      'unused-imports': require('eslint-plugin-unused-imports')
    },
    settings: {
      // LAW: The import resolver must honor both TypeScript and Node module resolution.
      'import/resolver': {
        typescript: { project: './tsconfig.json' },
        node: { extensions: ['.js', '.jsx', '.ts', '.tsx'] },
      },
    },
    rules: {
      // LAW: Cyclic imports are forbidden beyond a depth of 1.
      'import/no-cycle': ['error', { maxDepth: 1 }],
      
      // LAW: Type aliases and enums must only be defined within /interfaces folders.
      'no-restricted-syntax': [
        'error',
        { selector: 'TSTypeAliasDeclaration', message: 'Define type aliases only in /interfaces folders.' },
        { selector: 'TSEnumDeclaration',     message: 'Define enums only in /interfaces folders.' },
      ],

      // LAW: Imports must be ordered by group, alphabetized, and separated by newlines.
      'import/order': ['error', {
        groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
        'newlines-between': 'always',
        alphabetize: { order: 'asc', caseInsensitive: true },
      }],
      // LAW: Duplicate imports are strictly forbidden.
      'import/no-duplicates': 'error',

// LAW: All unused imports and variables shall be reported as errors.
'unused-imports/no-unused-imports': 'error',

// 🔧 give the plugin the same _unused ignore patterns
'unused-imports/no-unused-vars': ['error', {
  vars: 'all',
  args: 'after-used',
  ignoreRestSiblings: true,
  varsIgnorePattern: '^_unused.*',
  argsIgnorePattern: '^_unused.*',
  caughtErrors: 'all',
  caughtErrorsIgnorePattern: '^_unused.*',
}],


      // LAW: Unsafe types and nonstandard naming conventions are forbidden.
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/naming-convention': ['error', { selector: 'interface', format: ['PascalCase'] }],
      '@typescript-eslint/array-type': ['error', { default: 'array' }],
    },
  },

  // LAW: Within any /interfaces folder, type strictness rules are suspended to allow flexibility.
  {
    files: [
      'source/presentation/interfaces/**/*',
      'source/business/interfaces/**/*',
      'source/service/interfaces/**/*',
      'source/persistence/interfaces/**/*',
      'source/database/interfaces/**/*',
    ],
    rules: {
      'no-restricted-syntax': 'off',
      '@typescript-eslint/naming-convention': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/array-type': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },
]);

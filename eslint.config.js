const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*', 'supabase/functions/**'],
    settings: {
      'import/resolver': {
        typescript: { project: './tsconfig.json' },
        node: { extensions: ['.js', '.jsx', '.ts', '.tsx'] },
      },
      'boundaries/elements': [
        {
          type: 'presentation',
          pattern: 'source/presentation/**/*',
        },
        {
          type: 'business',
          pattern: 'source/business/**/*',
        },
        {
          type: 'service',
          pattern: 'source/service/**/*',
        },
        {
          type: 'persistence',
          pattern: 'source/persistence/**/*',
        },
      ],
      'boundaries/ignore': ['**/*.test.*', '**/*.spec.*'],
    },
    plugins: {
      boundaries: require('eslint-plugin-boundaries'),
    },
    rules: {
      // Enforce clean architecture boundaries
      'boundaries/element-types': [
        'error',
        {
          default: 'disallow',
          rules: [
            // Presentation can only import from business interfaces and other presentation
            {
              from: 'presentation',
              allow: [
                'presentation',
                ['business', { specifier: '**/interfaces/**' }],
                ['business', { specifier: '**/entities/**' }],
                ['business', { specifier: '**/view-models/**' }],
                ['business', { specifier: '**/constants/**' }],
              ],
            },
            // Business can import from other business modules
            {
              from: 'business',
              allow: ['business'],
            },
            // Service can import from business interfaces and other services
            {
              from: 'service',
              allow: [
                'service',
                ['business', { specifier: '**/interfaces/**' }],
                ['business', { specifier: '**/entities/**' }],
                ['business', { specifier: '**/constants/**' }],
              ],
            },
            // Persistence can import from business and service interfaces
            {
              from: 'persistence',
              allow: [
                'persistence',
                ['business', { specifier: '**/interfaces/**' }],
                ['business', { specifier: '**/entities/**' }],
                ['business', { specifier: '**/constants/**' }],
                ['service', { specifier: '**/interfaces/**' }],
              ],
            },
          ],
        },
      ],
      // Prevent specific forbidden imports
      'import/no-restricted-paths': [
        'error',
        {
          zones: [
            // Presentation cannot import from service or persistence
            {
              target: 'source/presentation/**/*',
              from: 'source/service/**/*',
              message: 'Presentation layer cannot directly import from Service layer. Use Business layer interfaces instead.',
            },
            {
              target: 'source/presentation/**/*',
              from: 'source/persistence/**/*',
              message: 'Presentation layer cannot directly import from Persistence layer. Use Business layer interfaces instead.',
            },
            // Business cannot import from service or persistence
            {
              target: 'source/business/**/*',
              from: 'source/service/**/*',
              message: 'Business layer cannot import from Service layer. Keep business logic pure.',
            },
            {
              target: 'source/business/**/*',
              from: 'source/persistence/**/*',
              message: 'Business layer cannot import from Persistence layer. Keep business logic pure.',
            },
          ],
        },
      ],
    },
  },
  // Enforce centralized business interfaces usage and forbid stray type defs
  {
    files: ['source/business/**/*.{ts,tsx}'],
    excludedFiles: ['source/business/interfaces/**/*'],
    rules: {
      // Forbid defining interfaces/types/enums anywhere in business except /interfaces
      'no-restricted-syntax': [
        'error',
        {
          selector: 'TSInterfaceDeclaration',
          message: 'Define interfaces only in source/business/interfaces.'
        },
        {
          selector: 'TSTypeAliasDeclaration',
          message: 'Define type aliases only in source/business/interfaces.'
        },
        {
          selector: 'TSEnumDeclaration',
          message: 'Define enums only in source/business/interfaces.'
        }
      ],
      // Disallow importing business types from anywhere except the centralized /interfaces
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            // Block importing directly from business entities/constants/types folders
            {
              group: [
                'source/business/**/entities/*',
                'source/business/**/entities/**/*'
              ],
              message: 'Import entities via source/business/interfaces only.'
            },
            {
              group: [
                'source/business/**/constants/*',
                'source/business/**/constants/**/*'
              ],
              message: 'Import constants via source/business/interfaces only.'
            },
            {
              group: [
                'source/business/**/types/*',
                'source/business/**/types/**/*'
              ],
              message: 'Import types via source/business/interfaces only.'
            },
            // Block any nested per-feature interfaces folders (force centralized one)
            {
              group: [
                'source/business/*/interfaces/*',
                'source/business/*/interfaces/**/*'
              ],
              message: 'Use the centralized source/business/interfaces for all interfaces.'
            },
            // Block legacy shared interfaces path inside business
            {
              group: [
                'source/business/shared/interfaces/*',
                'source/business/shared/interfaces/**/*'
              ],
              message: 'Use the centralized source/business/interfaces for all interfaces.'
            }
          ]
        }
      ]
    }
  }
]);
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
    },
    rules: {
      // ============================================================================
      // LAYER BOUNDARY ENFORCEMENT
      // ============================================================================
      
      // Prevent circular imports between files and layers
      'import/no-cycle': ['error', { maxDepth: 1 }],
      
      // Enforce layer dependency rules using import/no-restricted-paths
      'import/no-restricted-paths': [
        'error',
        {
          zones: [
            // ============================================================================
            // PRESENTATION LAYER RULES
            // ============================================================================
            // Presentation can only import from business/ and service/ (no skipping)
            {
              target: 'source/presentation/**/*',
              from: 'source/persistence/**/*',
              message: 'Presentation layer cannot import from Persistence layer. Use Business layer interfaces instead.',
            },
            {
              target: 'source/presentation/**/*',
              from: 'source/database/**/*',
              message: 'Presentation layer cannot import from Database layer. Use Business layer interfaces instead.',
            },
            
            // ============================================================================
            // BUSINESS LAYER RULES  
            // ============================================================================
            // Business can only import from service/ and persistence/ (no skipping)
            {
              target: 'source/business/**/*',
              from: 'source/database/**/*',
              message: 'Business layer cannot import from Database layer. Use Persistence layer interfaces instead.',
            },
            
            // ============================================================================
            // SERVICE LAYER RULES
            // ============================================================================
            // Service can only import from persistence/ (no skipping)
            {
              target: 'source/service/**/*',
              from: 'source/database/**/*',
              message: 'Service layer cannot import from Database layer. Use Persistence layer interfaces instead.',
            },
            
            // ============================================================================
            // PERSISTENCE LAYER RULES
            // ============================================================================
            // Persistence can only import from database/ (no skipping)
            // No restrictions needed as persistence is the lowest layer that can import from database
            
            // ============================================================================
            // DATABASE LAYER RULES
            // ============================================================================
            // Database cannot import from any other layer (it's the bottom layer)
            {
              target: 'source/database/**/*',
              from: 'source/presentation/**/*',
              message: 'Database layer cannot import from Presentation layer. Database is the bottom layer.',
            },
            {
              target: 'source/database/**/*',
              from: 'source/business/**/*',
              message: 'Database layer cannot import from Business layer. Database is the bottom layer.',
            },
            {
              target: 'source/database/**/*',
              from: 'source/service/**/*',
              message: 'Database layer cannot import from Service layer. Database is the bottom layer.',
            },
            {
              target: 'source/database/**/*',
              from: 'source/persistence/**/*',
              message: 'Database layer cannot import from Persistence layer. Database is the bottom layer.',
            },
            
            // ============================================================================
            // ADDITIONAL LAYER BOUNDARY RULES
            // ============================================================================
            
            // Prevent business layer from importing presentation components
            {
              target: 'source/business/**/*',
              from: 'source/presentation/**/*',
              message: 'Business layer cannot import from Presentation layer. Business should not know about UI components.',
            },
            
            // Prevent service layer from importing presentation or business components
            {
              target: 'source/service/**/*',
              from: 'source/presentation/**/*',
              message: 'Service layer cannot import from Presentation layer. Service should not know about UI components.',
            },
            {
              target: 'source/service/**/*',
              from: 'source/business/**/*',
              message: 'Service layer cannot import from Business layer. Service should not know about business logic.',
            },
            
            // Prevent persistence layer from importing presentation, business, or service components
            {
              target: 'source/persistence/**/*',
              from: 'source/presentation/**/*',
              message: 'Persistence layer cannot import from Presentation layer. Persistence should not know about UI components.',
            },
            {
              target: 'source/persistence/**/*',
              from: 'source/business/**/*',
              message: 'Persistence layer cannot import from Business layer. Persistence should not know about business logic.',
            },
            {
              target: 'source/persistence/**/*',
              from: 'source/service/**/*',
              message: 'Persistence layer cannot import from Service layer. Persistence should not know about service logic.',
            },
            
            // ============================================================================
            // INTERFACE USAGE RULES - Each layer must only use its own interfaces
            // ============================================================================
            
            // Presentation layer can only use its own interfaces
            {
              target: 'source/presentation/**/*',
              from: 'source/business/interfaces/**/*',
              message: 'Presentation layer must only use its own interfaces. Import from source/presentation/interfaces instead.',
            },
            {
              target: 'source/presentation/**/*',
              from: 'source/service/interfaces/**/*',
              message: 'Presentation layer must only use its own interfaces. Import from source/presentation/interfaces instead.',
            },
            {
              target: 'source/presentation/**/*',
              from: 'source/persistence/interfaces/**/*',
              message: 'Presentation layer must only use its own interfaces. Import from source/presentation/interfaces instead.',
            },
            
            // Business layer can only use its own interfaces
            {
              target: 'source/business/**/*',
              from: 'source/presentation/interfaces/**/*',
              message: 'Business layer must only use its own interfaces. Import from source/business/interfaces instead.',
            },
            {
              target: 'source/business/**/*',
              from: 'source/service/interfaces/**/*',
              message: 'Business layer must only use its own interfaces. Import from source/business/interfaces instead.',
            },
            {
              target: 'source/business/**/*',
              from: 'source/persistence/interfaces/**/*',
              message: 'Business layer must only use its own interfaces. Import from source/business/interfaces instead.',
            },
            
            // Service layer can only use its own interfaces
            {
              target: 'source/service/**/*',
              from: 'source/presentation/interfaces/**/*',
              message: 'Service layer must only use its own interfaces. Import from source/service/interfaces instead.',
            },
            {
              target: 'source/service/**/*',
              from: 'source/business/interfaces/**/*',
              message: 'Service layer must only use its own interfaces. Import from source/service/interfaces instead.',
            },
            {
              target: 'source/service/**/*',
              from: 'source/persistence/interfaces/**/*',
              message: 'Service layer must only use its own interfaces. Import from source/service/interfaces instead.',
            },
            
            // Persistence layer can only use its own interfaces
            {
              target: 'source/persistence/**/*',
              from: 'source/presentation/interfaces/**/*',
              message: 'Persistence layer must only use its own interfaces. Import from source/persistence/interfaces instead.',
            },
            {
              target: 'source/persistence/**/*',
              from: 'source/business/interfaces/**/*',
              message: 'Persistence layer must only use its own interfaces. Import from source/persistence/interfaces instead.',
            },
            {
              target: 'source/persistence/**/*',
              from: 'source/service/interfaces/**/*',
              message: 'Persistence layer must only use its own interfaces. Import from source/persistence/interfaces instead.',
            },
          ],
        },
      ],
      
      // ============================================================================
      // TYPE/INTERFACE DEFINITION RULES
      // ============================================================================
      
      // Forbid defining interfaces/types/enums outside of /interfaces folders
      'no-restricted-syntax': [
        'error',
        {
          selector: 'TSInterfaceDeclaration:not([id.name^="I"])',
          message: 'Define interfaces only in /interfaces folders. Move this interface to the appropriate layer\'s /interfaces folder.',
        },
        {
          selector: 'TSTypeAliasDeclaration',
          message: 'Define type aliases only in /interfaces folders. Move this type to the appropriate layer\'s /interfaces folder.',
        },
        {
          selector: 'TSEnumDeclaration',
          message: 'Define enums only in /interfaces folders. Move this enum to the appropriate layer\'s /interfaces folder.',
        },
      ],
      
      // ============================================================================
      // IMPORT ORGANIZATION RULES
      // ============================================================================
      
      // Ensure imports are sorted and organized
      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
          ],
          'newlines-between': 'always',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],
      
      // Prevent duplicate imports
      'import/no-duplicates': 'error',
      
      // ============================================================================
      // TYPE SAFETY RULES
      // ============================================================================
      
      // Prevent any usage
      '@typescript-eslint/no-explicit-any': 'error',
      
      // Enforce consistent naming conventions for interfaces only
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'interface',
          format: ['PascalCase'],
          prefix: ['I'],
        },
      ],
      
      // ============================================================================
      // CODE QUALITY RULES
      // ============================================================================
      
      // Prevent unused variables
      '@typescript-eslint/no-unused-vars': 'error',
      
      // Enforce array type consistency
      '@typescript-eslint/array-type': ['error', { default: 'array' }],
    },
  },
]);
// ESLint v9 Flat Config for a TypeScript Hexagonal Architecture project
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import importPlugin from 'eslint-plugin-import';

export default [
    // Ignore build artifacts and vendor folders
    {
        ignores: ['dist/**', 'node_modules/**', 'coverage/**', '.prisma/**'],
    },

    // TypeScript source files
    {
        files: ['**/*.ts'],
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                ecmaVersion: 2023,
                sourceType: 'module',
                // Use a Windows-safe absolute path to the repo root
                tsconfigRootDir: process.cwd(),
            },
        },
        plugins: {
            '@typescript-eslint': tsPlugin,
            import: importPlugin,
        },
        settings: {
            'import/resolver': {
                typescript: {
                    project: './tsconfig.json',
                },
                node: {
                    extensions: ['.js', '.ts'],
                },
            },
        },
        rules: {
            // Reasonable TS defaults
            'no-undef': 'off',
            '@typescript-eslint/no-unused-vars': [
                'warn',
                { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }
            ],
            '@typescript-eslint/consistent-type-imports': [
                'error',
                { prefer: 'type-imports' }
            ],

            // Quotes style
            quotes: ['error', 'single', { avoidEscape: true }],

            // Import hygiene and ordering
            'import/order': [
                'warn',
                {
                    groups: [[
                        'builtin',
                        'external'
                    ], 'internal', ['parent', 'sibling', 'index']],
                    'newlines-between': 'always',
                    alphabetize: { order: 'asc', caseInsensitive: true },
                    pathGroups: [
                        { pattern: '@domain/**', group: 'internal', position: 'before' },
                        { pattern: '@app/**', group: 'internal', position: 'before' },
                        { pattern: '@infra/**', group: 'internal', position: 'before' },
                        { pattern: '@shared/**', group: 'internal', position: 'before' },
                    ],
                    pathGroupsExcludedImportTypes: ['builtin'],
                },
            ],

            // Hexagonal boundaries
            'import/no-restricted-paths': [
                'error',
                {
                    zones: [
                        { target: './src/domain', from: './src/application', message: 'Domain must not depend on application' },
                        { target: './src/domain', from: './src/infrastructure', message: 'Domain must not depend on infrastructure' },
                        { target: './src/application', from: './src/infrastructure', message: 'Application must not depend on infrastructure' },
                        { target: './src/domain', from: './src/infrastructure/http', message: 'Domain must not import HTTP adapters' },
                        { target: './src/application', from: './src/infrastructure/http', message: 'Use-cases must not import HTTP adapters' },
                    ],
                },
            ],
        },
    },
];

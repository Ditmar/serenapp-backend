/* eslint-env node */
// ESLint config for a hexagonal architecture TypeScript project
module.exports = {
    root: true,
    env: {
        node: true,
        es2023: true,
    },
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 2023,
        sourceType: 'module',
        project: undefined,
        tsconfigRootDir: __dirname,
    },
    plugins: ['@typescript-eslint', 'import'],
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:import/recommended',
        'plugin:import/typescript',
        'prettier',
    ],
    settings: {
        'import/resolver': {
            typescript: {
                project: './tsconfig.json',
            },
            node: {
                extensions: ['.js', '.ts']
            },
        },
    },
    rules: {
        // General TS rules
        '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
        '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],

        // Import hygiene
        'import/no-default-export': 'off',
        'import/order': [
            'warn',
            {
                groups: [['builtin', 'external'], 'internal', ['parent', 'sibling', 'index']],
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

        // Layered architecture boundaries
        'import/no-restricted-paths': [
            'error',
            {
                zones: [
                    // Domain must be pure: can't import from application or infrastructure
                    { target: './src/domain', from: './src/application', message: 'Domain must not depend on application' },
                    { target: './src/domain', from: './src/infrastructure', message: 'Domain must not depend on infrastructure' },

                    // Application depends only on domain and shared; not on infrastructure
                    { target: './src/application', from: './src/infrastructure', message: 'Application must not depend on infrastructure' },

                    // Infrastructure can depend on domain and application (adapters, wiring),
                    // but presentation (http/express) should not be imported by domain/application
                    { target: './src/domain', from: './src/infrastructure/http', message: 'Domain must not import HTTP adapters' },
                    { target: './src/application', from: './src/infrastructure/http', message: 'Use-cases must not import HTTP adapters' },
                ],
            },
        ],
    },
    overrides: [],
    ignorePatterns: [
        'dist/',
        'node_modules/',
        '.eslintrc.cjs',
    ],
};

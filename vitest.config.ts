import path from 'node:path';
import { fileURLToPath } from 'node:url';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

const rootDir = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
    plugins: [tsconfigPaths()],
    resolve: {
        alias: {
            '@domain': path.resolve(rootDir, 'src/domain'),
            '@app': path.resolve(rootDir, 'src/application'),
            '@infra': path.resolve(rootDir, 'src/infrastructure'),
            '@shared': path.resolve(rootDir, 'src/shared'),
        },
    },
    test: {
        globals: true,
        environment: 'node',
        include: ['tests/**/*.test.ts'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'html'],
            reportsDirectory: 'coverage'
        },
    },
});

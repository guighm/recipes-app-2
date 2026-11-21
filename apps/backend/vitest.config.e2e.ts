import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    root: './',
    include: ['**/*.e2e-spec.ts'],
    // All e2e files share the same database; run them sequentially to avoid
    // one file's TRUNCATE racing another file's inserts.
    fileParallelism: false,
    env: {
      // Points to the ephemeral db-test container (docker-compose.yaml, port 5433)
      DATABASE_URL: 'postgres://root:123@localhost:5433/recipes_app_test',
    },
  },
});
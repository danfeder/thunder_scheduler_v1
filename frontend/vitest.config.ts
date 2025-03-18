import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
    include: [
      '**/__tests__/**/*.test.tsx',
      '**/test/integration/**/*.test.tsx',
      '**/test/examples/**/*.test.tsx',
      '**/test/real-api/**/*.real.test.tsx'
    ],
    testTimeout: 15000, // Increase timeout for real API tests
    hookTimeout: 15000, // Increase hook timeout for real API tests
    teardownTimeout: 5000, // Increase teardown timeout
    pool: 'forks', // Use forks for better isolation
    // Add tags for different test types
    typecheck: {
      enabled: true,
      tsconfig: './tsconfig.json',
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});
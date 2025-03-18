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
      '**/test/examples/**/*.test.tsx'
    ],
    testTimeout: 10000, // Increase timeout to 10 seconds
    hookTimeout: 10000, // Increase hook timeout to 10 seconds
    teardownTimeout: 5000, // Increase teardown timeout
    pool: 'forks', // Use forks for better isolation
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});
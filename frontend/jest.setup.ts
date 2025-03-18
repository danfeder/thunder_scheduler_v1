import '@testing-library/jest-dom/extend-expect';
import '@testing-library/jest-dom';

// Import Jest globals
import { beforeAll } from '@jest/globals';

// Import MSW server setup
import './src/test/server';

// Add any global test setup here
beforeAll(() => {
  // Setup mock for ResizeObserver which is not available in JSDOM
  global.ResizeObserver = class ResizeObserver {
    constructor(callback: Function) {}
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});
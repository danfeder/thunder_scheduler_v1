import '@testing-library/jest-dom';
import type { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers';

declare global {
  namespace jest {
    interface Matchers<R = void> extends TestingLibraryMatchers<R, void> {}
  }
}

beforeAll(() => {
  // Setup mock for ResizeObserver which is not available in JSDOM
  global.ResizeObserver = class ResizeObserver {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    constructor(_callback: Function) {}
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});
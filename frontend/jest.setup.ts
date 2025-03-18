import '@testing-library/jest-dom/extend-expect';
import '@testing-library/jest-dom';

// Import Jest globals
import { beforeAll } from '@jest/globals';

// Add fetch polyfill for Node.js environment
import { fetch, Headers, Request, Response } from 'cross-fetch';
global.fetch = fetch;
global.Headers = Headers;
global.Request = Request;
global.Response = Response;

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
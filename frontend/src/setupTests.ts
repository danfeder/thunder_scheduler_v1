import '@testing-library/jest-dom';
import { afterAll, afterEach, beforeAll, vi } from 'vitest';
import { fetch, Headers, Request, Response } from 'cross-fetch';

// Add fetch polyfill for Node.js environment
global.fetch = fetch;
global.Headers = Headers;
global.Request = Request;
global.Response = Response;

// Add TextEncoder and TextDecoder polyfills for MSW v2
import { TextEncoder, TextDecoder } from 'util';
global.TextEncoder = TextEncoder as any;
global.TextDecoder = TextDecoder as any;

// Add BroadcastChannel polyfill for MSW v2
class MockBroadcastChannel {
  constructor(channel: string) {}
  postMessage(message: any) {}
  onmessage(event: any) {}
  close() {}
}
global.BroadcastChannel = MockBroadcastChannel as any;

// Add Stream API polyfills for MSW v2
// More complete Stream API polyfills for MSW v2
class MockReadableStream {
  constructor() {}
  getReader() {
    return {
      read: () => Promise.resolve({ done: true, value: undefined }),
      releaseLock: () => {},
      cancel: () => Promise.resolve()
    };
  }
  tee() {
    return [new MockReadableStream(), new MockReadableStream()];
  }
  pipeThrough() {
    return new MockReadableStream();
  }
  cancel() {
    return Promise.resolve();
  }
}

class MockTransformStream {
  readable: any;
  writable: any;
  constructor() {
    this.readable = new MockReadableStream();
    this.writable = {
      getWriter: () => ({
        write: () => Promise.resolve(),
        close: () => Promise.resolve(),
        abort: () => Promise.resolve(),
        releaseLock: () => {},
        cancel: () => Promise.resolve()
      })
    };
  }
}

class MockWritableStream {
  constructor() {}
  getWriter() {
    return {
      write: () => Promise.resolve(),
      close: () => Promise.resolve(),
      abort: () => Promise.resolve(),
      releaseLock: () => {},
      cancel: () => Promise.resolve()
    };
  }
}

// Create a more complete implementation
global.ReadableStream = MockReadableStream as any;
global.TransformStream = MockTransformStream as any;
global.WritableStream = MockWritableStream as any;

// Add additional stream-related polyfills for Response
// Use Object.defineProperty to modify the read-only property
Object.defineProperty(global.Response.prototype, 'body', {
  get: function() {
    return {
      getReader: () => ({
        read: () => Promise.resolve({ done: true, value: undefined }),
        releaseLock: () => {},
        cancel: () => Promise.resolve()
      }),
      tee: () => [new MockReadableStream(), new MockReadableStream()],
      pipeThrough: () => new MockReadableStream(),
      cancel: () => Promise.resolve()
    };
  },
  configurable: true
});

// Import MSW server setup
import './test/server';

// Setup mock for ResizeObserver which is not available in JSDOM
global.ResizeObserver = class ResizeObserver {
  constructor(_callback: Function) {}
  observe() {}
  unobserve() {}
  disconnect() {}
};
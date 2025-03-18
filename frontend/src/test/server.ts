import { http } from 'msw';
import { setupServer } from 'msw/node';
import { scheduleHandlers } from './handlers/schedule';
import { afterAll, afterEach, beforeAll } from 'vitest';

// Create the test server with all handlers
export const server = setupServer(...scheduleHandlers);

// Add request listener to confirm interception
server.events.on('request:start', ({ request }) => {
  console.log('MSW intercepted:', request.method, request.url);
});

// Add response listener to see what's being returned
server.events.on('response:mocked', ({ response }) => {
  console.log('MSW mocked response:', response.status);
});

// Add unhandled request listener
server.events.on('request:unhandled', ({ request }) => {
  console.error('MSW unhandled request:', request.method, request.url);
});

// Start server before all tests
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
  console.log('MSW server started');
});

// Reset handlers after each test (important for test isolation)
afterEach(() => {
  server.resetHandlers();
  console.log('MSW handlers reset');
});

// Close server after all tests
afterAll(() => {
  server.close();
  console.log('MSW server closed');
});
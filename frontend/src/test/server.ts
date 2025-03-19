import { http } from 'msw';
import { setupServer } from 'msw/node';
import { scheduleHandlers } from './handlers/schedule';
import { afterAll, afterEach, beforeAll } from 'vitest';

// Create the test server instance
const server = setupServer(...scheduleHandlers);

// Only set up event listeners and test hooks in test environment
if (process.env.NODE_ENV === 'test') {
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
}

export { server };
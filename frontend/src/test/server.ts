import { setupServer } from 'msw/node';
import { scheduleHandlers } from './handlers/schedule';

// Create the test server with all handlers
export const server = setupServer(...scheduleHandlers);

// Start server before all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

// Reset handlers after each test (important for test isolation)
afterEach(() => server.resetHandlers());

// Close server after all tests
afterAll(() => server.close());
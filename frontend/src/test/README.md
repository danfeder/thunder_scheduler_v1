# Testing Infrastructure

This directory contains the testing infrastructure for the Thunder Scheduler frontend application, including Mock Service Worker (MSW) setup for API mocking.

## Directory Structure

- `fixtures/` - Mock data for tests
- `handlers/` - MSW request handlers for API mocking
- `examples/` - Example tests showing how to use the testing infrastructure
- `server.ts` - MSW server setup
- `test-utils.tsx` - Testing utilities and custom render functions

## Using MSW in Tests

MSW is set up automatically for all tests through the `jest.setup.ts` file. The default handlers in `handlers/schedule.ts` will handle most common API requests with mock data.

### Basic Usage

```tsx
import { render, screen, waitFor } from '../test/test-utils';
import YourComponent from './YourComponent';

describe('YourComponent', () => {
  it('renders data from API', async () => {
    render(<YourComponent />);
    
    await waitFor(() => {
      expect(screen.getByText('Expected Text')).toBeInTheDocument();
    });
  });
});
```

### Overriding Handlers for Specific Tests

You can override the default handlers for specific test cases:

```tsx
import { http, HttpResponse } from 'msw';
import { server } from '../test/server';

// Inside your test
it('handles error states', async () => {
  // Override the handler for this test only
  server.use(
    http.get('http://localhost:3000/api/resource', () => {
      return HttpResponse.json(
        { success: false, message: 'Error message' },
        { status: 500 }
      );
    })
  );
  
  render(<YourComponent />);
  
  await waitFor(() => {
    expect(screen.getByText('Error message')).toBeInTheDocument();
  });
});
```

## Custom Render Function

The `test-utils.tsx` file provides a custom render function that wraps components with all necessary providers:

```tsx
import { render } from '../test/test-utils';

// This will wrap your component with ErrorProvider and QueryClientProvider
render(<YourComponent />);
```

## Adding New Handlers

To add new API mock handlers:

1. Add the handler to `handlers/schedule.ts` or create a new handler file
2. If creating a new handler file, import and add it to the server in `server.ts`

## Adding New Fixtures

To add new mock data:

1. Add the fixture to `fixtures/index.ts`
2. Use the fixture in your handlers and tests
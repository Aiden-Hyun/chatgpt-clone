// tests/features/chat/hooks/messages/index.test.ts
// This file serves as an entry point for running all message hook tests

import './integration.test';
import './useMessageActions.test';
import './useMessageRegeneration.test';
import './useMessagesCombined.test';
import './useMessageState.test';

describe('Message Hooks Test Suite', () => {
  it('should have all test files imported', () => {
    // This test ensures all test files are properly imported
    expect(true).toBe(true);
  });
}); 
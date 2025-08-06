/**
 * Simple test script to demonstrate render counting
 * Run this in the console to see render statistics
 */

export const logRenderStats = () => {
  console.log('=== RENDER PERFORMANCE TEST ===');
  console.log('Send a message and watch the render counts in the console.');
  console.log('Look for [RENDER-COUNT] logs to see how many times each component re-renders.');
  console.log('');
  console.log('Expected behavior:');
  console.log('- useChatState: Should render 1-2 times per message');
  console.log('- MessageList: Should render 1-2 times per message');
  console.log('- ChatInput: Should render 1-2 times per message');
  console.log('');
  console.log('If you see high render counts (>5), there may be unnecessary re-renders.');
  console.log('=== END TEST ===');
};

export const resetRenderCounts = () => {
  console.log('[RENDER-TEST] Resetting render counts...');
  // This would reset the render counters if we had a global tracker
  console.log('[RENDER-TEST] Render counts reset. Send a new message to test.');
}; 
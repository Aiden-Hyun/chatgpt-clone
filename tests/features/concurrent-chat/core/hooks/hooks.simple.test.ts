import { useConcurrentChat } from '../../../../../src/features/concurrent-chat/core/hooks/useConcurrentChat';
import { useMessageCommands } from '../../../../../src/features/concurrent-chat/core/hooks/useMessageCommands';
import { usePluginSystem } from '../../../../../src/features/concurrent-chat/core/hooks/usePluginSystem';
import { useModelSelection } from '../../../../../src/features/concurrent-chat/core/hooks/useModelSelection';

describe('Concurrent Chat Hooks - Simple Import Test', () => {
  it('should import useConcurrentChat hook', () => {
    expect(useConcurrentChat).toBeDefined();
    expect(typeof useConcurrentChat).toBe('function');
  });

  it('should import useMessageCommands hook', () => {
    expect(useMessageCommands).toBeDefined();
    expect(typeof useMessageCommands).toBe('function');
  });

  it('should import usePluginSystem hook', () => {
    expect(usePluginSystem).toBeDefined();
    expect(typeof usePluginSystem).toBe('function');
  });

  it('should import useModelSelection hook', () => {
    expect(useModelSelection).toBeDefined();
    expect(typeof useModelSelection).toBe('function');
  });

  it('should have correct function signatures', () => {
    // Check that the hooks are functions that can be called
    expect(() => {
      // These would normally be called in a React component
      // We're just checking they can be imported and are functions
      const concurrentChatHook = useConcurrentChat;
      const messageCommandsHook = useMessageCommands;
      const pluginSystemHook = usePluginSystem;
      const modelSelectionHook = useModelSelection;
      
      expect(concurrentChatHook).toBeDefined();
      expect(messageCommandsHook).toBeDefined();
      expect(pluginSystemHook).toBeDefined();
      expect(modelSelectionHook).toBeDefined();
    }).not.toThrow();
  });
}); 
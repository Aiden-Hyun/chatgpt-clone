import { generateMessageId, generateRequestId, generateAnimationId } from '../../../../../src/features/concurrent-chat/core/utils/messageIdGenerator';

describe('messageIdGenerator', () => {
  describe('generateMessageId', () => {
    it('should generate unique message IDs', () => {
      const id1 = generateMessageId();
      const id2 = generateMessageId();
      
      expect(id1).not.toBe(id2);
    });

    it('should follow expected format (msg_timestamp_random)', () => {
      const id = generateMessageId();
      
      expect(id).toMatch(/^msg_\d+_[a-zA-Z0-9]+$/);
    });

    it('should generate different IDs on multiple calls', () => {
      const ids = new Set();
      
      for (let i = 0; i < 100; i++) {
        ids.add(generateMessageId());
      }
      
      expect(ids.size).toBe(100);
    });

    it('should generate non-empty string IDs', () => {
      const id = generateMessageId();
      
      expect(id).toBeTruthy();
      expect(typeof id).toBe('string');
      expect(id.length).toBeGreaterThan(0);
    });

    it('should generate IDs with recent timestamp', () => {
      const id = generateMessageId();
      const timestamp = parseInt(id.split('_')[1]);
      const now = Date.now();
      
      // Timestamp should be within last 5 seconds
      expect(now - timestamp).toBeLessThan(5000);
    });

    it('should have consistent format structure', () => {
      const id = generateMessageId();
      const parts = id.split('_');
      
      expect(parts).toHaveLength(3);
      expect(parts[0]).toBe('msg');
      expect(parts[1]).toMatch(/^\d+$/); // timestamp
      expect(parts[2]).toMatch(/^[a-zA-Z0-9]+$/); // random string
    });
  });

  describe('generateRequestId', () => {
    it('should generate unique request IDs', () => {
      const id1 = generateRequestId();
      const id2 = generateRequestId();
      
      expect(id1).not.toBe(id2);
    });

    it('should follow expected format (req_timestamp_random)', () => {
      const id = generateRequestId();
      
      expect(id).toMatch(/^req_\d+_[a-zA-Z0-9]+$/);
    });

    it('should generate different IDs on multiple calls', () => {
      const ids = new Set();
      
      for (let i = 0; i < 100; i++) {
        ids.add(generateRequestId());
      }
      
      expect(ids.size).toBe(100);
    });

    it('should generate non-empty string IDs', () => {
      const id = generateRequestId();
      
      expect(id).toBeTruthy();
      expect(typeof id).toBe('string');
      expect(id.length).toBeGreaterThan(0);
    });

    it('should generate IDs with recent timestamp', () => {
      const id = generateRequestId();
      const timestamp = parseInt(id.split('_')[1]);
      const now = Date.now();
      
      // Timestamp should be within last 5 seconds
      expect(now - timestamp).toBeLessThan(5000);
    });

    it('should have consistent format structure', () => {
      const id = generateRequestId();
      const parts = id.split('_');
      
      expect(parts).toHaveLength(3);
      expect(parts[0]).toBe('req');
      expect(parts[1]).toMatch(/^\d+$/); // timestamp
      expect(parts[2]).toMatch(/^[a-zA-Z0-9]+$/); // random string
    });
  });

  describe('generateAnimationId', () => {
    it('should generate unique animation IDs', () => {
      const id1 = generateAnimationId();
      const id2 = generateAnimationId();
      
      expect(id1).not.toBe(id2);
    });

    it('should follow expected format (anim_timestamp_random)', () => {
      const id = generateAnimationId();
      
      expect(id).toMatch(/^anim_\d+_[a-zA-Z0-9]+$/);
    });

    it('should generate different IDs on multiple calls', () => {
      const ids = new Set();
      
      for (let i = 0; i < 100; i++) {
        ids.add(generateAnimationId());
      }
      
      expect(ids.size).toBe(100);
    });

    it('should generate non-empty string IDs', () => {
      const id = generateAnimationId();
      
      expect(id).toBeTruthy();
      expect(typeof id).toBe('string');
      expect(id.length).toBeGreaterThan(0);
    });

    it('should generate IDs with recent timestamp', () => {
      const id = generateAnimationId();
      const timestamp = parseInt(id.split('_')[1]);
      const now = Date.now();
      
      // Timestamp should be within last 5 seconds
      expect(now - timestamp).toBeLessThan(5000);
    });

    it('should have consistent format structure', () => {
      const id = generateAnimationId();
      const parts = id.split('_');
      
      expect(parts).toHaveLength(3);
      expect(parts[0]).toBe('anim');
      expect(parts[1]).toMatch(/^\d+$/); // timestamp
      expect(parts[2]).toMatch(/^[a-zA-Z0-9]+$/); // random string
    });
  });

  describe('ID uniqueness across different types', () => {
    it('should generate unique IDs across different generator functions', () => {
      const messageId = generateMessageId();
      const requestId = generateRequestId();
      const animationId = generateAnimationId();
      
      expect(messageId).not.toBe(requestId);
      expect(messageId).not.toBe(animationId);
      expect(requestId).not.toBe(animationId);
    });

    it('should have different prefixes for different ID types', () => {
      const messageId = generateMessageId();
      const requestId = generateRequestId();
      const animationId = generateAnimationId();
      
      expect(messageId.startsWith('msg_')).toBe(true);
      expect(requestId.startsWith('req_')).toBe(true);
      expect(animationId.startsWith('anim_')).toBe(true);
    });
  });

  describe('Performance and reliability', () => {
    it('should handle rapid successive calls', () => {
      const ids = [];
      const startTime = Date.now();
      
      for (let i = 0; i < 1000; i++) {
        ids.push(generateMessageId());
      }
      
      const endTime = Date.now();
      const uniqueIds = new Set(ids);
      
      expect(uniqueIds.size).toBe(1000);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should not generate duplicate IDs under load', () => {
      const ids = new Set();
      const promises = [];
      
      // Generate 100 IDs concurrently
      for (let i = 0; i < 100; i++) {
        promises.push(Promise.resolve(generateMessageId()));
      }
      
      return Promise.all(promises).then(results => {
        results.forEach(id => ids.add(id));
        expect(ids.size).toBe(100);
      });
    });
  });
}); 
// src/features/chat/services/interfaces/IDraftService.ts
export interface IDraftService {
  /**
   * Clean up draft messages
   */
  cleanupDrafts(args: {
    isNewRoom: boolean;
    roomId: number;
  }): void;
} 
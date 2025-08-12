// src/features/chat/services/implementations/ReactTypingStateService.ts
import { ITypingStateService } from '../interfaces/ITypingStateService';

export class ReactTypingStateService implements ITypingStateService {
  constructor(
    private setIsTyping: React.Dispatch<React.SetStateAction<boolean>>
  ) {
    console.log('[Service] ReactTypingStateService initialized');
  }

  setTyping(isTyping: boolean): void {
    this.setIsTyping(isTyping);
  }
}

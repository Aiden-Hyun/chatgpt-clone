// src/features/chat/services/implementations/TypingStateService.ts
import { ITypingStateService } from '../interfaces/ITypingStateService';

export class TypingStateService implements ITypingStateService {
  constructor(
    private setIsTyping: React.Dispatch<React.SetStateAction<boolean>>
  ) {
    console.log('[Service] TypingStateService initialized');
  }

  setTyping(isTyping: boolean): void {
    this.setIsTyping(isTyping);
  }
}

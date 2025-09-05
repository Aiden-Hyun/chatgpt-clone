// src/features/chat/services/implementations/TypingStateService.ts
import { getLogger } from "@/shared/services/logger";
import { ITypingStateService } from "../interfaces/ITypingStateService";

export class TypingStateService implements ITypingStateService {
  private logger = getLogger("TypingStateService");

  constructor(
    private setIsTyping: React.Dispatch<React.SetStateAction<boolean>>
  ) {
    this.logger.debug("TypingStateService initialized");
  }

  setTyping(isTyping: boolean): void {
    this.setIsTyping(isTyping);
  }
}

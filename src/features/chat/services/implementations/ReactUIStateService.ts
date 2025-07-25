// src/features/chat/services/implementations/ReactUIStateService.ts
import { IAnimationService } from '../interfaces/IAnimationService';
import { IDraftService } from '../interfaces/IDraftService';
import { IMessageStateService } from '../interfaces/IMessageStateService';
import { ITypingStateService } from '../interfaces/ITypingStateService';
import { IUIStateService } from '../interfaces/IUIStateService';
import { animateResponse } from '../legacy/animateResponse';
import { handleDraftCleanup } from '../sendMessage/handleDraftCleanup';
import { handleMessageState } from '../sendMessage/handleMessageState';
import { ChatMessage } from '../types';

export class ReactUIStateService implements 
  IUIStateService, 
  IMessageStateService, 
  ITypingStateService, 
  IAnimationService, 
  IDraftService {
  
  constructor(
    private setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>,
    private setIsTyping: React.Dispatch<React.SetStateAction<boolean>>,
    private setDrafts: React.Dispatch<React.SetStateAction<Record<string, string>>>
  ) {}

  updateMessageState(args: {
    regenerateIndex?: number;
    userMsg: ChatMessage;
    assistantMsg: ChatMessage;
  }): void {
    handleMessageState({
      regenerateIndex: args.regenerateIndex,
      setMessages: this.setMessages,
      userMsg: args.userMsg,
      assistantMsg: args.assistantMsg,
    });
  }

  setTyping(isTyping: boolean): void {
    this.setIsTyping(isTyping);
  }

  addErrorMessage(message: string): void {
    this.setMessages((prev) => [
      ...prev,
      { role: 'assistant', content: message },
    ]);
  }

  cleanupDrafts(args: {
    isNewRoom: boolean;
    roomId: number;
  }): void {
    handleDraftCleanup({
      isNewRoom: args.isNewRoom,
      roomId: args.roomId,
      setDrafts: this.setDrafts,
    });
  }

  animateResponse(args: {
    fullContent: string;
    regenerateIndex?: number;
    onComplete: () => void;
  }): void {
    animateResponse({
      fullContent: args.fullContent,
      setMessages: this.setMessages,
      setIsTyping: this.setIsTyping,
      regenerateIndex: args.regenerateIndex,
      onComplete: args.onComplete,
    });
  }
} 
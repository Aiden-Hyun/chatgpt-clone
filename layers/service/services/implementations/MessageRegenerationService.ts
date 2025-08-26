// src/features/chat/services/implementations/MessageRegenerationService.ts
import { Session } from '@supabase/supabase-js';
import { ChatMessage } from '../../types';
// Import removed: import { logger } from '../../utils/logger';
import { supabase } from '../../../../shared/lib/supabase';
 
import { OpenAIResponseProcessor } from '../core/AIResponseProcessor';
import { IAIApiService } from '../interfaces/IAIApiService';
import { IAnimationService } from '../interfaces/IAnimationService';
import { IMessageService } from '../interfaces/IMessageService';
import { IRegenerationService } from '../interfaces/IRegenerationService';
import { MessageStateManager } from '../MessageStateManager';

export class MessageRegenerationService implements IRegenerationService {
  private regeneratingIndices: Set<number> = new Set();
  private responseProcessor: OpenAIResponseProcessor;
  
  constructor(
    private messageStateManager: MessageStateManager,
    private aiApiService: IAIApiService,
    private messageService: IMessageService,
    private animationService: IAnimationService,
    private setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>,
    private session: Session,
    private selectedModel: string,
    private roomId: number | null,
    private isSearchMode: boolean = false
  ) {
    this.responseProcessor = new OpenAIResponseProcessor();
  }

  async regenerateMessage(
    messageId: string,
    messages: ChatMessage[],
    userContent: string,
    originalContent: string
  ): Promise<void> {
    // Resolve index from messageId for UI tracking and history slicing
    const index = messages.findIndex(m => m.id === messageId);
    

    if (this.isRegenerating(index)) {
      
      return;
    }

    

    this.regeneratingIndices.add(index);

    try {
      // No longer need snapshot - messages are passed in directly

      if (index < 0 || index >= messages.length) {
        console.error('🔄 REGEN-SERVICE: Message not found for index:', index, 'len:', messages.length);
        throw new Error('Message not found for regeneration');
      }

      const target = messages[index];
      if (!target?.id) {
        console.error('🔄 REGEN-SERVICE: Target message missing id at index:', index);
        throw new Error('Message not found for regeneration');
      }
      const targetMessageId = target.id;
      

      // Set loading state (single atomic update using id)
      this.messageStateManager.transition(targetMessageId, 'loading');

      // Prepare history from the snapshot (all messages before the assistant message)
      // Filter only role, content, id to avoid UI-only fields affecting the prompt
      const messageHistory: ChatMessage[] = messages.slice(0, index).map(m => ({
        role: m.role,
        content: m.content || '',
        id: m.id,
        state: m.state,
      }));
      
      // If caller provided an override for the immediate previous user message, apply it
      let finalHistory: ChatMessage[] = messageHistory;
      if (userContent && userContent.trim().length > 0) {
        const lastIdx = messageHistory.length - 1;
        if (lastIdx >= 0 && messageHistory[lastIdx]?.role === 'user') {
          const overridden = { ...messageHistory[lastIdx], content: userContent };
          finalHistory = messageHistory.slice(0, lastIdx).concat(overridden);
        }
      }


      // Call AI API with idempotency and skipPersistence (server should not write on regen)
      const apiRequest = {
        roomId: this.roomId,
        messages: finalHistory,
        model: this.selectedModel,
        clientMessageId: targetMessageId,
        skipPersistence: true,
      } as any;
      
      
      
      
      

      // Determine which token to use
      let accessToken = this.session.access_token;
      
      if (this.session.expires_at && Math.floor(Date.now() / 1000) > this.session.expires_at) {
        try {
          
          const { data, error } = await supabase.auth.refreshSession();
          if (!error && data.session) {
            
            accessToken = data.session.access_token;
          } else {
            console.warn('🔄 REGEN-SERVICE: Session refresh failed, proceeding with existing token');
          }
        } catch {
          console.warn('🔄 REGEN-SERVICE: Session refresh threw, proceeding with existing token');
        }
      }

      
      

      const apiResponse = await this.aiApiService.sendMessage(apiRequest, accessToken, this.isSearchMode);
      

      // Use the same response processor as MessageSenderService for consistent handling
      if (!this.responseProcessor.validateResponse(apiResponse)) {
        console.error('🔄 REGEN-SERVICE: API response missing content');
        throw new Error('No content in AI response');
      }
      
      const newContent = this.responseProcessor.extractContent(apiResponse);
      if (!newContent) {
        console.error('🔄 REGEN-SERVICE: No content extracted from API response');
        throw new Error('No content in AI response');
      }

      // Drive UI state and animation
      this.messageStateManager.handleRegeneration(targetMessageId, newContent);
      this.animationService.setMessageFullContentAndAnimate({
        fullContent: newContent,
        messageId: targetMessageId,
      });

      // Persist if room exists
      if (this.roomId) {
        try {
          // Prefer updating by database id when available (ids loaded as `db:<id>`)
          if (targetMessageId.startsWith('db:')) {
            const dbIdStr = targetMessageId.slice(3);
            const dbId = Number(dbIdStr);
            if (!Number.isNaN(dbId) && (this.messageService as any).updateAssistantMessageByDbId) {
              await (this.messageService as any).updateAssistantMessageByDbId({
                dbId,
                newContent,
                session: this.session,
              });
            }
          } else if ((this.messageService as any).updateAssistantMessageByClientId && this.roomId) {
            await (this.messageService as any).updateAssistantMessageByClientId({
              roomId: this.roomId,
              messageId: targetMessageId,
              newContent,
              session: this.session,
            });
          }

          // Also persist edited user message if it came from DB and content changed
          const userIndex = index - 1;
          if (userIndex >= 0 && messages[userIndex]?.role === 'user') {
            const userMsg = messages[userIndex];
            if (
              userMsg?.id &&
              typeof userMsg.id === 'string' &&
              userMsg.id.startsWith('db:') &&
              userContent &&
              userContent.trim().length > 0 &&
              userContent !== userMsg.content &&
              (this.messageService as any).updateUserMessageByDbId
            ) {
              const userDbId = Number(userMsg.id.slice(3));
              if (!Number.isNaN(userDbId)) {
                await (this.messageService as any).updateUserMessageByDbId({
                  dbId: userDbId,
                  newContent: userContent,
                  session: this.session,
                });
              }
            }
          }

        } catch (dbError) {
          console.error('🔄 REGEN-SERVICE: DB update failed', dbError);
        }
      }

      
    } catch (error) {
      console.error('🔄 REGEN-SERVICE: Failed to regenerate message', { index, error });
      // Best-effort error state using snapshot index fallback
      this.setMessages(prev => {
        if (index < 0 || index >= prev.length) return prev;
        const t = prev[index];
        if (!t?.id) return prev;
        const updated = prev.slice();
        updated[index] = { ...t, state: 'error' };
        return updated;
      });
      throw error;
    } finally {
      this.regeneratingIndices.delete(index);
    }
  }

  isRegenerating(index: number): boolean {
    return this.regeneratingIndices.has(index);
  }
}

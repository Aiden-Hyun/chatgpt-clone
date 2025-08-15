// src/features/chat/services/implementations/ReactAnimationService.ts
import { TYPING_ANIMATION_SPEED } from '../../constants';
import { IAnimationService } from '../interfaces/IAnimationService';
import { MessageStateManager } from '../MessageStateManager';
import { ChatMessage } from '../types';

export class ReactAnimationService implements IAnimationService {
  private messageStateManager: MessageStateManager;
  private runningJobs: Map<string, { timer: ReturnType<typeof setTimeout> | null; index: number; target: string; speedMs: number }> = new Map();

  constructor(
    private setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>
  ) {
    console.log('[Service] ReactAnimationService initialized');
    this.messageStateManager = new MessageStateManager(setMessages);
  }

  private isImageMarkdown(content: string): boolean {
    const trimmed = (content || '').trim();
    if (!trimmed) return false;
    // Basic check for markdown image syntax ![alt](url)
    return /^!\[[^\]]*\]\([^\)]+\)/.test(trimmed);
  }

  setMessageFullContentAndAnimate(args: {
    fullContent: string;
    regenerateIndex?: number;
    messageId?: string;
  }): void {
    // Case 1: Regeneration by index - uses the new unified regeneration method
    if (args.regenerateIndex !== undefined) {
      this.setMessages((prev) => {
        const messageToUpdate = prev[args.regenerateIndex!];
        if (messageToUpdate?.id) {
          if (this.isImageMarkdown(args.fullContent)) {
            // Directly set image content and mark completed (skip typewriter)
            return prev.map(msg => msg.id === messageToUpdate.id
              ? { ...msg, content: args.fullContent, fullContent: undefined, state: 'completed' }
              : msg
            );
          } else {
            // Use our unified regeneration handler
            this.messageStateManager.handleRegeneration(
              messageToUpdate.id,
              args.fullContent
            );
            // Start centralized typewriter job for regeneration
            this.startTypewriterJob(messageToUpdate.id, args.fullContent);
          }
        }
        return prev;
      });
      return;
    }
    
    // Case 2: Direct message ID
    if (args.messageId) {
      if (this.isImageMarkdown(args.fullContent)) {
        // Directly set image content and mark completed (skip typewriter)
        this.setMessages(prev => prev.map(msg => msg.id === args.messageId
          ? { ...msg, content: args.fullContent, fullContent: undefined, state: 'completed' }
          : msg
        ));
      } else {
        // For new messages, use regular animation
        this.messageStateManager.finishStreamingAndAnimate(
          args.messageId,
          args.fullContent
        );
        this.startTypewriterJob(args.messageId, args.fullContent);
      }
      return;
    }
    
    // Case 3: Normal case for new messages (find last loading message)
    this.setMessages((prev) => {
      const lastLoadingAssistant = [...prev]
        .reverse()
        .find(
          (msg) => msg.role === 'assistant' && msg.state === 'loading'
        );
      if (lastLoadingAssistant?.id) {
        if (this.isImageMarkdown(args.fullContent)) {
          // Directly set image content and mark completed (skip typewriter)
          return prev.map(msg => msg.id === lastLoadingAssistant.id
            ? { ...msg, content: args.fullContent, fullContent: undefined, state: 'completed' }
            : msg
          );
        } else {
          this.messageStateManager.finishStreamingAndAnimate(
            lastLoadingAssistant.id,
            args.fullContent
          );
          this.startTypewriterJob(lastLoadingAssistant.id, args.fullContent);
        }
      }
      return prev;
    });
  }

  animateResponse(args: {
    fullContent: string;
    regenerateIndex?: number;
    messageId?: string;
    onComplete: () => void;
  }): void {
    args.onComplete();
  }

  private startTypewriterJob(messageId: string, fullContent: string, speedMs: number = TYPING_ANIMATION_SPEED): void {
    // Stop existing job if any
    this.stopTypewriterJob(messageId);
    this.runningJobs.set(messageId, { timer: null, index: 0, target: fullContent, speedMs });
    const tick = () => {
      const job = this.runningJobs.get(messageId);
      if (!job) return;
      if (job.index < job.target.length) {
        const nextIndex = job.index + 1;
        const nextSlice = job.target.slice(0, nextIndex);
        // Throttled state update: bump only content substring
        this.setMessages(prev => prev.map(msg => msg.id === messageId ? { ...msg, content: nextSlice, state: 'animating' } : msg));
        job.index = nextIndex;
        job.timer = setTimeout(tick, job.speedMs);
      } else {
        // Complete
        this.messageStateManager.markCompleted(messageId);
        this.stopTypewriterJob(messageId);
      }
    };
    // Prime first tick
    const job = this.runningJobs.get(messageId);
    if (!job) return;
    job.timer = setTimeout(tick, speedMs);
  }

  private stopTypewriterJob(messageId: string): void {
    const job = this.runningJobs.get(messageId);
    if (job?.timer) {
      clearTimeout(job.timer);
    }
    this.runningJobs.delete(messageId);
  }
}

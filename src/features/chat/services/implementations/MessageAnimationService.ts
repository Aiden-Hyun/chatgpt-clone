// src/features/chat/services/implementations/MessageAnimationService.ts
import type { ChatMessage } from "@/entities/message";
import { getLogger } from "@/shared/services/logger";

import {
  TYPING_ANIMATION_CHUNK_SIZE,
  TYPING_ANIMATION_MIN_TICK_MS,
} from "../../constants";
import { computeAnimationParams } from "../core/AnimationPolicy";
import { IAnimationService } from "../interfaces/IAnimationService";
import { MessageStateManager } from "../MessageStateManager";

export class MessageAnimationService implements IAnimationService {
  private messageStateManager: MessageStateManager;
  private logger = getLogger("MessageAnimationService");
  private runningJobs: Map<
    string,
    {
      timer: ReturnType<typeof setTimeout> | null;
      index: number;
      target: string;
      speedMs: number;
      chunkSize: number;
    }
  > = new Map();

  constructor(
    private setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>
  ) {
    this.logger.debug("MessageAnimationService initialized");
    this.messageStateManager = new MessageStateManager(setMessages);
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
          // Use our unified regeneration handler
          this.messageStateManager.handleRegeneration(
            messageToUpdate.id,
            args.fullContent
          );
          // Start centralized typewriter job for regeneration
          this.startTypewriterJob(messageToUpdate.id, args.fullContent);
        }
        return prev;
      });
      return;
    }

    // Case 2: Direct message ID
    if (args.messageId) {
      // For new messages, use regular animation
      this.messageStateManager.finishStreamingAndAnimate(
        args.messageId,
        args.fullContent
      );
      this.startTypewriterJob(args.messageId, args.fullContent);
      return;
    }

    // Case 3: Normal case for new messages (find last loading message)
    this.setMessages((prev) => {
      const lastLoadingAssistant = [...prev]
        .reverse()
        .find((msg) => msg.role === "assistant" && msg.state === "loading");
      if (lastLoadingAssistant?.id) {
        this.messageStateManager.finishStreamingAndAnimate(
          lastLoadingAssistant.id,
          args.fullContent
        );
        this.startTypewriterJob(lastLoadingAssistant.id, args.fullContent);
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

  private startTypewriterJob(
    messageId: string,
    fullContent: string,
    speedMs?: number
  ): void {
    // Stop existing job if any
    this.stopTypewriterJob(messageId);
    const { speedMs: computedSpeed, chunkSize } =
      computeAnimationParams(fullContent);
    const effectiveSpeed = Math.max(
      TYPING_ANIMATION_MIN_TICK_MS,
      speedMs ?? computedSpeed
    );
    this.runningJobs.set(messageId, {
      timer: null,
      index: 0,
      target: fullContent,
      speedMs: effectiveSpeed,
      chunkSize,
    });
    const tick = () => {
      const job = this.runningJobs.get(messageId);
      if (!job) return;
      if (job.index < job.target.length) {
        let nextIndex = job.index;
        const currentChar = job.target[nextIndex];

        if (/\s/.test(currentChar)) {
          while (
            nextIndex < job.target.length &&
            /\s/.test(job.target[nextIndex])
          ) {
            nextIndex++;
          }
        } else {
          nextIndex = Math.min(
            job.target.length,
            nextIndex + (job.chunkSize ?? TYPING_ANIMATION_CHUNK_SIZE)
          );
        }

        const nextSlice = job.target.slice(0, nextIndex);
        // Throttled state update: bump only content substring
        this.setMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageId
              ? { ...msg, content: nextSlice, state: "animating" }
              : msg
          )
        );
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
    job.timer = setTimeout(tick, job.speedMs);
  }

  private stopTypewriterJob(messageId: string): void {
    const job = this.runningJobs.get(messageId);
    if (job?.timer) {
      clearTimeout(job.timer);
    }
    this.runningJobs.delete(messageId);
  }
}

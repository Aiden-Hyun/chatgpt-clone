import type { ChatMessage } from "@/entities/message";

import { getLogger } from "../../../../../shared/services/logger";
import {
  TYPING_ANIMATION_CHUNK_SIZE,
  TYPING_ANIMATION_MIN_TICK_MS,
} from "../../../constants";
import { generateMessageId } from "../../../utils/messageIdGenerator";
import { MessageStateManager } from "../../MessageStateManager";
import { computeAnimationParams } from "../AnimationPolicy";

export interface AnimationRequest {
  fullContent: string;
  regenerateIndex?: number;
  messageId?: string;
  requestId: string;
}

export class MessageAnimation {
  private readonly logger = getLogger("MessageAnimation");
  private readonly messageStateManager: MessageStateManager;
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
    private setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>,
    private typingStateService: { setTyping: (isTyping: boolean) => void }
  ) {
    this.messageStateManager = new MessageStateManager(setMessages);
  }

  updateUIState(request: {
    regenerateIndex?: number;
    userMsg: ChatMessage;
    assistantMsg: ChatMessage;
    messageId?: string;
    requestId: string;
  }): void {
    const { regenerateIndex, userMsg, assistantMsg, messageId } = request;

    // Inlined from MessageStateService.updateMessageState()
    if (regenerateIndex !== undefined) {
      this.setMessages((prev) => {
        const messageToRegenerate = prev[regenerateIndex];
        if (messageToRegenerate?.id) {
          // Forward to the MessageStateManager
          // We can't call handleRegeneration here directly as we don't have new content yet
          // Just mark for regeneration and let MessageAnimationService handle full regeneration later
          this.messageStateManager.transition(
            messageToRegenerate.id,
            "loading"
          );
        } else {
          const updated = [...prev];
          updated[regenerateIndex] = {
            ...updated[regenerateIndex],
            content: "",
            state: "loading",
            id: generateMessageId(),
          };
          return updated;
        }
        return prev;
      });
    } else {
      const userMessageId = userMsg.id || generateMessageId();
      const assistantMessageId =
        messageId || assistantMsg.id || generateMessageId();

      this.messageStateManager.createMessagePair(
        userMessageId,
        userMsg.content,
        assistantMessageId
      );
    }

    // Only set typing for new messages, not for regeneration
    if (regenerateIndex === undefined) {
      this.logger.debug("Setting typing indicator ON for new message");
      this.typingStateService.setTyping(true);
    } else {
      this.logger.debug("Skipping typing indicator for regeneration");
    }

    this.logger.debug("UI state updated successfully");
  }

  animateResponse(request: AnimationRequest): void {
    const { fullContent, regenerateIndex, messageId, requestId } = request;

    this.logger.debug(
      `Starting response animation for request ${requestId} (${
        fullContent.length
      } chars, message ${messageId}, regeneration: ${
        regenerateIndex !== undefined ? "yes" : "no"
      })`
    );

    // Inlined from MessageAnimationService.setMessageFullContentAndAnimate()
    // Case 1: Regeneration by index - uses the new unified regeneration method
    if (regenerateIndex !== undefined) {
      this.setMessages((prev) => {
        const messageToUpdate = prev[regenerateIndex];
        if (messageToUpdate?.id) {
          // Use our unified regeneration handler
          this.messageStateManager.handleRegeneration(
            messageToUpdate.id,
            fullContent
          );
          // Start centralized typewriter job for regeneration
          this.startTypewriterJob(messageToUpdate.id, fullContent);
        }
        return prev;
      });
      return;
    }

    // Case 2: Direct message ID
    if (messageId) {
      // For new messages, use regular animation
      this.messageStateManager.finishStreamingAndAnimate(
        messageId,
        fullContent
      );
      this.startTypewriterJob(messageId, fullContent);
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
          fullContent
        );
        this.startTypewriterJob(lastLoadingAssistant.id, fullContent);
      }
      return prev;
    });
  }

  clearTypingState(): void {
    this.typingStateService.setTyping(false);
  }

  // Inlined from MessageAnimationService
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

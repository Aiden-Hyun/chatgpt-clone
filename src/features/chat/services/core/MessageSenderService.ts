// src/features/chat/services/core/MessageSenderService.ts
import { IAIApiService } from '../interfaces/IAIApiService';
import { IAnimationService } from '../interfaces/IAnimationService';
import { IChatRoomService } from '../interfaces/IChatRoomService';
import { IMessageService } from '../interfaces/IMessageService';
import { IMessageStateService } from '../interfaces/IMessageStateService';
import { INavigationService } from '../interfaces/INavigationService';
import { ITypingStateService } from '../interfaces/ITypingStateService';
import { IAIResponseProcessor } from './AIResponseProcessor';
import { MessageOrchestrator, SendMessageRequest, SendMessageResult } from './message-sender';

export { SendMessageRequest, SendMessageResult } from './message-sender';

export class MessageSenderService {
  private readonly orchestrator: MessageOrchestrator;

  constructor(
    chatRoomService: IChatRoomService,
    messageService: IMessageService,
    aiApiService: IAIApiService,
    navigationService: INavigationService,
    responseProcessor: IAIResponseProcessor,
    messageStateService: IMessageStateService,
    typingStateService: ITypingStateService,
    animationService: IAnimationService,
  ) {
    this.orchestrator = new MessageOrchestrator(
      aiApiService,
      responseProcessor,
      chatRoomService,
      messageService,
      animationService,
      messageStateService,
      typingStateService,
      navigationService
    );
  }

  async sendMessage(request: SendMessageRequest): Promise<SendMessageResult> {
    return this.orchestrator.sendMessage(request);
  }
} 
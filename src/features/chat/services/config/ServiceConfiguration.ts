// src/features/chat/services/config/ServiceConfiguration.ts
import { ServiceRegistry } from "../core/ServiceRegistry";
import {
  ChatAPIService,
  ExpoRouterNavigationService,
  MessageAnimationService,
  MessageRegenerationService,
  MessageStateService,
  SupabaseAuthService,
  SupabaseMessageService,
  TypingStateService,
} from "../implementations";

import { SupabaseChatRoomService } from "@/entities/chatRoom";

export function configureServices(): void {
  ServiceRegistry.register({
    aiApiService: ChatAPIService,
    chatRoomService: SupabaseChatRoomService,
    messageService: SupabaseMessageService,
    navigationService: ExpoRouterNavigationService,
    // New services
    messageStateService: MessageStateService,
    typingStateService: TypingStateService,
    animationService: MessageAnimationService,
    regenerationService: MessageRegenerationService,
    authService: SupabaseAuthService,
  });
}

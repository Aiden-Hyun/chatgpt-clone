// src/features/chat/services/config/ServiceConfiguration.ts
import { ServiceRegistry } from '../core/ServiceRegistry';
import {
  ExpoRouterNavigationService,
  OpenAIAPIService,
  ReactAnimationService,
  ReactMessageStateService,
  ReactRegenerationService,
  ReactTypingStateService,
  SupabaseChatRoomService,
  SupabaseMessageService,
} from '../implementations';

export function configureServices(): void {
  ServiceRegistry.register({
    aiApiService: OpenAIAPIService,
    chatRoomService: SupabaseChatRoomService,
    messageService: SupabaseMessageService,
    navigationService: ExpoRouterNavigationService,
    // New services
    messageStateService: ReactMessageStateService,
    typingStateService: ReactTypingStateService,
    animationService: ReactAnimationService,
    regenerationService: ReactRegenerationService,
  });
} 
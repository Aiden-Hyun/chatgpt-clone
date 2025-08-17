// src/features/chat/services/config/ServiceConfiguration.ts
import { ServiceRegistry } from '../core/ServiceRegistry';
import {
    ChatAPIService,
    ExpoRouterNavigationService,
    GoogleCustomSearchService,
    ReactAnimationService,
    ReactMessageStateService,
    ReactRegenerationService,
    ReactTypingStateService,
    SupabaseAuthService,
    SupabaseChatRoomService,
    SupabaseMessageService
} from '../implementations';

export function configureServices(): void {
  ServiceRegistry.register({
    aiApiService: ChatAPIService,
    chatRoomService: SupabaseChatRoomService,
    messageService: SupabaseMessageService,
    navigationService: ExpoRouterNavigationService,
    // New services
    messageStateService: ReactMessageStateService,
    typingStateService: ReactTypingStateService,
    animationService: ReactAnimationService,
    regenerationService: ReactRegenerationService,
    authService: SupabaseAuthService,
    searchService: GoogleCustomSearchService,
  });
} 
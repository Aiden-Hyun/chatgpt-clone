// src/features/chat/services/config/ServiceConfiguration.ts
import { ServiceRegistry } from '../core/ServiceRegistry';
import { ExpoRouterNavigationService } from '../implementations/ExpoRouterNavigationService';
import { MobileStorageService } from '../implementations/MobileStorageService';
import { OpenAIAPIService } from '../implementations/OpenAIAPIService';
import { ReactUIStateService } from '../implementations/ReactUIStateService';
import { SupabaseChatRoomService } from '../implementations/SupabaseChatRoomService';
import { SupabaseMessageService } from '../implementations/SupabaseMessageService';

export function configureServices(): void {
  ServiceRegistry.register({
    aiApiService: OpenAIAPIService,
    chatRoomService: SupabaseChatRoomService,
    messageService: SupabaseMessageService,
    storageService: MobileStorageService,
    navigationService: ExpoRouterNavigationService,
    uiStateService: ReactUIStateService,
  });
} 
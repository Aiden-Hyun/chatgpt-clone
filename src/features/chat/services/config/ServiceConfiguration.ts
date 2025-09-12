// src/features/chat/services/config/ServiceConfiguration.ts
import { SupabaseChatRoomService } from "@/entities/chatRoom";
import { SupabaseMessageService } from "@/entities/message";

import { ServiceRegistry } from "../core/ServiceRegistry";
import {
  ChatAPIService,
  MessageAnimationService,
  MessageStateService,
} from "../implementations";

export function configureServices(): void {
  ServiceRegistry.register({
    aiApiService: ChatAPIService,
    chatRoomService: SupabaseChatRoomService,
    messageService: SupabaseMessageService,
    // New services
    messageStateService: MessageStateService,
    animationService: MessageAnimationService,
  });
}

// src/features/chat/services/config/ServiceConfiguration.ts
import { SupabaseChatRoomService } from "@/entities/chatRoom";
import { SupabaseMessageService } from "@/entities/message";

import { ServiceRegistry } from "../core/ServiceRegistry";
import {
  MessageAnimationService,
} from "../implementations";

export function configureServices(): void {
  ServiceRegistry.register({
    chatRoomService: SupabaseChatRoomService,
    messageService: SupabaseMessageService,
    // New services
    animationService: MessageAnimationService,
  });
}

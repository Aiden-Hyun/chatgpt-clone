// src/features/chat/services/implementations/ExpoRouterNavigationService.ts
import { router } from 'expo-router';

import { INavigationService } from '../interfaces/INavigationService';

export class ExpoRouterNavigationService implements INavigationService {
  async navigateToRoom(roomId: number): Promise<void> {
    router.replace(`/chat/${roomId}`);
  }

  async navigateToHome(): Promise<void> {
    router.replace('/');
  }

  async navigateToNewChat(): Promise<void> {
    router.replace('/chat');
  }
} 
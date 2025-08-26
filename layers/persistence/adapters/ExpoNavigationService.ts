// Navigation service implementation using Expo Router
import { router } from 'expo-router';
import { INavigationService } from '../../business/interfaces/INavigationService';

export class ExpoNavigationService implements INavigationService {
  navigateToRoom(roomId: number): void {
    router.push(`/chat/${roomId}`);
  }

  navigateToChatList(): void {
    router.push('/chat');
  }

  navigateToSettings(): void {
    router.push('/settings');
  }

  navigateToAuth(): void {
    router.push('/auth');
  }

  goBack(): void {
    router.back();
  }

  replace(route: string): void {
    router.replace(route);
  }
}

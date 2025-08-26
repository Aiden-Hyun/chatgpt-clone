// Business layer interface - Port for navigation
export interface INavigationService {
  /**
   * Navigate to a new chat room
   */
  navigateToRoom(roomId: number): void;
  
  /**
   * Navigate to chat list
   */
  navigateToChatList(): void;
  
  /**
   * Navigate to settings
   */
  navigateToSettings(): void;
  
  /**
   * Navigate to authentication
   */
  navigateToAuth(): void;
  
  /**
   * Go back to previous screen
   */
  goBack(): void;
  
  /**
   * Replace current route
   */
  replace(route: string): void;
}

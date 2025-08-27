export type AuthEventCallback = (event: string, session: any) => void;
export type Unsubscribe = () => void;

export interface IAuthEventEmitter {
  subscribeToAuthChanges(callback: AuthEventCallback): Unsubscribe;
  onSignIn(callback: (session: any) => void): Unsubscribe;
  onSignOut(callback: () => void): Unsubscribe;
  onTokenRefresh(callback: (session: any) => void): Unsubscribe;
  onUserUpdate(callback: (session: any) => void): Unsubscribe;
}

/**
 * Application route constants
 * Define all route paths used in the application for type safety and centralized management
 */

/**
 * Main application routes
 */
export enum AppRoute {
  // Auth routes
  AUTH = '/auth',
  SIGN_IN = '/auth/sign-in',
  SIGN_UP = '/auth/sign-up',
  RESET_PASSWORD = '/auth/reset-password',
  
  // Main app routes
  HOME = '/',
  CHAT = '/chat',
  CHAT_ROOM = '/chat/[roomId]',
  SETTINGS = '/settings',
  SETTINGS_ACCOUNT = '/settings/account',
  SETTINGS_THEMES = '/settings/themes',
  DESIGN_SHOWCASE = '/design-showcase',
  
  // Error routes
  NOT_FOUND = '/not-found',
}

/**
 * Route parameter types
 */
export interface RouteParams {
  [AppRoute.CHAT_ROOM]: { roomId: string };
}

/**
 * Helper type to extract route parameters
 */
export type ParamsOf<T extends AppRoute> = T extends keyof RouteParams
  ? RouteParams[T]
  : Record<string, never>;

/**
 * Helper function to build a route with parameters
 */
export function buildRoute<T extends AppRoute>(
  route: T,
  params?: ParamsOf<T>
): string {
  if (!params) {
    return route;
  }

  let result = route;
  Object.entries(params).forEach(([key, value]) => {
    result = result.replace(`[${key}]`, String(value));
  });
  
  return result;
}

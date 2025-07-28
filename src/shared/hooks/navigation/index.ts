// Navigation hooks barrel export
export { useNavigationActions } from './useNavigationActions';
export { useNavigationCombined } from './useNavigationCombined';
export { useNavigationState, type NavigationState } from './useNavigationState';
export { useRouteNavigation } from './useRouteNavigation';

// Backward compatibility - export the combined hook as the default useNavigation
export { useNavigationCombined as useNavigation } from './useNavigationCombined';

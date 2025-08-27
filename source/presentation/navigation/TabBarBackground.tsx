// This is a shim for web and Android where the tab bar is generally opaque.
export default undefined;

/**
 * Hook to get the amount of overflow needed for the bottom tab bar
 * Returns 0 for platforms other than iOS
 */
export function useBottomTabOverflow() {
  return 0;
}
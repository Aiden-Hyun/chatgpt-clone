import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { StyleSheet } from 'react-native';

/**
 * A blurred background for the tab bar on iOS
 */
export default function BlurTabBarBackground() {
  return (
    <BlurView
      // System chrome material automatically adapts to the system's theme
      // and matches the native tab bar appearance on iOS.
      tint="systemChromeMaterial"
      intensity={100}
      style={StyleSheet.absoluteFill}
    />
  );
}

/**
 * Hook to get the amount of overflow needed for the bottom tab bar on iOS
 */
export function useBottomTabOverflow() {
  return useBottomTabBarHeight();
}
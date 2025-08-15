import React, { useEffect } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity
} from 'react-native';
import Reanimated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { useAppTheme } from '../../theme/theme';

interface ToastProps {
  visible: boolean;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  onHide?: () => void;
  onPress?: () => void;
}

export const Toast: React.FC<ToastProps> = ({
  visible,
  message,
  type = 'info',
  duration = 3000,
  onHide,
  onPress,
}) => {
  const theme = useAppTheme();
  const styles = createStyles(theme, type);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(-100);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ translateY: translateY.value }],
    };
  });

  useEffect(() => {
    if (visible) {
      showToast();
    } else if (opacity.value > 0) { // Only hide if it was visible
      hideToast();
    }
  }, [visible]);

  const showToast = () => {
    opacity.value = withTiming(1, { duration: 300 });
    translateY.value = withTiming(0, { duration: 300 });

    const timer = setTimeout(() => {
      hideToast();
    }, duration);

    return () => clearTimeout(timer);
  };

  const hideToast = () => {
    opacity.value = withTiming(0, { duration: 200 });
    translateY.value = withTiming(-100, { duration: 200 }, (isFinished) => {
      if (isFinished) {
        // Safely run the state update on the JS thread
        if (onHide) runOnJS(onHide)();
      }
    });
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return 'ℹ️';
    }
  };

  if (!visible && opacity.value === 0) return null;

  return (
    <Reanimated.View
      style={[
        styles.container,
        { pointerEvents: 'box-none' },
        animatedStyle,
      ]}
    >
      <TouchableOpacity
        style={styles.toast}
        onPress={onPress}
        activeOpacity={0.8}
        // Important: keep the touchable itself clickable, but don't block outside
        // This works cross-platform without modal
      >
        <Text style={styles.icon}>{getIcon()}</Text>
        <Text style={styles.message}>{message}</Text>
        <TouchableOpacity onPress={hideToast} style={styles.closeButton}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    </Reanimated.View>
  );
};

const createStyles = (theme: any, type: string) => StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    right: 20,
    zIndex: 9999,
  },
  toast: {
    backgroundColor: type === 'success' 
      ? theme.colors.status.success.primary 
      : type === 'error' 
      ? theme.colors.status.error.primary 
      : type === 'warning' 
      ? theme.colors.status.warning.primary 
      : theme.colors.primary,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    ...theme.shadows.medium,
  },
  icon: {
    fontSize: theme.fontSizes.lg,
    marginRight: theme.spacing.sm,
  },
  message: {
    flex: 1,
    color: theme.colors.text.inverted,
    fontSize: theme.fontSizes.md,
    fontWeight: theme.fontWeights.medium as '500',
    fontFamily: theme.fontFamily.primary,
  },
  closeButton: {
    padding: theme.spacing.xs,
    marginLeft: theme.spacing.sm,
  },
  closeText: {
    color: theme.colors.text.inverted,
    fontSize: theme.fontSizes.sm,
    fontWeight: theme.fontWeights.bold as '700',
  },
}); 
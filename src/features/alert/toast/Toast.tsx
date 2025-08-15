import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity
} from 'react-native';
import Reanimated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useAppTheme } from '../../theme/theme';

interface ToastProps {
  visible: boolean;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  onHide?: () => void;
  onPress?: () => void;
  animation?: 'slide' | 'fade' | 'scale' | 'spring' | 'none';
  dismissAnimation?: 'slide' | 'fade' | 'scale' | 'spring' | 'none';
  position?: 'bottom' | 'top';
  slideDistance?: number;
}

export const Toast: React.FC<ToastProps> = ({
  visible,
  message,
  type = 'info',
  duration = 3000,
  onHide,
  onPress,
  animation = 'fade',
  dismissAnimation,
  position = 'bottom',
  slideDistance = 100,
}) => {
  const theme = useAppTheme();
  const styles = createStyles(theme, type, position);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  // Track mount state to avoid reading shared values during render
  const [mounted, setMounted] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const animationIdRef = useRef(0);

  const hiddenOffset = position === 'bottom' ? -Math.abs(slideDistance) : Math.abs(slideDistance);
  const exitMode = dismissAnimation ?? animation;

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [
        { translateY: translateY.value },
        { scale: scale.value },
      ],
    };
  });

  useEffect(() => {
    if (visible) {
      const nextId = animationIdRef.current + 1;
      animationIdRef.current = nextId;
      if (!mounted) setMounted(true);
      showToast(nextId);
    } else if (mounted) {
      // Only attempt to hide if we were mounted
      hideToast(animationIdRef.current);
    }
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [visible, mounted, animation, exitMode, hiddenOffset, duration]);

  const showToast = (id: number) => {
    switch (animation) {
      case 'none':
        opacity.value = 1;
        translateY.value = 0;
        scale.value = 1;
        break;
      case 'fade':
        opacity.value = 0;
        translateY.value = 0;
        scale.value = 1;
        opacity.value = withTiming(1, { duration: 250 });
        break;
      case 'scale':
        opacity.value = 0;
        translateY.value = 0;
        scale.value = 0.96;
        opacity.value = withTiming(1, { duration: 220 });
        scale.value = withTiming(1, { duration: 220 });
        break;
      case 'spring':
        opacity.value = 0;
        translateY.value = hiddenOffset;
        scale.value = 1;
        opacity.value = withTiming(1, { duration: 180 });
        translateY.value = withSpring(0, { damping: 14, stiffness: 140, mass: 0.9 });
        break;
      case 'slide':
      default:
        opacity.value = 0;
        translateY.value = hiddenOffset;
        scale.value = 1;
        opacity.value = withTiming(1, { duration: 220 });
        translateY.value = withTiming(0, { duration: 300 });
        break;
    }

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    if (duration > 0) {
      timerRef.current = setTimeout(() => {
        hideToast(id);
      }, duration);
    }
  };

  const hideToast = (id?: number) => {
    const finalize = () => {
      if (id === undefined || id === animationIdRef.current) {
        if (onHide) runOnJS(onHide)();
        runOnJS(setMounted)(false);
      }
    };

    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    switch (exitMode) {
      case 'none':
        opacity.value = 0;
        translateY.value = position === 'bottom' ? -8 : 8;
        finalize();
        break;
      case 'fade':
        opacity.value = withTiming(0, { duration: 180 }, (finished) => {
          if (finished) finalize();
        });
        break;
      case 'scale':
        opacity.value = withTiming(0, { duration: 160 });
        scale.value = withTiming(0.96, { duration: 160 }, (finished) => {
          if (finished) finalize();
        });
        break;
      case 'spring':
        opacity.value = withTiming(0, { duration: 160 });
        translateY.value = withSpring(hiddenOffset, { damping: 16, stiffness: 140, mass: 0.9 }, (finished) => {
          if (finished) finalize();
        });
        break;
      case 'slide':
      default:
        opacity.value = withTiming(0, { duration: 160 });
        translateY.value = withTiming(hiddenOffset, { duration: 220 }, (finished) => {
          if (finished) finalize();
        });
        break;
    }
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
      default:
        return 'ℹ️';
    }
  };

  // Do not read shared values during render
  if (!mounted) return null;

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
        <TouchableOpacity onPress={() => hideToast(animationIdRef.current)} style={styles.closeButton}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    </Reanimated.View>
  );
};

const createStyles = (theme: any, type: string, position: 'bottom' | 'top') => StyleSheet.create({
  container: {
    position: 'absolute',
    ...(position === 'bottom' ? { bottom: 24 } : { top: 24 }),
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
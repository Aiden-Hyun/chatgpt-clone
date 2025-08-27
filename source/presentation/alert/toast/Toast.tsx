import React, { useEffect, useRef } from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { AlertType, DEFAULT_TOAST_DURATION_MS } from '../../../business/alert/constants/alertConstants';
import { useAppTheme } from '../../../business/theme';

interface ToastProps {
  visible: boolean;
  message: string;
  type?: AlertType;
  duration?: number;
  onHide?: () => void;
  onPress?: () => void;
  position?: 'bottom' | 'top';
}

export const Toast: React.FC<ToastProps> = ({
  visible,
  message,
  type = AlertType.INFO,
  duration = DEFAULT_TOAST_DURATION_MS,
  onHide,
  onPress,
  position = 'bottom',
}) => {
  const theme = useAppTheme();
  const styles = createStyles(theme, type, position);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const animationIdRef = useRef(0);

  useEffect(() => {
    if (visible) {
      const nextId = animationIdRef.current + 1;
      animationIdRef.current = nextId;
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      if (duration > 0) {
        timerRef.current = setTimeout(() => {
          if (nextId === animationIdRef.current) {
            onHide?.();
          }
        }, duration);
      }
    }
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [visible, duration, onHide]);

  const getIcon = () => {
    switch (type) {
      case AlertType.SUCCESS:
        return '✅';
      case AlertType.ERROR:
        return '❌';
      case AlertType.WARNING:
        return '⚠️';
      case AlertType.INFO:
      default:
        return 'ℹ️';
    }
  };

  if (!visible) return null;

  return (
    <View
      style={[
        styles.container,
        { pointerEvents: 'box-none' },
      ]}
    >
      <TouchableOpacity
        style={styles.toast}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <Text style={styles.icon}>{getIcon()}</Text>
        <Text style={styles.message}>{message}</Text>
        <TouchableOpacity onPress={onHide} style={styles.closeButton}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    </View>
  );
};

const createStyles = (theme: any, type: AlertType, position: 'bottom' | 'top') => StyleSheet.create({
  container: {
    position: 'absolute',
    ...(position === 'bottom' ? { bottom: 24 } : { top: 24 }),
    left: 20,
    right: 20,
    zIndex: 9999,
  },
  toast: {
    backgroundColor: type === AlertType.SUCCESS 
      ? theme.colors.status.success.primary 
      : type === AlertType.ERROR 
      ? theme.colors.status.error.primary 
      : type === AlertType.WARNING 
      ? theme.colors.status.warning.primary 
      : theme.colors.primary,
    borderRadius: theme.borders.radius.lg,
    padding: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    ...theme.shadows.medium,
  },
  icon: {
    fontSize: theme.typography.fontSizes.lg,
    marginRight: theme.spacing.sm,
  },
  message: {
    flex: 1,
    color: theme.colors.text.inverted,
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.medium,
    fontFamily: theme.typography.fontFamily.primary,
  },
  closeButton: {
    padding: theme.spacing.xs,
    marginLeft: theme.spacing.sm,
  },
  closeText: {
    color: theme.colors.text.inverted,
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.bold,
  },
});
import React from "react";
import {
  Dimensions,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { AppTheme, useAppTheme } from "../../theme/theme";

interface CustomAlertProps {
  visible: boolean;
  title: string;
  message: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  type?: "success" | "error" | "warning" | "info";
}

export const CustomAlert: React.FC<CustomAlertProps> = ({
  visible,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "OK",
  cancelText = "Cancel",
  type = "info",
}) => {
  const theme = useAppTheme();
  const styles = createStyles(theme, type);

  const handleConfirm = () => {
    onConfirm?.();
  };

  const handleCancel = () => {
    onCancel?.();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
          </View>

          <View style={styles.content}>
            <Text style={styles.message}>{message}</Text>
          </View>

          <View style={styles.actions}>
            {onCancel && (
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={handleCancel}
              >
                <Text style={styles.cancelButtonText}>{cancelText}</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.button, styles.confirmButton]}
              onPress={handleConfirm}
            >
              <Text style={styles.confirmButtonText}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const createStyles = (theme: AppTheme, type: string) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "center",
      alignItems: "center",
    },
    container: {
      backgroundColor: theme.colors.background.primary,
      borderRadius: theme.borders.radius.lg,
      padding: theme.spacing.lg,
      margin: theme.spacing.lg,
      maxWidth: Dimensions.get("window").width - 40,
      minWidth: 280,
      ...theme.shadows.medium,
    },
    header: {
      marginBottom: theme.spacing.md,
    },
    title: {
      fontSize: theme.typography.fontSizes.lg,
      fontWeight: theme.typography.fontWeights.semibold as "600",
      color: theme.colors.text.primary,
      textAlign: "center",
      fontFamily: theme.typography.fontFamily.primary,
    },
    content: {
      marginBottom: theme.spacing.lg,
    },
    message: {
      fontSize: theme.typography.fontSizes.md,
      color: theme.colors.text.secondary,
      textAlign: "center",
      lineHeight: 20,
      fontFamily: theme.typography.fontFamily.primary,
    },
    actions: {
      flexDirection: "row",
      justifyContent: "center",
      gap: theme.spacing.md,
    },
    button: {
      flex: 1,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      borderRadius: theme.borders.radius.md,
      alignItems: "center",
    },
    confirmButton: {
      backgroundColor:
        type === "success"
          ? theme.colors.status.success.primary
          : type === "error"
          ? theme.colors.status.error.primary
          : type === "warning"
          ? theme.colors.status.warning.primary
          : theme.colors.primary,
    },
    cancelButton: {
      backgroundColor: theme.colors.background.secondary,
      borderWidth: 1,
      borderColor: theme.borders.colors.medium,
    },
    confirmButtonText: {
      color: theme.colors.text.inverted,
      fontSize: theme.typography.fontSizes.md,
      fontWeight: theme.typography.fontWeights.medium as "500",
      fontFamily: theme.typography.fontFamily.primary,
    },
    cancelButtonText: {
      color: theme.colors.text.primary,
      fontSize: theme.typography.fontSizes.md,
      fontWeight: theme.typography.fontWeights.medium as "500",
      fontFamily: theme.typography.fontFamily.primary,
    },
  });

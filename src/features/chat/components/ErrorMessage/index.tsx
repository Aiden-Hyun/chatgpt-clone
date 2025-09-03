// src/features/chat/components/ErrorMessage/index.tsx
import React from "react";
import { View } from "react-native";

import type { ChatMessage } from "@/entities/message";
import { Button, Text } from "@/shared/components/ui";

import { useAppTheme } from "../../../theme/theme";

import { createErrorMessageStyles } from "./ErrorMessage.styles";

interface ErrorMessageProps {
  message: ChatMessage;
  onRetry: () => void;
  style?: React.ComponentProps<typeof View>["style"];
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  onRetry,
  style,
}) => {
  const theme = useAppTheme();
  const styles = createErrorMessageStyles(theme);

  return (
    <View style={[styles.container, style]}>
      <View style={styles.errorContent}>
        <Text style={styles.errorText}>
          {message?.content?.trim()?.length
            ? message.content
            : "Failed to generate response"}
        </Text>
        {!message?.content?.trim()?.length && (
          <Text style={styles.errorSubtext}>
            Something went wrong. Please try again.
          </Text>
        )}

        <Button
          label="Retry"
          variant="primary"
          status="error"
          size="sm"
          onPress={onRetry}
          containerStyle={styles.retryButton}
        />
      </View>
    </View>
  );
};

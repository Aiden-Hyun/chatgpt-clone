import { Button } from "@/shared/components/ui/Button";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { View } from "react-native";
import { useToast } from "../../../alert";
import { useAppTheme } from "../../../theme/theme";
import { createAssistantMessageBarStyles } from "./AssistantMessageBar.styles";

interface AssistantMessageBarProps {
  onRegenerate?: () => void;
  onLike?: () => void;
  onDislike?: () => void;
  onShare?: () => void;
  onCopy?: () => void;
  onAudio?: () => void;
  // Like/dislike state
  isLiked?: boolean;
  isDisliked?: boolean;
}

export const AssistantMessageBar: React.FC<AssistantMessageBarProps> = ({
  onRegenerate,
  onLike,
  onDislike,
  onShare,
  onCopy,
  onAudio,
  isLiked = false,
  isDisliked = false,
}) => {
  const theme = useAppTheme();
  const styles = createAssistantMessageBarStyles(theme);
  const { showSuccess } = useToast();
  const handleRegeneratePress = () => {
    onRegenerate?.();
  };

  return (
    <View style={styles.container}>
      <View style={styles.buttonRow}>
        <Button
          variant="ghost"
          size="sm"
          leftIcon={
            <Ionicons
              name="refresh-outline"
              size={16}
              color={theme.colors.text.secondary}
            />
          }
          onPress={handleRegeneratePress}
          containerStyle={styles.iconButton}
        />

        <Button
          variant="ghost"
          size="sm"
          leftIcon={
            <Ionicons
              name="thumbs-up-outline"
              size={16}
              color={
                isLiked ? theme.colors.primary : theme.colors.text.secondary
              }
            />
          }
          onPress={onLike}
          containerStyle={styles.iconButton}
        />

        <Button
          variant="ghost"
          size="sm"
          leftIcon={
            <Ionicons
              name="thumbs-down-outline"
              size={16}
              color={
                isDisliked
                  ? theme.colors.status.error.primary
                  : theme.colors.text.secondary
              }
            />
          }
          onPress={onDislike}
          containerStyle={styles.iconButton}
        />

        <Button
          variant="ghost"
          size="sm"
          leftIcon={
            <Ionicons
              name="volume-high-outline"
              size={16}
              color={theme.colors.text.secondary}
            />
          }
          onPress={onAudio}
          containerStyle={styles.iconButton}
        />

        <Button
          variant="ghost"
          size="sm"
          leftIcon={
            <Ionicons
              name="copy-outline"
              size={16}
              color={theme.colors.text.secondary}
            />
          }
          onPress={() => {
            onCopy?.();
          }}
          containerStyle={styles.iconButton}
        />

        <Button
          variant="ghost"
          size="sm"
          leftIcon={
            <Ionicons
              name="share-outline"
              size={16}
              color={theme.colors.text.secondary}
            />
          }
          onPress={async () => {
            try {
              await onShare?.();
            } catch {}
          }}
          containerStyle={styles.iconButton}
        />
      </View>
    </View>
  );
};

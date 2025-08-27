import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { useThemeContext } from '../../../../../layers/business/theme/context/ThemeContext';
import { ModelSelector } from '../ModelSelector';
import { createChatHeaderStyles } from './ChatHeader.styles';

interface ChatHeaderProps {
  roomName: string;
  messageCount: number;
  isLoading: boolean;
  selectedModel: string;
  onModelChange: (model: string) => Promise<void>;
  onBack?: () => void;
  onSettings?: () => void;
}

export function ChatHeader({
  roomName,
  messageCount,
  isLoading,
  selectedModel,
  onModelChange,
  onBack,
  onSettings,
}: ChatHeaderProps) {
  const { currentTheme } = useThemeContext();
  const styles = useMemo(() => createChatHeaderStyles(currentTheme), [currentTheme]);

  return (
    <View style={styles.header}>
      <View style={styles.leftSection}>
        {onBack && (
          <TouchableOpacity onPress={onBack}>
            <Ionicons
              name="chevron-back"
              size={24}
              color={currentTheme.colors.text.primary}
            />
          </TouchableOpacity>
        )}
        <Text style={styles.title}>{roomName}</Text>
        <Text style={styles.messageCount}>({messageCount})</Text>
        {isLoading && (
          <ActivityIndicator
            size="small"
            color={currentTheme.colors.text.tertiary}
            style={styles.loadingIndicator}
          />
        )}
      </View>

      <View style={styles.rightSection}>
        <ModelSelector
          selectedModel={selectedModel}
          onModelChange={onModelChange}
          disabled={isLoading}
        />
        {onSettings && (
          <TouchableOpacity onPress={onSettings}>
            <Ionicons
              name="settings-outline"
              size={24}
              color={currentTheme.colors.text.primary}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

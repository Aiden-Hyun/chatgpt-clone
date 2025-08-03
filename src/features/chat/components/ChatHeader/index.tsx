import React, { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { QuickActionsMenu } from '../../../../shared/components';
import { createChatHeaderStyles } from './ChatHeader.styles';

interface ChatHeaderProps {
  onLogout: () => void;
  onSettings: () => void;
  // Model selection props for chat rooms
  selectedModel?: string;
  onModelChange?: (model: string) => void;
}

/**
 * ChatHeader
 * Renders the top bar of the chat screen containing a menu button for quick actions.
 */
const ChatHeader: React.FC<ChatHeaderProps> = ({
  onLogout,
  onSettings,
  selectedModel,
  onModelChange,
}) => {
  const [isQuickActionsVisible, setIsQuickActionsVisible] = useState(false);
  const styles = createChatHeaderStyles();

  return (
    <View style={styles.header}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Chat</Text>
      </View>
      
      {/* Quick Actions Menu Button */}
      <TouchableOpacity 
        style={styles.menuButton} 
        onPress={() => setIsQuickActionsVisible(!isQuickActionsVisible)}
      >
        <Text style={styles.menuButtonText}>⋯</Text>
      </TouchableOpacity>

      {/* Quick Actions Menu Dropdown */}
      <QuickActionsMenu 
        isVisible={isQuickActionsVisible} 
        onClose={() => setIsQuickActionsVisible(false)}
        onLogout={onLogout}
        onSettings={onSettings}
        selectedModel={selectedModel}
        onModelChange={onModelChange}
        showModelSelection={true}
      />
    </View>
  );
};

export default ChatHeader; 
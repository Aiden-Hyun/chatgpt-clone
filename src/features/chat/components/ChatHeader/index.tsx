import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { ChatSidebar, QuickActionsMenu, useSidebar } from '../../../../features/ui';
import { useAppTheme } from '../../../theme/lib/theme';
import { createChatHeaderStyles } from './ChatHeader.styles';

interface ChatHeaderProps {
  onLogout: () => void;
  onSettings: () => void;
  onBack: () => void;
  onNewChat: () => void;
  onChatSelect: (roomId: string) => void;
  selectedChatId?: string;
  // Model selection props for chat rooms
  selectedModel?: string;
  onModelChange?: (model: string) => void;
  showModelSelection?: boolean;
}

/**
 * ChatHeader
 * Renders the top bar of the chat screen containing a menu button, title, and more options button.
 */
const ChatHeader: React.FC<ChatHeaderProps> = ({
  onLogout,
  onSettings,
  onBack,
  onNewChat,
  onChatSelect,
  selectedChatId,
  selectedModel,
  onModelChange,
  showModelSelection = true,
}) => {
  const { isSidebarOpen, openSidebar, closeSidebar } = useSidebar();
  const [isQuickActionsVisible, setIsQuickActionsVisible] = useState(false);
  const theme = useAppTheme();
  const styles = React.useMemo(() => createChatHeaderStyles(theme), [theme]);

  const handleSettings = () => {
    setIsQuickActionsVisible(false);
    onSettings();
  };

  const handleDesignShowcase = () => {
    setIsQuickActionsVisible(false);
    router.push('/design-showcase');
  };

  const handleLogout = () => {
    setIsQuickActionsVisible(false);
    onLogout();
  };

  return (
    <View style={styles.header}>
      {/* Menu Button (Left) */}
      <TouchableOpacity 
        style={styles.menuButton} 
        onPress={openSidebar}
      >
        <MaterialIcons name="menu" size={24} color={styles.menuButtonText.color} />
      </TouchableOpacity>

      {/* Title */}
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Chat</Text>
      </View>
      
      {/* More Options Button (Right) */}
      <TouchableOpacity 
        style={styles.menuButton} 
        onPress={() => setIsQuickActionsVisible(!isQuickActionsVisible)}
      >
        <MaterialIcons name="more-vert" size={24} color={styles.menuButtonText.color} />
      </TouchableOpacity>

      {/* Chat Sidebar */}
      <ChatSidebar 
        isVisible={isSidebarOpen}
        onClose={closeSidebar}
        onNewChat={onNewChat}
        onChatSelect={onChatSelect}
        onSettings={onSettings}
        onLogout={onLogout}
        selectedChatId={selectedChatId}
      />

      {/* Quick Actions Menu Dropdown */}
      <QuickActionsMenu 
        isVisible={isQuickActionsVisible} 
        onClose={() => setIsQuickActionsVisible(false)}
        onLogout={handleLogout}
        onSettings={handleSettings}
        onDesignShowcase={handleDesignShowcase}
        selectedModel={selectedModel}
        onModelChange={onModelChange}
        showModelSelection={showModelSelection}
      />
    </View>
  );
};

export default ChatHeader; 
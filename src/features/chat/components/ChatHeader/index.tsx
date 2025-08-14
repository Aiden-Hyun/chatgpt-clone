import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';
import { OpenAILogo } from '../../../../components';
import { QuickActionsMenu } from '../../../../components/navigation/QuickActionsMenu';
import { useAppTheme } from '../../../theme/theme';
import { AVAILABLE_MODELS, DEFAULT_MODEL } from '../../constants';
import { ChatSidebar } from '../ChatSidebar';
import { useSidebar } from '../useSidebar';
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
  const [isModelMenuVisible, setIsModelMenuVisible] = useState(false);
  const theme = useAppTheme();
  const styles = React.useMemo(() => createChatHeaderStyles(theme), [theme]);

  const selectedModelLabel = useMemo(() => {
    const current = selectedModel ?? DEFAULT_MODEL;
    const found = AVAILABLE_MODELS.find(m => m.value === current);
    return found?.label ?? current;
  }, [selectedModel]);

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

      {/* Inline Model Selector (Center) */}
      {showModelSelection ? (
        <TouchableOpacity
          style={styles.modelSelector}
          onPress={() => setIsModelMenuVisible(true)}
          activeOpacity={0.8}
        >
          <OpenAILogo size={16} />
          <Text style={styles.modelSelectorText}>{selectedModelLabel}</Text>
          <MaterialIcons name="expand-more" size={20} color={styles.menuButtonText.color} />
        </TouchableOpacity>
      ) : (
        <View style={styles.titleContainer} />
      )}
      
      {/* More Options Button (Right) */}
      <TouchableOpacity 
        style={styles.menuButton} 
        onPress={() => setIsQuickActionsVisible(!isQuickActionsVisible)}
      >
        <MaterialIcons name="more-vert" size={24} color={styles.menuButtonText.color} />
      </TouchableOpacity>

      {/* Model Selection Dropdown */}
      <Modal
        visible={isModelMenuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsModelMenuVisible(false)}
      >
        <TouchableOpacity style={styles.modelMenuOverlay} onPress={() => setIsModelMenuVisible(false)} activeOpacity={1}>
          <View style={styles.modelMenuContainer}>
            {AVAILABLE_MODELS.map(model => {
              const isSelected = (selectedModel ?? DEFAULT_MODEL) === model.value;
              return (
                <TouchableOpacity
                  key={model.value}
                  style={[styles.modelMenuItem, isSelected && styles.selectedModelMenuItem]}
                  onPress={() => {
                    onModelChange?.(model.value);
                    setIsModelMenuVisible(false);
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <OpenAILogo size={16} />
                    <Text style={[styles.modelMenuText, { marginLeft: 8 }, isSelected && styles.selectedModelMenuText]}>
                      {model.label}
                    </Text>
                  </View>
                  {isSelected && (
                    <MaterialIcons name="check" size={20} color={theme.colors.status.info.primary} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </TouchableOpacity>
      </Modal>

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
        onModelChange={(m) => { if (__DEV__) console.log('[Header] onModelChange', m); onModelChange?.(m); }}
        showModelSelection={false}
      />
    </View>
  );
};

export default ChatHeader; 
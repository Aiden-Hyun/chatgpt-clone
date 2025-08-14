import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { AnthropicLogo, OpenAILogo } from '../../../../components';
import { useLanguageContext } from '../../../language';
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
  const { t } = useLanguageContext();
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
          {(() => {
            const provider = AVAILABLE_MODELS.find(m => m.value === (selectedModel ?? DEFAULT_MODEL))?.provider;
            if (provider === 'anthropic') return <AnthropicLogo size={16} />;
            return <OpenAILogo size={16} />;
          })()}
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
            <ScrollView style={styles.modelListContainer}>
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
                      {model.provider === 'openai' && <OpenAILogo size={16} />}
                      {model.provider === 'anthropic' && <AnthropicLogo size={16} />}
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
            </ScrollView>
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
      <Modal
        visible={isQuickActionsVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsQuickActionsVisible(false)}
      >
        <TouchableOpacity style={styles.quickActionsOverlay} onPress={() => setIsQuickActionsVisible(false)} activeOpacity={1}>
          <View style={styles.quickActionsContainer}>
            <TouchableOpacity
              style={styles.quickActionsMenuItem}
              onPress={handleSettings}
            >
              <Text style={styles.quickActionsMenuText}>{t('menu.settings')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionsMenuItem}
              onPress={handleDesignShowcase}
            >
              <Text style={styles.quickActionsMenuText}>{t('menu.design_showcase')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionsMenuItem}
              onPress={handleLogout}
            >
              <Text style={styles.quickActionsMenuText}>{t('menu.logout')}</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default ChatHeader; 
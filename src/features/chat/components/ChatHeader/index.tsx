import { Button } from '@/components/ui';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Modal, ScrollView, TouchableOpacity, View } from 'react-native';
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
      <Button
        variant="ghost"
        size="sm"
        leftIcon={<MaterialIcons name="menu" size={24} color={theme.colors.text.primary} />}
        onPress={openSidebar}
        containerStyle={styles.menuButton}
      />

      {/* Inline Model Selector (Center) */}
      {showModelSelection ? (
        <Button
          variant="ghost"
          size="sm"
          label={selectedModelLabel}
          rightIcon={<MaterialIcons name="expand-more" size={20} color={theme.colors.text.primary} />}
          leftIcon={(() => {
            const provider = AVAILABLE_MODELS.find(m => m.value === (selectedModel ?? DEFAULT_MODEL))?.provider;
            if (provider === 'anthropic') return <AnthropicLogo size={16} />;
            return <OpenAILogo size={16} />;
          })()}
          onPress={() => setIsModelMenuVisible(true)}
          containerStyle={styles.modelSelector}
        />
      ) : (
        <View style={styles.titleContainer} />
      )}
      
      {/* More Options Button (Right) */}
      <Button
        variant="ghost"
        size="sm"
        leftIcon={<MaterialIcons name="more-vert" size={24} color={theme.colors.text.primary} />}
        onPress={() => setIsQuickActionsVisible(!isQuickActionsVisible)}
        containerStyle={styles.menuButton}
      />

      {/* Model Selection Dropdown */}
      <Modal
        visible={isModelMenuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsModelMenuVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modelMenuOverlay} 
          onPress={() => setIsModelMenuVisible(false)} 
          activeOpacity={1}
        >
          <View style={styles.modelMenuContainer}>
            <ScrollView style={styles.modelListContainer}>
              {AVAILABLE_MODELS.map(model => {
                const isSelected = (selectedModel ?? DEFAULT_MODEL) === model.value;
                return (
                  <Button
                    key={model.value}
                    variant="ghost"
                    size="sm"
                    label={model.label}
                    leftIcon={
                      <>
                        {model.provider === 'openai' && <OpenAILogo size={16} />}
                        {model.provider === 'anthropic' && <AnthropicLogo size={16} />}
                      </>
                    }
                    rightIcon={isSelected ? <MaterialIcons name="check" size={20} color={theme.colors.status.info.primary} /> : undefined}
                    onPress={() => {
                      onModelChange?.(model.value);
                      setIsModelMenuVisible(false);
                    }}
                    containerStyle={[styles.modelMenuItem, isSelected && styles.selectedModelMenuItem]}
                  />
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
        <TouchableOpacity 
          style={styles.quickActionsOverlay} 
          onPress={() => setIsQuickActionsVisible(false)} 
          activeOpacity={1}
        >
          <View style={styles.quickActionsContainer}>
            <Button
              variant="ghost"
              size="sm"
              label={t('menu.settings')}
              onPress={handleSettings}
              containerStyle={styles.quickActionsMenuItem}
            />

            <Button
              variant="ghost"
              size="sm"
              label={t('menu.design_showcase')}
              onPress={handleDesignShowcase}
              containerStyle={styles.quickActionsMenuItem}
            />

            <Button
              variant="ghost"
              size="sm"
              label={t('menu.logout')}
              onPress={handleLogout}
              containerStyle={styles.quickActionsMenuItem}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default ChatHeader; 
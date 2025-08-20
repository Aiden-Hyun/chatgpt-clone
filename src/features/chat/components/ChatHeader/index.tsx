import { Button } from '@/components/ui';
import { MaterialIcons } from '@expo/vector-icons';
import { router, useNavigation } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { AnthropicLogo, OpenAILogo } from '../../../../components';
import { useLanguageContext } from '../../../language';
import { useAppTheme } from '../../../theme/theme';
import { AVAILABLE_MODELS, DEFAULT_MODEL, getModelInfo } from '../../constants';
import { ModelCapabilityIcons } from '../ModelCapabilityIcons';
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
  const navigation = useNavigation();
  const [isQuickActionsVisible, setIsQuickActionsVisible] = useState(false);
  const [isModelMenuVisible, setIsModelMenuVisible] = useState(false);
  const theme = useAppTheme();
  const { t } = useLanguageContext();
  const styles = React.useMemo(() => createChatHeaderStyles(theme), [theme]);

  const selectedModelInfo = useMemo(() => {
    const current = selectedModel ?? DEFAULT_MODEL;
    return getModelInfo(current);
  }, [selectedModel]);

  const selectedModelLabel = selectedModelInfo?.label ?? selectedModel ?? DEFAULT_MODEL;

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

  const toggleDrawer = () => {
    (navigation as any).toggleDrawer();
  };

  return (
    <View style={styles.header}>
      {/* Menu Button (Left) */}
      <Button
        variant="ghost"
        size="sm"
        leftIcon={<MaterialIcons name="menu" size={24} color={theme.colors.text.primary} />}
        onPress={toggleDrawer}
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
            const provider = selectedModelInfo?.provider;
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
                  <View key={model.value} style={styles.modelMenuItemContainer}>
                    <TouchableOpacity
                      style={[styles.modelMenuItem, isSelected && styles.selectedModelMenuItem]}
                      onPress={() => {
                        onModelChange?.(model.value);
                        setIsModelMenuVisible(false);
                      }}
                    >
                      <View style={styles.modelItemLeft}>
                        {/* Provider Logo */}
                        <View style={styles.providerLogo}>
                          {model.provider === 'openai' && <OpenAILogo size={16} />}
                          {model.provider === 'anthropic' && <AnthropicLogo size={16} />}
                        </View>
                        
                        {/* Model Name */}
                        <View style={styles.modelInfo}>
                          <Text style={[styles.modelMenuText, isSelected && styles.selectedModelMenuText]}>
                            {model.label}
                          </Text>
                          {model.description && (
                            <Text style={styles.modelDescription}>
                              {model.description}
                            </Text>
                          )}
                        </View>
                      </View>
                      
                      <View style={styles.modelItemRight}>
                        {/* Capability Icons */}
                        <ModelCapabilityIcons
                          capabilities={model.capabilities}
                          size={14}
                          containerStyle={styles.capabilityIcons}
                        />
                        
                        {/* Selection Check */}
                        {isSelected && (
                          <MaterialIcons 
                            name="check" 
                            size={20} 
                            color={theme.colors.status.info.primary} 
                            style={styles.checkIcon}
                          />
                        )}
                      </View>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

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
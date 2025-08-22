import type { DropdownItem } from '@/components/ui';
import { Button, Dropdown } from '@/components/ui';
import { Ionicons } from '@expo/vector-icons';
import { router, useNavigation } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';
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
        leftIcon={<Ionicons name="menu-outline" size={24} color={theme.colors.text.primary} />}
        onPress={toggleDrawer}
        containerStyle={styles.menuButton}
      />

      {/* Inline Model Selector (Center) */}
      {showModelSelection ? (
        <Dropdown
          items={AVAILABLE_MODELS.map(model => ({
            value: model.value,
            label: model.label,
            disabled: false,
          }))}
          value={selectedModel ?? DEFAULT_MODEL}
          onChange={(item: DropdownItem) => onModelChange?.(item.value as string)}
          renderTrigger={({ open, selected }) => {
            const selectedModelData = selected ? getModelInfo(selected.value as string) : selectedModelInfo;
            const provider = selectedModelData?.provider;
            
            return (
              <TouchableOpacity
                onPress={open}
                style={styles.modelSelector}
              >
                <View style={styles.providerLogo}>
                  {provider === 'anthropic' ? <AnthropicLogo size={16} /> : <OpenAILogo size={16} />}
                </View>
                <Text style={styles.modelSelectorText}>
                  {selected?.label ?? selectedModelLabel}
                </Text>
                <Ionicons name="chevron-down-outline" size={24} color={theme.colors.text.primary} />
              </TouchableOpacity>
            );
          }}
          renderCustomItem={({ item, isSelected }) => {
            const model = AVAILABLE_MODELS.find(m => m.value === item.value);
            
            if (!model) return null;
            
            return (
              <View style={styles.modelMenuItemContainer}>
                <View style={[styles.modelMenuItem, isSelected && styles.selectedModelMenuItem]}>
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
                      <Ionicons 
                        name="checkmark-outline" 
                        size={20} 
                        color={theme.colors.status.info.primary} 
                        style={styles.checkIcon}
                      />
                    )}
                  </View>
                </View>
              </View>
            );
          }}
          menuStyle={styles.modelMenuContainer}
          itemStyle={styles.modelMenuItem}
          selectedItemStyle={styles.selectedModelMenuItem}
          itemTextStyle={styles.modelMenuText}
          selectedItemTextStyle={styles.selectedModelMenuText}
          maxHeight={400}
          dropdownWidth={320}
        />
      ) : (
        <View style={styles.titleContainer} />
      )}
      
      {/* More Options Button (Right) */}
      <Button
        variant="ghost"
        size="sm"
        leftIcon={<Ionicons name="ellipsis-vertical-outline" size={24} color={theme.colors.text.primary} />}
        onPress={() => {
          console.log('🔍 [ChatHeader] More options button pressed');
          setIsQuickActionsVisible(!isQuickActionsVisible);
        }}
        containerStyle={styles.menuButton}
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
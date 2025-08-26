import { Ionicons } from '@expo/vector-icons';
import { router, useNavigation } from 'expo-router';
import React, { useMemo } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { AnthropicLogo, OpenAILogo } from '../../../../components';
import { useLanguageContext } from '../../../language';
import { useAppTheme } from '../../../theme/theme';
import { AVAILABLE_MODELS, DEFAULT_MODEL, getModelInfo } from '../../constants';
import { ModelCapabilityIcons } from '../ModelCapabilityIcons';
import type { DropdownItem } from '../ui';
import { Button, Dropdown } from '../ui';
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

  const theme = useAppTheme();
  const { t } = useLanguageContext();
  const styles = React.useMemo(() => createChatHeaderStyles(theme), [theme]);

  const selectedModelInfo = useMemo(() => {
    const current = selectedModel ?? DEFAULT_MODEL;
    return getModelInfo(current);
  }, [selectedModel]);

  const selectedModelLabel = selectedModelInfo?.label ?? selectedModel ?? DEFAULT_MODEL;

  const handleSettings = () => {
    onSettings();
  };

  const handleDesignShowcase = () => {
    router.push('/design-showcase');
  };

  const handleLogout = () => {
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
                      {model.provider === 'openai' && <OpenAILogo size={24} />}
                      {model.provider === 'anthropic' && <AnthropicLogo size={24} />}
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
          placement="bottom"
        />
      ) : (
        <View style={styles.titleContainer} />
      )}
      




      {/* Quick Actions Menu Dropdown */}
      <Dropdown
        items={[
          {
            value: 'settings',
            label: t('menu.settings'),
            disabled: false,
          },
          {
            value: 'design_showcase',
            label: t('menu.design_showcase'),
            disabled: false,
          },
          {
            value: 'logout',
            label: t('menu.logout'),
            disabled: false,
          },
        ]}
        onChange={(item: DropdownItem) => {
          switch (item.value) {
            case 'settings':
              handleSettings();
              break;
            case 'design_showcase':
              handleDesignShowcase();
              break;
            case 'logout':
              handleLogout();
              break;
          }
        }}
        renderTrigger={({ open }) => (
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<Ionicons name="ellipsis-vertical-outline" size={24} color={theme.colors.text.primary} />}
            onPress={() => {
              console.log('🔍 [ChatHeader] More options button pressed');
              open();
            }}
            containerStyle={styles.menuButton}
          />
        )}
        renderCustomItem={({ item, isSelected }) => {
          // Define icon and color for each menu item
          const getIconConfig = (value: string) => {
            switch (value) {
              case 'settings':
                return {
                  name: 'settings-outline' as const,
                  color: theme.colors.status.info.primary,
                };
              case 'design_showcase':
                return {
                  name: 'color-palette-outline' as const,
                  color: theme.colors.status.success.primary,
                };
              case 'logout':
                return {
                  name: 'log-out-outline' as const,
                  color: theme.colors.status.error.primary,
                };
              default:
                return {
                  name: 'ellipsis-horizontal-outline' as const,
                  color: theme.colors.text.secondary,
                };
            }
          };

          const iconConfig = getIconConfig(item.value as string);

          return (
            <View style={styles.quickActionsMenuItem}>
              <View style={styles.quickActionsItemLeft}>
                <Ionicons 
                  name={iconConfig.name} 
                  size={20} 
                  color={iconConfig.color}
                  style={styles.quickActionsIcon}
                />
                <Text style={styles.quickActionsMenuText}>
                  {item.label}
                </Text>
              </View>
            </View>
          );
        }}
        menuStyle={styles.quickActionsContainer}
        itemStyle={styles.quickActionsMenuItem}
        itemTextStyle={styles.quickActionsMenuText}
        maxHeight={200}
        dropdownWidth={180}
        placement="bottom"
      />
    </View>
  );
};

export default ChatHeader;
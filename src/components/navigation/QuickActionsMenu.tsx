import { useLanguageContext } from '@/features/language';
import { useAppTheme } from '@/features/theme/theme';
import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { OpenAILogo } from '../OpenAILogo';

// AI Models for selection
const AI_MODELS = [
  { label: 'GPT-4o', value: 'gpt-4o' },
  { label: 'GPT-4o Mini', value: 'gpt-4o-mini' },
  { label: 'GPT-4 Turbo', value: 'gpt-4-turbo' },
  { label: 'GPT-5', value: 'gpt-5' },
  { label: 'GPT-5 Mini', value: 'gpt-5-mini' },
  { label: 'GPT-5 Nano', value: 'gpt-5-nano' },
  { label: 'GPT-4', value: 'gpt-4' },
  { label: 'GPT-3.5 Turbo', value: 'gpt-3.5-turbo' },
  { label: 'Claude 3', value: 'claude-3' },
];
// Models not available in this project (UI-only guard)
const UNSUPPORTED_KEYS = ['claude', 'anthropic'];

interface QuickActionsMenuProps {
  isVisible: boolean;
  onClose: () => void;
  onLogout: () => void;
  onSettings: () => void;
  onDesignShowcase?: () => void;
  // Optional model selection props for chat rooms
  selectedModel?: string;
  onModelChange?: (model: string) => void;
  showModelSelection?: boolean;
}

export const QuickActionsMenu: React.FC<QuickActionsMenuProps> = ({ 
  isVisible, 
  onClose, 
  onLogout, 
  onSettings,
  onDesignShowcase,
  selectedModel,
  onModelChange,
  showModelSelection = false,
}) => {
  const [showModelMenu, setShowModelMenu] = useState(false);
  const theme = useAppTheme();
  const { t } = useLanguageContext();
  const styles = createStyles(theme);

  const handleModelSelect = (model: string) => {
    if (__DEV__) console.log('[QuickActionsMenu] select model', model);
    onModelChange?.(model);
    setShowModelMenu(false);
    onClose();
  };

  const handleBackToMainMenu = () => {
    setShowModelMenu(false);
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity style={styles.overlay} onPress={onClose} activeOpacity={1}>
        <View style={styles.menuContainer}>
          {!showModelMenu ? (
            // Main menu
            <>
              <TouchableOpacity 
                style={styles.menuItem}
                onPress={onSettings}
              >
                <Text style={styles.menuText}>{t('menu.settings')}</Text>
              </TouchableOpacity>
              
              {onDesignShowcase && (
                <TouchableOpacity 
                  style={styles.menuItem}
                  onPress={onDesignShowcase}
                >
                  <Text style={styles.menuText}>{t('menu.design_showcase')}</Text>
                </TouchableOpacity>
              )}
              
              {showModelSelection && (
                <TouchableOpacity 
                  style={styles.menuItem}
                  onPress={() => setShowModelMenu(true)}
                >
                  <Text style={styles.menuText}>{t('menu.ai_model')}</Text>
                  <MaterialIcons name="chevron-right" size={20} color={theme.colors.text.tertiary} />
                </TouchableOpacity>
              )}
              
              <TouchableOpacity 
                style={styles.menuItem}
                onPress={onLogout}
              >
                <Text style={styles.menuText}>{t('menu.logout')}</Text>
              </TouchableOpacity>
            </>
          ) : (
            // Model selection submenu
            <>
              <TouchableOpacity 
                style={styles.backMenuItem}
                onPress={handleBackToMainMenu}
              >
                <MaterialIcons name="arrow-back" size={20} color={theme.colors.text.tertiary} />
                <Text style={styles.backMenuText}> {t('menu.back')}</Text>
              </TouchableOpacity>
              {AI_MODELS.map((model) => {
                const isUnsupported = UNSUPPORTED_KEYS.some(k => model.value.toLowerCase().includes(k) || model.label.toLowerCase().includes(k));
                const disabled = isUnsupported;
                return (
                  <TouchableOpacity 
                    key={model.value}
                    style={[
                      styles.menuItem,
                      selectedModel === model.value && styles.selectedMenuItem,
                      disabled && styles.disabledMenuItem,
                    ]}
                    disabled={disabled}
                    onPress={() => !disabled && handleModelSelect(model.value)}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      {!isUnsupported && (
                        <OpenAILogo size={16} />
                      )}
                      <Text style={[
                        styles.menuText,
                        { marginLeft: isUnsupported ? 0 : 8 },
                        selectedModel === model.value && styles.selectedMenuText,
                        disabled && styles.disabledMenuText,
                      ]}>
                        {model.label}
                      </Text>
                    </View>
                    {disabled ? (
                      <MaterialIcons name="block" size={18} color={theme.colors.text.tertiary} />
                    ) : (
                      selectedModel === model.value && (
                        <MaterialIcons name="check" size={20} color={theme.colors.status.info.primary} />
                      )
                    )}
                  </TouchableOpacity>
                );
              })}
            </>
          )}
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  menuContainer: {
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
    marginTop: 120,
    marginRight: 16,
    minWidth: 180,
    ...theme.shadows.medium,
  },
  menuItem: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.sm,
    marginVertical: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedMenuItem: {
    backgroundColor: theme.colors.background.secondary,
  },
  disabledMenuItem: {
    opacity: 0.5,
  },
  backMenuItem: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.sm,
    marginVertical: 2,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuText: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.text.primary,
    fontWeight: theme.fontWeights.medium as '500',
    fontFamily: theme.fontFamily.primary,
  },
  selectedMenuText: {
    color: theme.colors.status.info.primary,
    fontWeight: theme.fontWeights.semibold as '600',
  },
  disabledMenuText: {
    color: theme.colors.text.tertiary,
  },
  backMenuText: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.text.tertiary,
    fontWeight: theme.fontWeights.medium as '500',
    fontFamily: theme.fontFamily.primary,
  },
  submenuIndicator: {
    fontSize: theme.fontSizes.lg,
    color: theme.colors.text.tertiary,
    fontWeight: theme.fontWeights.regular as '400',
  },
  checkmark: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.status.info.primary,
    fontWeight: theme.fontWeights.semibold as '600',
  },
}); 
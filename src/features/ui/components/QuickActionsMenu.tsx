import React, { useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAppTheme } from '../../../shared/hooks';

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

const AI_MODELS = [
  { label: 'GPT-3.5 Turbo', value: 'gpt-3.5-turbo' },
  { label: 'GPT-3.5 Turbo-16k', value: 'gpt-3.5-turbo-16k' },
  { label: 'GPT-4', value: 'gpt-4' },
  { label: 'GPT-4 Turbo', value: 'gpt-4-turbo' },
  { label: 'GPT-4o', value: 'gpt-4o' },
];

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
  const theme = useAppTheme();
  const styles = createStyles(theme);
  const [showModelSubmenu, setShowModelSubmenu] = useState(false);

  const handleModelSelect = (model: string) => {
    onModelChange?.(model);
    setShowModelSubmenu(false);
    onClose();
  };

  const handleBackToMainMenu = () => {
    setShowModelSubmenu(false);
  };

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.overlay} 
        activeOpacity={1} 
        onPress={onClose}
      >
        <View style={styles.menuContainer}>
          {!showModelSubmenu ? (
            // Main menu
            <>
              {showModelSelection && (
                <TouchableOpacity 
                  style={styles.menuItem}
                  onPress={() => setShowModelSubmenu(true)}
                >
                  <Text style={styles.menuText}>Model: {selectedModel || 'GPT-3.5 Turbo'}</Text>
                  <Text style={styles.submenuIndicator}>›</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => {
                  onSettings();
                  onClose();
                }}
              >
                <Text style={styles.menuText}>Settings</Text>
              </TouchableOpacity>
              {onDesignShowcase && (
                <TouchableOpacity 
                  style={styles.menuItem}
                  onPress={() => {
                    onDesignShowcase();
                    onClose();
                  }}
                >
                  <Text style={styles.menuText}>Design Showcase</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => {
                  onLogout();
                  onClose();
                }}
              >
                <Text style={styles.menuText}>Logout</Text>
              </TouchableOpacity>
            </>
          ) : (
            // Model selection submenu
            <>
              <TouchableOpacity 
                style={styles.backMenuItem}
                onPress={handleBackToMainMenu}
              >
                <Text style={styles.backMenuText}>‹ Back</Text>
              </TouchableOpacity>
              {AI_MODELS.map((model) => (
                <TouchableOpacity 
                  key={model.value}
                  style={[
                    styles.menuItem,
                    selectedModel === model.value && styles.selectedMenuItem
                  ]}
                  onPress={() => handleModelSelect(model.value)}
                >
                  <Text style={[
                    styles.menuText,
                    selectedModel === model.value && styles.selectedMenuText
                  ]}>
                    {model.label}
                  </Text>
                  {selectedModel === model.value && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
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
  backMenuItem: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.sm,
    marginVertical: 2,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
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
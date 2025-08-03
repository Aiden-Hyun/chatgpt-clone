import React, { useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  menuContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 8,
    marginTop: 120,
    marginRight: 16,
    minWidth: 180,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  menuItem: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginVertical: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedMenuItem: {
    backgroundColor: '#f0f0f0',
  },
  backMenuItem: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginVertical: 2,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  menuText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  selectedMenuText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  backMenuText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  submenuIndicator: {
    fontSize: 18,
    color: '#666',
    fontWeight: '400',
  },
  checkmark: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
}); 
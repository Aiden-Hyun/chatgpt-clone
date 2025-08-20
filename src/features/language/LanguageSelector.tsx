import { Button } from '@/components/ui/Button';
import { useToast } from '@/features/alert';
import { useAppTheme } from '@/features/theme/theme';
import React, { useState, useRef } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useLanguageContext } from './LanguageContext';

interface LanguageSelectorProps {
  style?: any;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ style }) => {
  const { currentLanguage, setLanguage, t } = useLanguageContext();
  const { showSuccess } = useToast();
  const theme = useAppTheme();
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ x: 0, y: 0 });
  const buttonRef = useRef<any>(null);

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'ko', name: '한국어' },
  ];

  const currentLanguageInfo = languages.find(lang => lang.code === currentLanguage) || languages[0];

  const handleLanguageChange = (newLanguage: string) => {
    console.log('🌍 Language button pressed:', newLanguage);
    console.log('🌍 Current language before:', currentLanguage);
    
    // Set the new language
    setLanguage(newLanguage);
    console.log('🌍 Language set to:', newLanguage);
    
    // Close dropdown
    setIsDropdownVisible(false);
    
    // Show toast in the new language
    const languageNames = {
      'en': 'English',
      'es': 'Español', 
      'ko': '한국어'
    };
    
    // Get the appropriate translation key based on the new language
    const translationKey = newLanguage === 'en' ? 'toast.language_changed' :
                          newLanguage === 'es' ? 'toast.language_changed_es' :
                          'toast.language_changed_ko';
    
    console.log('🌍 Translation key:', translationKey);
    
    // Replace the placeholder with the actual language name
    const message = t(translationKey).replace('{language}', languageNames[newLanguage as keyof typeof languageNames]);
    
    console.log('🌍 Toast message:', message);
    console.log('🌍 About to show toast...');
    
    // Show success toast
    showSuccess(message, 3000);
    
    console.log('🌍 Toast showSuccess called');
  };

  const handleButtonPress = () => {
    if (buttonRef.current) {
      buttonRef.current.measureInWindow((x: number, y: number, width: number, height: number) => {
        const screenHeight = Dimensions.get('window').height;
        const screenWidth = Dimensions.get('window').width;
        const dropdownHeight = Math.min(languages.length * 50 + 20, 300); // Cap at 300px
        const dropdownWidth = Math.min(200, screenWidth - 20); // Ensure it fits on screen
        
        // Calculate initial position - align with button
        let dropdownX = x;
        let dropdownY = y + height + 5; // Default: below button
        
        // Check if dropdown would go off the bottom of the screen
        if (dropdownY + dropdownHeight > screenHeight - 20) {
          // Position above the button instead
          dropdownY = Math.max(20, y - dropdownHeight - 5);
        }
        
        // Check if dropdown would go off the right side of the screen
        if (dropdownX + dropdownWidth > screenWidth - 10) {
          // Align to the right edge of the screen with some padding
          dropdownX = screenWidth - dropdownWidth - 10;
        }
        
        // Check if dropdown would go off the left side of the screen
        if (dropdownX < 10) {
          // Align to the left edge of the screen with some padding
          dropdownX = 10;
        }
        
        // Ensure dropdown is fully visible
        dropdownY = Math.max(20, Math.min(dropdownY, screenHeight - dropdownHeight - 20));
        
        setDropdownPosition({
          x: dropdownX,
          y: dropdownY
        });
        setIsDropdownVisible(true);
      });
    }
  };

  const styles = createLanguageSelectorStyles(theme);

  return (
    <View style={[styles.container, style]}>
      {/* Language Selector Button */}
      <TouchableOpacity
        ref={buttonRef}
        style={styles.selectorButton}
        onPress={handleButtonPress}
        activeOpacity={0.7}
      >
        <Text style={styles.selectorText}>
          {currentLanguageInfo.name}
        </Text>
        <MaterialIcons 
          name="keyboard-arrow-down" 
          size={20} 
          color={theme.colors.text.secondary} 
        />
      </TouchableOpacity>

      {/* Language Dropdown Modal */}
      <Modal
        visible={isDropdownVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsDropdownVisible(false)}
      >
        <TouchableOpacity 
          style={styles.dropdownOverlay} 
          onPress={() => setIsDropdownVisible(false)} 
          activeOpacity={1}
        >
          <View style={[
            styles.dropdownContainer,
            {
              position: 'absolute',
              left: dropdownPosition.x,
              top: dropdownPosition.y,
            }
          ]}>
            <ScrollView style={styles.languageListContainer}>
              {languages.map((lang) => {
                const isSelected = currentLanguage === lang.code;
                return (
                  <View key={lang.code} style={styles.languageMenuItemContainer}>
                    <TouchableOpacity
                      style={[styles.languageMenuItem, isSelected && styles.selectedLanguageMenuItem]}
                      onPress={() => handleLanguageChange(lang.code)}
                    >
                      <View style={styles.languageItemLeft}>
                        <Text style={[styles.languageMenuText, isSelected && styles.selectedLanguageMenuText]}>
                          {lang.name}
                        </Text>
                      </View>
                      
                      {isSelected && (
                        <View style={styles.languageItemRight}>
                          <MaterialIcons 
                            name="check" 
                            size={16} 
                            color={theme.colors.status.info.primary} 
                          />
                        </View>
                      )}
                    </TouchableOpacity>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const createLanguageSelectorStyles = (theme: any) => StyleSheet.create({
  container: {
    alignItems: 'flex-end',
  },
  selectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    minWidth: 100,
  },
  selectorText: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.text.primary,
    fontWeight: theme.fontWeights.medium,
    marginRight: theme.spacing.xs,
  },
  dropdownOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  dropdownContainer: {
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
    minWidth: 150,
    maxWidth: 250,
    ...theme.shadows.medium,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
  },
  languageListContainer: {
    maxHeight: 300,
  },
  languageMenuItemContainer: {
    marginBottom: 4,
  },
  languageMenuItem: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.sm,
    marginVertical: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedLanguageMenuItem: {
    backgroundColor: theme.colors.background.secondary,
  },
  languageItemLeft: {
    flex: 1,
  },
  languageMenuText: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.text.primary,
    fontWeight: theme.fontWeights.medium,
  },
  selectedLanguageMenuText: {
    color: theme.colors.status.info.primary,
    fontWeight: theme.fontWeights.semibold,
  },
  languageItemRight: {
    alignItems: 'center',
  },
}); 
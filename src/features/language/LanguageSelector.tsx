import type { DropdownItem } from '@/components/ui';
import { Dropdown } from '@/components/ui';
import { useToast } from '@/features/alert';
import { useAppTheme } from '@/features/theme/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useLanguageContext } from './LanguageContext';

interface LanguageSelectorProps {
  style?: any;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ style }) => {
  const { currentLanguage, setLanguage, t } = useLanguageContext();
  const { showSuccess } = useToast();
  const theme = useAppTheme();

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'ko', name: '한국어' },
  ];

  const currentLanguageInfo = languages.find(lang => lang.code === currentLanguage) || languages[0];

  const handleLanguageChange = (item: DropdownItem) => {
    const newLanguage = item.value as string;
    console.log('🌍 Language button pressed:', newLanguage);
    console.log('🌍 Current language before:', currentLanguage);
    
    // Set the new language
    setLanguage(newLanguage);
    console.log('🌍 Language set to:', newLanguage);
    
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

  const styles = createLanguageSelectorStyles(theme);

  return (
    <View style={[styles.container, style]}>
      <Dropdown
        items={languages.map(lang => ({
          value: lang.code,
          label: lang.name,
          disabled: false,
        }))}
        value={currentLanguage}
        onChange={handleLanguageChange}
        renderTrigger={({ open }) => (
          <TouchableOpacity
            style={styles.selectorButton}
            onPress={open}
            activeOpacity={0.7}
          >
            <Text style={styles.selectorText}>
              {currentLanguageInfo.name}
            </Text>
            <Ionicons 
              name="chevron-down-outline" 
              size={20} 
              color={theme.colors.text.secondary} 
            />
          </TouchableOpacity>
        )}
        renderCustomItem={({ item, isSelected }) => (
          <View style={styles.languageMenuItemContainer}>
            <View style={[styles.languageMenuItem, isSelected && styles.selectedLanguageMenuItem]}>
              <View style={styles.languageItemLeft}>
                <Text style={[styles.languageMenuText, isSelected && styles.selectedLanguageMenuText]}>
                  {item.label}
                </Text>
              </View>
              
              {isSelected && (
                <View style={styles.languageItemRight}>
                  <Ionicons 
                    name="checkmark-outline" 
                    size={16} 
                    color={theme.colors.status.info.primary} 
                  />
                </View>
              )}
            </View>
          </View>
        )}
        maxHeight={300}
        dropdownWidth={200}
        placement="auto"
      />
    </View>
  );
};

const createLanguageSelectorStyles = (theme: any) => ({
  container: {
    alignItems: 'flex-end',
  },
  selectorButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borders.radius.md,
    borderWidth: theme.borders.widths.thin,
    borderColor: theme.colors.border.light,
    minWidth: 100,
  },
  selectorText: {
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.text.primary,
    fontWeight: theme.typography.fontWeights.medium,
    marginRight: theme.spacing.xs,
  },
  languageMenuItemContainer: {
    marginBottom: 4,
  },
  languageMenuItem: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borders.radius.sm,
    marginVertical: 2,
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
  },
  selectedLanguageMenuItem: {
    backgroundColor: theme.colors.background.secondary,
  },
  languageItemLeft: {
    flex: 1,
  },
  languageMenuText: {
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.text.primary,
    fontWeight: theme.typography.fontWeights.medium,
  },
  selectedLanguageMenuText: {
    color: theme.colors.status.info.primary,
    fontWeight: theme.typography.fontWeights.semibold,
  },
  languageItemRight: {
    alignItems: 'center' as const,
  },
}); 
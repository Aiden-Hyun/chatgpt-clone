import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import { useToast } from '../alert/toast';
import type { DropdownItem } from '../components/ui';
import { Dropdown } from '../components/ui';
import { LanguageSelectorProps } from '../interfaces/language';
import { PresentationTheme } from '../interfaces/theme';
import { useBusinessContext } from '../shared/BusinessContextProvider';
import { useAppTheme } from '../theme/hooks/useTheme';
import { useLanguageContext } from './LanguageContext';

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ style }) => {
  const { currentLanguage, setLanguage, formatTranslation } = useLanguageContext();
  const { showSuccess } = useToast();
  const theme = useAppTheme();
  const { languageService } = useBusinessContext();
  
  const available: string[] = (languageService as any).getSupportedLanguages?.() ?? (languageService as any).getAvailableLanguages?.() ?? [];
  console.log('LanguageSelector available languages', available);
  const languages = available.map((code: string) => ({ code, name: code.toUpperCase() }));

  const currentLanguageInfo = languages.find((lang: { code: string; name: string }) => lang.code === currentLanguage) || languages[0];

  const handleLanguageChange = (item: DropdownItem) => {
    const newLanguage = item.value as string;
    setLanguage(newLanguage);

    const languageNames: Record<string, string> = {};
    languages.forEach((lang: { code: string; name: string }) => {
      languageNames[lang.code] = lang.name;
    });

    const translationKey = newLanguage === 'en' ? 'toast.language_changed' :
                          newLanguage === 'es' ? 'toast.language_changed_es' :
                          'toast.language_changed_ko';

    const message = formatTranslation(translationKey, { 
      language: languageNames[newLanguage] 
    });

    showSuccess(message, 3000);
  };

  const styles = createLanguageSelectorStyles(theme);

  return (
    <View style={[styles.container, style]}>
      <Dropdown
        items={languages.map((lang: { code: string; name: string }) => ({
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
              {currentLanguageInfo?.name || '—'}
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

const createLanguageSelectorStyles = (theme: PresentationTheme) => ({
  container: {
    alignItems: 'flex-end' as const,
  },
  selectorButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borders.radius.md,
    borderWidth: theme.borders.widths.thin,
    borderColor: theme.borders.colors.light,
    minWidth: 100,
  },
  selectorText: {
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.text.primary,
    fontWeight: theme.typography.fontWeights.medium as any,
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
    fontWeight: theme.typography.fontWeights.medium as any,
  },
  selectedLanguageMenuText: {
    color: theme.colors.status.info.primary,
    fontWeight: theme.typography.fontWeights.semibold as any,
  },
  languageItemRight: {
    alignItems: 'center' as const,
  },
});

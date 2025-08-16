import { Button } from '@/components/ui/Button';
import { useToast } from '@/features/alert';
import { useAppTheme } from '@/features/theme/theme';
import React from 'react';
import { StyleSheet, View } from 'react-native';
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

  const handleLanguageChange = (newLanguage: string) => {
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
      {languages.map((lang) => (
        <Button
          key={lang.code}
          label={lang.name}
          variant={currentLanguage === lang.code ? 'primary' : 'outline'}
          size="sm"
          onPress={() => handleLanguageChange(lang.code)}
          containerStyle={styles.languageButton}
        />
      ))}
    </View>
  );
};

const createLanguageSelectorStyles = (theme: any) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  languageButton: {
    minWidth: 80,
  },
}); 
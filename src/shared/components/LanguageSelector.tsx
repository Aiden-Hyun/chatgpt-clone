import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useLanguageContext } from '../context/LanguageContext';
import { useToast } from './alert/useToast';

interface LanguageSelectorProps {
  style?: any;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ style }) => {
  const { currentLanguage, setLanguage, t } = useLanguageContext();
  const { showSuccess } = useToast();

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
    
    // Replace the placeholder with the actual language name
    const message = t(translationKey).replace('{language}', languageNames[newLanguage as keyof typeof languageNames]);
    
    // Show success toast
    showSuccess(message, 3000);
  };

  return (
    <View style={[styles.container, style]}>
      {languages.map((lang) => (
        <TouchableOpacity
          key={lang.code}
          style={[
            styles.languageButton,
            currentLanguage === lang.code && styles.activeLanguageButton
          ]}
          onPress={() => handleLanguageChange(lang.code)}
        >
          <Text style={[
            styles.languageText,
            currentLanguage === lang.code && styles.activeLanguageText
          ]}>
            {lang.name}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    gap: 10,
  },
  languageButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f5f5f5',
  },
  activeLanguageButton: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  languageText: {
    fontSize: 12,
    color: '#666',
  },
  activeLanguageText: {
    color: '#fff',
  },
}); 
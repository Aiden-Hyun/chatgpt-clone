import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useLanguageContext } from '../context/LanguageContext';

interface LanguageSelectorProps {
  style?: any;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ style }) => {
  const { currentLanguage, setLanguage } = useLanguageContext();

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
  ];

  return (
    <View style={[styles.container, style]}>
      {languages.map((lang) => (
        <TouchableOpacity
          key={lang.code}
          style={[
            styles.languageButton,
            currentLanguage === lang.code && styles.activeLanguageButton
          ]}
          onPress={() => {
            console.log('🌍 Language button pressed:', lang.code);
            console.log('🌍 Current language before:', currentLanguage);
            setLanguage(lang.code);
            console.log('🌍 Language set to:', lang.code);
          }}
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
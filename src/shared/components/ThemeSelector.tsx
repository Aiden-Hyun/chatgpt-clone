import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { ThemedText } from './ThemedText';
import { useThemeContext } from '../context/ThemeContext';
import { useAppTheme } from '../hooks/useAppTheme';

interface ThemeSelectorProps {
  style?: any;
}

export function ThemeSelector({ style }: ThemeSelectorProps) {
  const { themeMode, setThemeMode } = useThemeContext();
  const theme = useAppTheme();

  const themes = [
    { value: 'light' as const, label: 'Light' },
    { value: 'dark' as const, label: 'Dark' },
    { value: 'system' as const, label: 'System' },
  ];

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setThemeMode(newTheme);
  };

  return (
    <View style={[styles.container, style]}>
      {themes.map((themeOption) => (
        <TouchableOpacity
          key={themeOption.value}
          style={[
            styles.themeButton,
            themeMode === themeOption.value && styles.selectedThemeButton,
          ]}
          onPress={() => handleThemeChange(themeOption.value)}
          activeOpacity={0.7}
        >
          <ThemedText
            style={[
              styles.themeButtonText,
              themeMode === themeOption.value && styles.selectedThemeButtonText,
            ]}
          >
            {themeOption.label}
          </ThemedText>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = {
  container: {
    flexDirection: 'row' as const,
    gap: 8,
  },
  themeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#CBD5E0',
    backgroundColor: 'transparent',
  },
  selectedThemeButton: {
    backgroundColor: '#2D3748',
    borderColor: '#2D3748',
  },
  themeButtonText: {
    fontSize: 14,
    color: '#4A5568',
  },
  selectedThemeButtonText: {
    color: '#FFFFFF',
    fontWeight: '600' as const,
  },
}; 
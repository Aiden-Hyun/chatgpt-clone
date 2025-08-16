import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Text } from '../../components/ui/Text';
import { useThemeContext } from './context/ThemeContext';
import { useAppTheme } from './theme';

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
            {
              borderColor: theme.colors.border.medium,
              backgroundColor: theme.colors.background.primary,
            },
            themeMode === themeOption.value && {
              backgroundColor: theme.colors.primary,
              borderColor: theme.colors.primary,
            },
          ]}
          onPress={() => handleThemeChange(themeOption.value)}
          activeOpacity={0.7}
        >
          <Text
            variant="body"
            style={[
              styles.themeButtonText,
              {
                color: theme.colors.text.secondary,
              },
              themeMode === themeOption.value && {
                color: theme.colors.text.inverted,
                fontWeight: theme.fontWeights.semibold as '600',
              },
            ]}
          >
            {themeOption.label}
          </Text>
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
  },
  themeButtonText: {
    fontSize: 14,
  },
}; 
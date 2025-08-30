import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Switch, View } from 'react-native';

import { useToast } from '../../../alert/toast/ToastContext';
import { Card, ListItem, Text } from '../../../components/ui';
import { LanguageSelector, useLanguageContext } from '../../../language';
import { useThemeMode, useThemeStyle } from '../../../theme/hooks';
import { useAppTheme } from '../../../theme/hooks/useTheme';
import { createSettingsStyles } from '../settings.styles';

interface PreferencesSectionProps {
  onNavigateToThemes: () => void;
}

export const PreferencesSection: React.FC<PreferencesSectionProps> = ({ 
  onNavigateToThemes 
}) => {
  const { t } = useLanguageContext();
  const theme = useAppTheme();
  const { themeMode } = useThemeMode();
  const { themeStyle } = useThemeStyle();
  const { showSuccess } = useToast();
  const styles = createSettingsStyles(theme);

  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);

  const getThemeDisplayText = () => {
    let styleText: string;
    switch (themeStyle) {
      case 'default':
        styleText = 'Default';
        break;
      case 'glassmorphism':
        styleText = 'Glassmorphism';
        break;
      case 'claymorphism':
        styleText = 'Claymorphism';
        break;
      case 'gradient-neumorphism':
        styleText = 'Gradient Neumorphism';
        break;
      default:
        styleText = 'Default';
        break;
    }
    
    const modeText = themeMode === 'system' ? 'System' : 
                    themeMode === 'light' ? 'Light' : 'Dark';
    return `${styleText} • ${modeText}`;
  };

  return (
    <View style={styles.section}>
      <Text variant="h3" weight="semibold" style={styles.sectionTitle}>{t('settings.preferences')}</Text>
      <Card variant="default" padding="md" containerStyle={styles.card}>
        <ListItem
          variant="settings"
          title={t('settings.language')}
          leftElement={<Ionicons name="language-outline" size={24} color={theme.colors.status.info.primary} />}
          rightElement={<LanguageSelector style={styles.languageSelector} />}
        />
        
        <ListItem
          variant="settings"
          title={t('settings.theme')}
          subtitle={getThemeDisplayText()}
          leftElement={<Ionicons name="color-palette-outline" size={24} color={theme.colors.status.success.primary} />}
          rightElement={<Ionicons name="chevron-forward-outline" size={20} color={theme.colors.text.tertiary} />}
          onPress={onNavigateToThemes}
        />
        
        {/* Test Toast Button */}
        <ListItem
          variant="settings"
          title="Test Toast"
          subtitle="Tap to test"
          leftElement={<Ionicons name="notifications-outline" size={24} color={theme.colors.status.warning.primary} />}
          onPress={() => {
            showSuccess('Test toast message!', 5000);
          }}
        />
        
        <ListItem
          variant="settings"
          title={t('settings.notifications')}
          leftElement={<Ionicons name="notifications-circle-outline" size={24} color={theme.colors.status.info.primary} />}
          rightElement={
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: theme.borders.colors.light, true: theme.colors.primary }}
              thumbColor={notificationsEnabled ? theme.colors.button.text : theme.colors.text.secondary}
            />
          }
        />
      </Card>
    </View>
  );
};
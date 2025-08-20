import { Card, ListItem, Text } from '@/components/ui';
import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Switch, View } from 'react-native';
import { useToast } from '../../../src/features/alert';
import { LanguageSelector, useLanguageContext } from '../../../src/features/language';
import { useThemeMode, useThemeStyle } from '../../../src/features/theme';
import { useAppTheme } from '../../../src/features/theme/theme';
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
    const styleText = themeStyle === 'default' ? 'Default' : 
                     themeStyle === 'glassmorphism' ? 'Glassmorphism' : 'Claymorphism';
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
          rightElement={<LanguageSelector style={styles.languageSelector} />}
        />
        
        <ListItem
          variant="settings"
          title={t('settings.theme')}
          subtitle={getThemeDisplayText()}
          rightElement={<MaterialIcons name="chevron-right" size={20} color={theme.colors.text.tertiary} />}
          onPress={onNavigateToThemes}
        />
        
        {/* Test Toast Button */}
        <ListItem
          variant="settings"
          title="Test Toast"
          subtitle="Tap to test"
          onPress={() => {
            showSuccess('Test toast message!', 5000);
          }}
        />
        
        <ListItem
          variant="settings"
          title={t('settings.notifications')}
          rightElement={
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: theme.colors.border.light, true: theme.colors.primary }}
              thumbColor={notificationsEnabled ? theme.colors.button.text : theme.colors.text.secondary}
            />
          }
        />
      </Card>
    </View>
  );
};

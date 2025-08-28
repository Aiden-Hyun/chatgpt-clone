import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { View } from 'react-native';
import { Card, ListItem, Text } from '../../../components/ui';
import { useLanguageContext } from '../../../language/LanguageContext';
import { useAppTheme } from '../../../theme/hooks/useTheme';
import { createSettingsStyles } from '../settings.styles';

export const AboutSection: React.FC = () => {
  const { t } = useLanguageContext();
  const theme = useAppTheme();
  const styles = createSettingsStyles(theme);

  const handleTermsOfService = () => {
    // TODO: Implement terms of service navigation
    console.log('Terms of service functionality not implemented yet');
  };

  const handleSupport = () => {
    // TODO: Implement support navigation
    console.log('Support functionality not implemented yet');
  };

  return (
    <View style={styles.section}>
      <Text variant="h3" weight="semibold" style={styles.sectionTitle}>{t('settings.about')}</Text>
      <Card variant="default" padding="md" containerStyle={styles.card}>
        <ListItem
          variant="settings"
          title={t('settings.version')}
          subtitle="1.0.0"
          leftElement={<Ionicons name="information-circle-outline" size={24} color={theme.colors.status.info.primary} />}
        />
        <ListItem
          variant="settings"
          title={t('settings.terms_of_service')}
          leftElement={<Ionicons name="document-text-outline" size={24} color={theme.colors.status.warning.primary} />}
          rightElement={<Ionicons name="chevron-forward-outline" size={20} color={theme.colors.text.tertiary} />}
          onPress={handleTermsOfService}
        />
        <ListItem
          variant="settings"
          title={t('settings.support')}
          leftElement={<Ionicons name="help-circle-outline" size={24} color={theme.colors.status.success.primary} />}
          rightElement={<Ionicons name="chevron-forward-outline" size={20} color={theme.colors.text.tertiary} />}
          onPress={handleSupport}
        />
      </Card>
    </View>
  );
};
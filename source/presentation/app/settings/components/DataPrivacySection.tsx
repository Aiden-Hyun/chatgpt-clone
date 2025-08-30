import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { View } from 'react-native';

import { Card, ListItem, Text } from '../../../components/ui';
import { useLanguageContext } from '../../../language/LanguageContext';
import { useAppTheme } from '../../../theme/hooks/useTheme';
import { createSettingsStyles } from '../settings.styles';

export const DataPrivacySection: React.FC = () => {
  const { t } = useLanguageContext();
  const theme = useAppTheme();
  const styles = createSettingsStyles(theme);

  const handleExportData = () => {
    // TODO: Implement data export functionality
    console.log('Export data functionality not implemented yet');
  };

  const handleClearConversations = () => {
    // TODO: Implement clear conversations functionality
    console.log('Clear conversations functionality not implemented yet');
  };

  const handlePrivacyPolicy = () => {
    // TODO: Implement privacy policy navigation
    console.log('Privacy policy functionality not implemented yet');
  };

  return (
    <View style={styles.section}>
      <Text variant="h3" weight="semibold" style={styles.sectionTitle}>{t('settings.data_privacy')}</Text>
      <Card variant="default" padding="md" containerStyle={styles.card}>
        <ListItem
          variant="settings"
          title={t('settings.export_data')}
          leftElement={<Ionicons name="cloud-download-outline" size={24} color={theme.colors.status.success.primary} />}
          rightElement={<Ionicons name="chevron-forward-outline" size={20} color={theme.colors.text.tertiary} />}
          onPress={handleExportData}
        />
        <ListItem
          variant="settings"
          title={t('settings.clear_conversations')}
          leftElement={<Ionicons name="trash-outline" size={24} color={theme.colors.status.error.primary} />}
          rightElement={<Ionicons name="chevron-forward-outline" size={20} color={theme.colors.text.tertiary} />}
          onPress={handleClearConversations}
        />
        <ListItem
          variant="settings"
          title={t('settings.privacy_policy')}
          leftElement={<Ionicons name="shield-checkmark-outline" size={24} color={theme.colors.status.info.primary} />}
          rightElement={<Ionicons name="chevron-forward-outline" size={20} color={theme.colors.text.tertiary} />}
          onPress={handlePrivacyPolicy}
        />
      </Card>
    </View>
  );
};
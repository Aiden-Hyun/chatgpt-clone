import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { View } from 'react-native';

import { Button, Text } from '../../../../components/ui';
import { SettingsHeaderProps } from '../../../../interfaces/app';
import { useAppTheme } from '../../../../theme/hooks/useTheme';
import { createSettingsStyles } from '../settings.styles';

export const SettingsHeader: React.FC<SettingsHeaderProps> = ({ onBack, title }) => {
  const theme = useAppTheme();
  const styles = createSettingsStyles(theme);

  return (
    <View style={styles.header}>
      <Button 
        variant="ghost"
        onPress={onBack}
        containerStyle={styles.backButton}
        leftIcon={<Ionicons name="arrow-back-outline" size={24} color={theme.colors.text.primary} />}
      />
      <Text variant="h2" weight="semibold" style={styles.headerTitle}>{title}</Text>
      <View style={styles.headerSpacer} />
    </View>
  );
};
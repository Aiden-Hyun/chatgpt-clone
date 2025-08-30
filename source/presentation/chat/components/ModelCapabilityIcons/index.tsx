import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';

import { ModelCapabilities } from '../../../interfaces/chat';
import { useAppTheme } from '../../../theme/theme';

interface ModelCapabilityIconsProps {
  capabilities: ModelCapabilities;
  size?: number;
  showLabels?: boolean;
  containerStyle?: Record<string, unknown>;
}

/**
 * ModelCapabilityIcons
 * Renders icons representing the capabilities of an AI model
 */
export const ModelCapabilityIcons: React.FC<ModelCapabilityIconsProps> = ({
  capabilities,
  size = 16,
  showLabels = false,
  containerStyle,
}) => {
  const theme = useAppTheme();
  
  const capabilityConfig = [
    {
      key: 'chat' as keyof ModelCapabilities,
      icon: 'chatbubbles',
      label: 'Chat',
      color: theme.colors.primary,
    },
    {
      key: 'image' as keyof ModelCapabilities,
      icon: 'images',
      label: 'Image',
      color: theme.colors.status.success.primary,
    },
    {
      key: 'search' as keyof ModelCapabilities,
      icon: 'search',
      label: 'Search',
      color: theme.colors.status.info.primary,
    },
    {
      key: 'vision' as keyof ModelCapabilities,
      icon: 'eye',
      label: 'Vision',
      color: theme.colors.status.warning.primary,
    },
    {
      key: 'code' as keyof ModelCapabilities,
      icon: 'code-slash',
      label: 'Code',
      color: theme.colors.secondary,
    },
    {
      key: 'analysis' as keyof ModelCapabilities,
      icon: 'bar-chart',
      label: 'Analysis',
      color: theme.colors.status.error.primary,
    },
  ];

  const activeCapabilities = capabilityConfig.filter(config => capabilities[config.key]);

  if (activeCapabilities.length === 0) {
    return null;
  }

  return (
    <View style={[{ flexDirection: 'row', alignItems: 'center', gap: 4 }, containerStyle]}>
      {activeCapabilities.map((capability) => (
        <View key={capability.key} style={{ alignItems: 'center' }}>
          <Ionicons
            name={`${capability.icon}-outline` as keyof typeof Ionicons.glyphMap}
            size={size}
            color={capability.color}
          />
          {showLabels && (
            <Text style={{ 
              fontSize: 10, 
              color: theme.colors.text.secondary,
              marginTop: 2 
            }}>
              {capability.label}
            </Text>
          )}
        </View>
      ))}
    </View>
  );
};

export default ModelCapabilityIcons;

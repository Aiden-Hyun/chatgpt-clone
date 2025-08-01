import React from 'react';
import { SafeAreaView, Text, View } from 'react-native';
import { useAppTheme } from '../../../src/shared/hooks';

export default function ExploreScreen() {
  const theme = useAppTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background.primary }}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ 
          fontSize: theme.fontSizes.xl, 
          color: theme.colors.text.primary,
          textAlign: 'center'
        }}>
          Explore Screen
        </Text>
        <Text style={{ 
          fontSize: theme.fontSizes.md, 
          color: theme.colors.text.secondary,
          textAlign: 'center',
          marginTop: theme.spacing.md
        }}>
          Coming soon...
        </Text>
      </View>
    </SafeAreaView>
  );
} 
import React from 'react';
import { SafeAreaView } from 'react-native';
import SemanticColorTest from '../src/features/ui';

export default function TestColorsScreen() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <SemanticColorTest />
    </SafeAreaView>
  );
} 
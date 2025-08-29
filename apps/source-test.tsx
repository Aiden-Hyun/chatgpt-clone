// Test page for the new /source implementation
import { useAuth } from '@/features/auth';
import { router } from 'expo-router';
import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Import your new source implementation
import { BridgeAuthProvider } from '../source/presentation/auth/context/BridgeAuthContext';
import { TestChatInterface } from '../source/presentation/chat/components/TestChatInterface';
import { BusinessContextProvider } from '../source/presentation/shared/BusinessContextProvider';

export default function SourceTestScreen() {
  const { session, isLoading } = useAuth();
  
  // For testing, you can hardcode a user ID and room ID
  // In real usage, these would come from auth and navigation
  const testUserId = session?.user?.id || 'test-user-123';
  const testRoomId = 'test-room-456';

  const handleBack = () => {
    router.back();
  };

  const showTestInstructions = () => {
    Alert.alert(
      "🧪 Test Instructions",
      "1. Long-press any USER message → Edit\n" +
      "2. Long-press any USER message → Resend\n" +
      "3. Long-press any ASSISTANT message → Regenerate\n" +
      "4. Look for 'Edited' and 'Superseded' badges\n" +
      "5. Check pending spinners during operations",
      [{ text: "Got it!" }]
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <BusinessContextProvider>
        <BridgeAuthProvider existingSession={session} existingIsLoading={isLoading}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <Text style={styles.title}>🧪 Testing New /source Implementation</Text>
              <Text style={styles.subtitle}>Edit/Resend/Regenerate Features</Text>
            </View>
            <TouchableOpacity style={styles.helpButton} onPress={showTestInstructions}>
              <Text style={styles.helpButtonText}>?</Text>
            </TouchableOpacity>
          </View>
          
          <TestChatInterface 
            userId={testUserId}
          />
        </BridgeAuthProvider>
      </BusinessContextProvider>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#007AFF',
  },
  backButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  helpButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  helpButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  subtitle: {
    fontSize: 14,
    color: 'white',
    opacity: 0.8,
  },
});

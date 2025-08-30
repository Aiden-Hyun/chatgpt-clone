import React from 'react';
import { Alert, Button, StyleSheet, View } from 'react-native';

import { useSignOutButton } from '../hooks/useSignOutButton';

export function SignOutButton() {
  const { signOut, isLoading } = useSignOutButton();

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await signOut();
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Button 
        onPress={handleSignOut} 
        disabled={isLoading}
        title={isLoading ? "Signing Out..." : "Sign Out"} 
        color="#ff4444"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
});

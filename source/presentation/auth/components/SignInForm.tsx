import React from 'react';
import { Button, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSignInForm } from '../hooks/useSignInForm';

export function SignInForm() {
  const { 
    email, 
    password, 
    isLoading, 
    error, 
    handleEmailChange, 
    handlePasswordChange, 
    handleSubmit 
  } = useSignInForm();

  return (
    <View style={styles.container}>
      <TextInput 
        style={styles.input}
        value={email} 
        onChangeText={handleEmailChange} 
        placeholder="Email" 
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />
      <TextInput 
        style={styles.input}
        value={password} 
        onChangeText={handlePasswordChange} 
        placeholder="Password" 
        secureTextEntry 
        autoCapitalize="none"
        autoCorrect={false}
      />
      <Button 
        onPress={handleSubmit} 
        disabled={isLoading}
        title={isLoading ? "Signing In..." : "Sign In"} 
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    fontSize: 14,
    textAlign: 'center',
  },
});

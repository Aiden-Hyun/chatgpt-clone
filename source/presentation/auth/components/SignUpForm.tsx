import React from 'react';
import { Button, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSignUpForm } from '../hooks/useSignUpForm';

export function SignUpForm() {
  const { 
    email, 
    password, 
    confirmPassword,
    displayName,
    isLoading, 
    error, 
    handleEmailChange, 
    handlePasswordChange,
    handleConfirmPasswordChange,
    handleDisplayNameChange,
    handleSubmit 
  } = useSignUpForm();

  return (
    <View style={styles.container}>
      <TextInput 
        style={styles.input}
        value={displayName} 
        onChangeText={handleDisplayNameChange} 
        placeholder="Display Name" 
        autoCapitalize="words"
        autoCorrect={false}
      />
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
      <TextInput 
        style={styles.input}
        value={confirmPassword} 
        onChangeText={handleConfirmPasswordChange} 
        placeholder="Confirm Password" 
        secureTextEntry 
        autoCapitalize="none"
        autoCorrect={false}
      />
      <Button 
        onPress={handleSubmit} 
        disabled={isLoading}
        title={isLoading ? "Creating Account..." : "Sign Up"} 
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

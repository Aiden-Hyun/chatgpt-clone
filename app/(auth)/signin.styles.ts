import { StyleSheet } from 'react-native';

export const createSigninStyles = () => {
  return StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
    },
    title: {
      marginBottom: 20,
      fontFamily: 'System',
      fontWeight: '600',
    },
    button: {
      width: '100%',
      height: 50,
      backgroundColor: '#000000',
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 12,
    },
    buttonDisabled: {
      opacity: 0.6,
    },
    buttonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
    linkButton: {
      marginTop: 16,
    },
    linkText: {
      fontSize: 14,
      textDecorationLine: 'underline',
    },
  });
}; 
import { StyleSheet } from 'react-native';

// Note: This file now exports a function that returns styles based on the current theme
// Components should use this function instead of importing styles directly

export const createLoginStyles = () => {
  return StyleSheet.create({
    center: { 
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
    divider: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 16,
      width: '100%',
    },
    dividerText: {
      fontSize: 14,
      marginHorizontal: 12,
    },
  });
};

// Legacy export for backward compatibility (deprecated)
// Components should use createLoginStyles() instead
export const styles = StyleSheet.create({
  center: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 32,
    backgroundColor: '#FFFFFF'
  },
  title: { 
    fontSize: 24, 
    marginBottom: 20,
    fontWeight: '600',
    color: '#000000'
  },
});

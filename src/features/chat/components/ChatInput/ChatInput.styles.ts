import { Platform, StyleSheet } from 'react-native';
import { AppTheme } from '../../../theme/theme.types';

/**
 * ChatInput Styles - iOS Messages Style
 * Features:
 * - Sleek bubble-shaped input with subtle shadows
 * - Perfectly circular send button with MaterialIcons
 * - Clean iOS-like design with no focus borders
 * - Smooth state transitions
 */
export const createChatInputStyles = (theme: AppTheme) => {
  
  const styles = StyleSheet.create({
    // Main container
    container: {
      backgroundColor: theme.colors.background.primary,
      borderTopWidth: 0.5,
      borderTopColor: theme.colors.border.light,
      paddingTop: theme.spacing.md,
      paddingBottom: Platform.OS === 'ios' ? theme.spacing.lg + 10 : theme.spacing.lg,
    },

    // Input row containing bubble and send button
    inputRow: {
      flexDirection: 'row',
      alignItems: 'flex-end', // Align to bottom for proper bubble alignment
      paddingHorizontal: theme.spacing.lg,
      gap: theme.spacing.sm,
    },

    // Bubble-shaped input container - iOS Messages style (no focus changes)
    inputBubble: {
      flex: 1,
      backgroundColor: theme.colors.background.secondary,
      borderRadius: 20, // iOS Messages uses 20px border radius
      minHeight: 36, // iOS Messages height
      maxHeight: 120,
      shadowColor: theme.colors.text.primary,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },

    // Input container styling
    inputContainer: {
      flex: 1,
      backgroundColor: 'transparent',
      borderWidth: 0,
      margin: 0,
      padding: 0,
    },

    // Input text styling - iOS Messages style
    input: {
      textAlignVertical: 'top',
      paddingVertical: 8, // iOS Messages padding
      paddingHorizontal: 12, // iOS Messages padding
      fontSize: 17, // iOS Messages font size
      lineHeight: 22, // iOS Messages line height
      color: theme.colors.text.primary,
      fontFamily: theme.fontFamily.primary,
      // Web-specific: Remove focus outline using proper React Native properties
      ...(Platform.OS === 'web' && {
        outlineWidth: 0,
        outlineColor: 'transparent',
        borderWidth: 0,
        boxShadow: 'none',
      }),
    },

    // Search button container
    searchButtonContainer: {
      justifyContent: 'flex-end',
      alignItems: 'center',
      marginBottom: 2, // Slight adjustment for visual alignment
    },

    // Search button styling - Similar to send button
    searchButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      padding: 0,
      backgroundColor: theme.colors.background.secondary,
      borderWidth: 0,
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'visible',
      shadowColor: theme.colors.text.primary,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 1,
      elevation: 1,
      // Web-specific: Remove focus outline
      ...(Platform.OS === 'web' && {
        outlineWidth: 0,
        outlineColor: 'transparent',
        borderWidth: 0,
        boxShadow: 'none',
      }),
    },

    // Active search button (when search mode is enabled)
    searchButtonActive: {
      backgroundColor: theme.colors.primary,
      shadowOpacity: 0.2,
      shadowRadius: 2,
      elevation: 2,
    },

    // Send button container
    sendButtonContainer: {
      justifyContent: 'flex-end',
      alignItems: 'center',
      marginBottom: 2, // Slight adjustment for visual alignment
    },

    // Send button styling - Perfect circle
    sendButton: {
      width: 36, // Slightly larger for better visibility
      height: 36, // Perfect square for circle
      borderRadius: 18, // Exactly half of width/height for perfect circle
      padding: 0,
      backgroundColor: theme.colors.background.secondary, // Use theme background
      borderWidth: 0,
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'visible', // Ensure icons aren't clipped
      shadowColor: theme.colors.text.primary,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 1,
      elevation: 1,
      // Web-specific: Remove focus outline using proper React Native properties
      ...(Platform.OS === 'web' && {
        outlineWidth: 0,
        outlineColor: 'transparent',
        borderWidth: 0,
        boxShadow: 'none',
      }),
    },

    // Active send button (when text is present) - iOS blue
    sendButtonActive: {
      backgroundColor: theme.colors.primary, // Use theme primary color
      shadowOpacity: 0.2,
      shadowRadius: 2,
      elevation: 2,
    },

    // Sending state
    sendButtonSending: {
      backgroundColor: theme.colors.primary, // Use theme error color
      shadowOpacity: 0.2,
      shadowRadius: 2,
      elevation: 2,
    },

    // Typing indicator
    typingIndicator: {
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.sm,
    },

    // Typing text
    typingText: {
      fontSize: 13, // iOS Messages secondary text size
      color: theme.colors.text.secondary,
      fontStyle: 'italic',
    },
  });

  return {
    styles,
  };
}; 
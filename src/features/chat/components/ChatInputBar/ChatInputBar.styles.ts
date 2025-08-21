import { StyleSheet } from 'react-native';
import { AppTheme } from '../../../theme/theme.types';

/**
 * ChatInput Styles - Native TextInput Style
 * Features:
 * - Sleek bubble-shaped input with subtle shadows
 * - Perfectly circular send button with MaterialIcons
 * - Clean design with no focus borders
 * - Smooth state transitions
 * - Native TextInput styling for proper iOS behavior
 * - Consistent appearance across iOS, Android, and Web
 */
export const createChatInputStyles = (theme: AppTheme) => {
  
  const styles = StyleSheet.create({
    // Main container - Consistent padding across platforms
    container: {
      height: 100,
      backgroundColor: theme.colors.background.primary,
      borderTopWidth: 0.5,
      borderTopColor: theme.colors.border.light,
      paddingTop: theme.spacing.md,
      paddingBottom: theme.spacing.lg, // Consistent padding for all platforms
    },

    // Input row containing bubble and send button
    inputRow: {
      flexDirection: 'row',
      alignItems: 'flex-end', // Align to bottom for proper bubble alignment
      paddingHorizontal: theme.spacing.lg,
      gap: theme.spacing.sm,
    },

    // Bubble-shaped input container - Native TextInput container
    inputBubble: {
      flex: 1,
      backgroundColor: theme.colors.background.secondary,
      borderRadius: 20, // iOS Messages uses 20px border radius
      //minHeight: 36, // Minimum height for empty state
      //maxHeight: 120, // Maximum height before scrolling
      shadowColor: theme.colors.text.primary,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
      // Remove any height constraints - let TextInput grow naturally
    },

    // Native TextInput styling - iOS Messages style
    input: {
      flex: 1,
      textAlignVertical: 'top',
      paddingVertical: 8, // iOS Messages padding
      paddingHorizontal: 12, // iOS Messages padding
      fontSize: 17, // iOS Messages font size
      lineHeight: 22, // iOS Messages line height
      color: theme.colors.text.primary,
      fontFamily: theme.fontFamily.primary,
      backgroundColor: 'transparent', // Transparent background
      borderWidth: 0, // No border
      borderRadius: 0, // No border radius
      // Web-specific: Remove focus outline
      outlineWidth: 0,
      outlineColor: 'transparent',
      boxShadow: 'none',
    },

    // Send button container
    sendButtonContainer: {
      justifyContent: 'flex-end',
      alignItems: 'center',
      marginBottom: 2, // Slight adjustment for visual alignment
    },

    // Send button styling - Perfect circle (consistent across platforms)
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
      // Web-style focus outline removal for all platforms
      outlineWidth: 0,
      outlineColor: 'transparent',
      boxShadow: 'none',
    },

    // Active send button (when text is present) - Web-like blue
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

    // Search button container
    searchButtonContainer: {
      justifyContent: 'flex-end',
      alignItems: 'center',
      marginBottom: 2, // Slight adjustment for visual alignment
    },

    // Search button styling - Perfect circle (consistent across platforms)
    searchButton: {
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
      // Web-style focus outline removal for all platforms
      outlineWidth: 0,
      outlineColor: 'transparent',
      boxShadow: 'none',
    },

    // Search button active state - Vibrant Blue
    searchButtonActive: {
      backgroundColor: theme.colors.status.info.secondary,
      shadowColor: theme.colors.status.info.primary,
      shadowOpacity: 0.5,
      shadowRadius: 6,
      elevation: 6,
    },
  });

  return {
    styles,
  };
};


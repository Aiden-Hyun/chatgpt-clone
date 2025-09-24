import { StyleSheet } from 'react-native';

import { PresentationTheme } from '../../../interfaces/theme';

/**
 * ChatInput Styles - Native TextInput Style with Neumorphic Effects
 * Features:
 * - Neumorphic bubble-shaped input with proper shadows
 * - Neumorphic circular send button with depth
 * - Clean design with no focus borders
 * - Smooth state transitions
 * - Native TextInput styling for proper iOS behavior
 * - Consistent appearance across iOS, Android, and Web
 */
export const createChatInputStyles = (theme: PresentationTheme) => {
  
  const styles = StyleSheet.create({
    // Main container - Consistent padding across platforms
    container: {
      height: theme.layout.dimensions.chat.sendButtonSize * 3, // Use theme-based height
      backgroundColor: theme.colors.background.primary,
      borderTopWidth: theme.borders.widths.thin / 2, // Use theme border width
      borderTopColor: theme.borders.colors.light,
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

    // Bubble-shaped input container - Native TextInput container with neumorphic effect
    inputBubble: {
      flex: 1,
      backgroundColor: theme.colors.background.secondary,
      borderRadius: theme.layout.dimensions.chat.inputBorderRadius * 2.5, // Use theme border radius
      // Use theme shadows for neumorphic effect
      ...theme.shadows.medium,
    },

    // Native TextInput styling - iOS Messages style
    input: {
      flex: 1,
      textAlignVertical: 'top',
      paddingVertical: theme.spacing.sm, // Use theme spacing
      paddingHorizontal: theme.spacing.md, // Use theme spacing
      fontSize: theme.layout.dimensions.chat.inputFontSize, // Use theme font size
      lineHeight: theme.layout.dimensions.chat.inputLineHeight, // Use theme line height
      color: theme.colors.text.primary,
      fontFamily: theme.typography.fontFamily.primary,
      backgroundColor: 'transparent', // Transparent background
      borderWidth: theme.borders.widths.none, // Use theme border width
      borderRadius: 0, // No border radius for input
      // Web-specific: Remove focus outline
      outlineWidth: theme.borders.widths.none,
      outlineColor: 'transparent',
      boxShadow: 'none',
    },

    // Send button container
    sendButtonContainer: {
      justifyContent: 'flex-end',
      alignItems: 'center',
      marginBottom: theme.spacing.xs, // Use theme spacing
    },

    // Send button styling - Perfect circle with neumorphic effect
    sendButton: {
      width: theme.layout.dimensions.chat.sendButtonSize, // Use theme button size
      height: theme.layout.dimensions.chat.sendButtonSize, // Use theme button size
      borderRadius: theme.layout.dimensions.chat.sendButtonSize / 2, // Use theme border radius
      padding: theme.borders.widths.none, // Use theme border width
      backgroundColor: theme.colors.background.secondary, // Use theme background
      borderWidth: theme.borders.widths.none, // Use theme border width
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'visible', // Ensure icons aren't clipped
      // Use theme shadows for neumorphic effect
      ...theme.shadows.medium,
      // Web-style focus outline removal for all platforms
      outlineWidth: theme.borders.widths.none,
      outlineColor: 'transparent',
      boxShadow: 'none',
    },

    // Active send button (when text is present) - Neumorphic pressed effect
    sendButtonActive: {
      backgroundColor: theme.colors.primary, // Use theme primary color
      // Use theme light shadows for pressed effect
      ...theme.shadows.light,
    },

    // Sending state - Neumorphic pressed effect
    sendButtonSending: {
      backgroundColor: theme.colors.primary, // Use theme error color
      // Use theme light shadows for pressed effect
      ...theme.shadows.light,
    },

    // Typing indicator
    typingIndicator: {
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.sm,
    },

    // Typing text
    typingText: {
      fontSize: theme.layout.dimensions.chat.secondaryFontSize, // Use theme font size
      color: theme.colors.text.secondary,
      fontStyle: 'italic',
    },

    // Search button container
    searchButtonContainer: {
      justifyContent: 'flex-end',
      alignItems: 'center',
      marginBottom: theme.spacing.xs, // Use theme spacing
    },

    // Search button styling - Perfect circle with neumorphic effect
    searchButton: {
      width: theme.layout.dimensions.chat.sendButtonSize, // Use theme button size
      height: theme.layout.dimensions.chat.sendButtonSize, // Use theme button size
      borderRadius: theme.layout.dimensions.chat.sendButtonSize / 2, // Use theme border radius
      padding: theme.borders.widths.none, // Use theme border width
      backgroundColor: theme.colors.background.secondary, // Use theme background
      borderWidth: theme.borders.widths.none, // Use theme border width
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'visible', // Ensure icons aren't clipped
      // Use theme shadows for neumorphic effect
      ...theme.shadows.medium,
      // Web-style focus outline removal for all platforms
      outlineWidth: theme.borders.widths.none,
      outlineColor: 'transparent',
      boxShadow: 'none',
    },

    // Search button active state - Neumorphic pressed effect
    searchButtonActive: {
      backgroundColor: theme.colors.status.info.secondary,
      // Use theme light shadows for pressed effect
      ...theme.shadows.light,
    },
  });

  return {
    styles,
  };
};
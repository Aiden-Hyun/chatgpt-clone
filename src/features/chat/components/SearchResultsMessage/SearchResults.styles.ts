// src/features/chat/components/SearchResultsMessage/SearchResults.styles.ts
import { StyleSheet } from 'react-native';
import { AppTheme } from '../../../theme/theme.types';

/**
 * SearchResults Styles - Clean card-based layout
 * Features:
 * - Card-based design for search results
 * - Clean typography hierarchy
 * - Subtle shadows and borders
 * - Responsive layout
 */
export const createSearchResultsStyles = (theme: AppTheme) => {
  
  const styles = StyleSheet.create({
    // Main container
    container: {
      backgroundColor: theme.colors.background.secondary,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      marginHorizontal: theme.spacing.lg,
      marginVertical: theme.spacing.sm,
      shadowColor: theme.colors.text.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },

    // Header with search icon and query
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.md,
      paddingBottom: theme.spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border.light,
    },

    // Search query text
    queryText: {
      marginLeft: theme.spacing.sm,
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text.primary,
      fontFamily: theme.fontFamily.primary,
    },

    // Results container
    resultsContainer: {
      gap: theme.spacing.sm,
    },

    // Individual result card
    resultCard: {
      backgroundColor: theme.colors.background.primary,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.border.light,
      shadowColor: theme.colors.text.primary,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },

    // Result title
    resultTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.primary,
      fontFamily: theme.fontFamily.primary,
      marginBottom: theme.spacing.xs,
      lineHeight: 20,
    },

    // Result snippet
    resultSnippet: {
      fontSize: 14,
      color: theme.colors.text.primary,
      fontFamily: theme.fontFamily.primary,
      marginBottom: theme.spacing.sm,
      lineHeight: 18,
    },

    // Result metadata row
    resultMeta: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.xs,
    },

    // Result source
    resultSource: {
      fontSize: 12,
      fontWeight: '500',
      color: theme.colors.text.secondary,
      fontFamily: theme.fontFamily.primary,
    },

    // Result timestamp
    resultTimestamp: {
      fontSize: 12,
      color: theme.colors.text.secondary,
      fontFamily: theme.fontFamily.primary,
    },

    // Result URL
    resultUrl: {
      fontSize: 12,
      color: theme.colors.primary,
      fontFamily: theme.fontFamily.primary,
      lineHeight: 16,
    },

    // Footer
    footer: {
      marginTop: theme.spacing.md,
      paddingTop: theme.spacing.sm,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border.light,
      alignItems: 'center',
    },

    // Footer text
    footerText: {
      fontSize: 12,
      color: theme.colors.text.secondary,
      fontFamily: theme.fontFamily.primary,
      fontStyle: 'italic',
    },
  });

  return styles;
};

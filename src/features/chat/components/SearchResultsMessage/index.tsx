// src/features/chat/components/SearchResultsMessage/index.tsx
import { Text } from '@/components/ui';
import { useAppTheme } from '@/features/theme/theme';
import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { SearchResult } from '../../services/interfaces/ISearchService';
import { createSearchResultsStyles } from './SearchResults.styles';

interface SearchResultsMessageProps {
  searchQuery: string;
  searchResults: SearchResult[];
  onResultPress?: (result: SearchResult) => void;
}

/**
 * SearchResultsMessage - Displays search results in chat format
 * Features:
 * - Clean card-based layout for search results
 * - Clickable results that can open URLs
 * - Search query display
 * - Source attribution
 */
const SearchResultsMessage: React.FC<SearchResultsMessageProps> = ({
  searchQuery,
  searchResults,
  onResultPress,
}) => {
  console.log('🔍 [SearchResultsMessage] Rendering component:', {
    query: searchQuery,
    resultCount: searchResults.length
  });
  
  const theme = useAppTheme();
  const styles = createSearchResultsStyles(theme);

  const handleResultPress = (result: SearchResult) => {
    if (onResultPress) {
      onResultPress(result);
    } else {
      // Default behavior: try to open URL
      if (result.url) {
        // In a real implementation, this would open the URL
        console.log('Opening URL:', result.url);
      }
    }
  };

  return (
    <View style={styles.container}>
      {/* Search query header */}
      <View style={styles.header}>
        <MaterialIcons 
          name="search" 
          size={16} 
          color={theme.colors.text.secondary} 
        />
        <Text style={styles.queryText}>
          Search results for "{searchQuery}"
        </Text>
      </View>

      {/* Search results */}
      <View style={styles.resultsContainer}>
        {searchResults.map((result, index) => (
          <TouchableOpacity
            key={`${result.url}-${index}`}
            style={styles.resultCard}
            onPress={() => handleResultPress(result)}
            activeOpacity={0.7}
          >
            {/* Result title */}
            <Text style={styles.resultTitle} numberOfLines={2}>
              {result.title}
            </Text>

            {/* Result snippet */}
            <Text style={styles.resultSnippet} numberOfLines={3}>
              {result.snippet}
            </Text>

            {/* Result metadata */}
            <View style={styles.resultMeta}>
              <Text style={styles.resultSource}>
                {result.source}
              </Text>
              {result.timestamp && (
                <Text style={styles.resultTimestamp}>
                  {new Date(result.timestamp).toLocaleDateString()}
                </Text>
              )}
            </View>

            {/* URL preview */}
            <Text style={styles.resultUrl} numberOfLines={1}>
              {result.url}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Footer with result count */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Found {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
        </Text>
      </View>
    </View>
  );
};

export default SearchResultsMessage;

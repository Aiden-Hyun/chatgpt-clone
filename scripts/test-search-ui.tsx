// scripts/test-search-ui.tsx
import React from 'react';
import { Text, View } from 'react-native';
import SearchResultsMessage from '../src/features/chat/components/SearchResultsMessage';
import { MockSearchService } from '../src/features/chat/services/implementations/MockSearchService';

// Simple test component to verify search UI
const TestSearchUI: React.FC = () => {
  const [searchResults, setSearchResults] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(false);

  const testSearch = async () => {
    setLoading(true);
    try {
      const searchService = new MockSearchService(3);
      const results = await searchService.search('OpenAI ChatGPT');
      setSearchResults(results);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    testSearch();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading search results...</Text>
      </View>
    );
  }

  if (!searchResults) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>No search results</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 20 }}>
        Search UI Test
      </Text>
      
      <SearchResultsMessage
        searchQuery={searchResults.query}
        searchResults={searchResults.results}
        onResultPress={(result) => {
          console.log('Result pressed:', result);
        }}
      />
    </View>
  );
};

export default TestSearchUI;


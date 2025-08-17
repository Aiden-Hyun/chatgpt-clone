// scripts/test-google-search.ts
import { GoogleCustomSearchService } from '../src/features/chat/services/implementations/GoogleCustomSearchService';

async function testGoogleSearchService() {
  console.log('🧪 Testing Google Custom Search Service...\n');
  
  const searchService = new GoogleCustomSearchService(3);
  
  try {
    // Test 1: News query
    console.log('📰 Testing news query...');
    const newsResult = await searchService.search('latest technology news');
    console.log('✅ News search successful:', {
      query: newsResult.query,
      resultCount: newsResult.results.length,
      searchTime: newsResult.searchTime,
      totalResults: newsResult.totalResults,
      firstResult: newsResult.results[0]?.title
    });
    
    // Test 2: Weather query
    console.log('\n🌤️ Testing weather query...');
    const weatherResult = await searchService.search('current weather forecast');
    console.log('✅ Weather search successful:', {
      query: weatherResult.query,
      resultCount: weatherResult.results.length,
      searchTime: weatherResult.searchTime,
      totalResults: weatherResult.totalResults,
      firstResult: weatherResult.results[0]?.title
    });
    
    // Test 3: Generic query
    console.log('\n🔍 Testing generic query...');
    const genericResult = await searchService.search('artificial intelligence trends');
    console.log('✅ Generic search successful:', {
      query: genericResult.query,
      resultCount: genericResult.results.length,
      searchTime: genericResult.searchTime,
      totalResults: genericResult.totalResults,
      firstResult: genericResult.results[0]?.title
    });
    
    console.log('\n🎉 All tests passed! Google Custom Search Service is working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.log('\n💡 Make sure:');
    console.log('1. GOOGLE_CLOUD_API_KEY is set in your environment');
    console.log('2. The API key has Custom Search API enabled');
    console.log('3. The Search Engine ID is correct');
  }
}

// Run the test
testGoogleSearchService().catch(console.error);


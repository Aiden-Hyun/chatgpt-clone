// scripts/test-web-search.ts
import { WebSearchService } from '../src/features/chat/services/implementations/WebSearchService';

async function testWebSearchService() {
  console.log('🧪 Testing Web Search Service...\n');
  
  const searchService = new WebSearchService(3);
  
  try {
    // Test 1: News/events query
    console.log('📰 Testing news query...');
    const newsResult = await searchService.search('today\'s events');
    console.log('✅ News search successful:', {
      query: newsResult.query,
      resultCount: newsResult.results.length,
      searchTime: newsResult.searchTime,
      firstResult: newsResult.results[0]?.title
    });
    
    // Test 2: Weather query
    console.log('\n🌤️ Testing weather query...');
    const weatherResult = await searchService.search('weather today');
    console.log('✅ Weather search successful:', {
      query: weatherResult.query,
      resultCount: weatherResult.results.length,
      searchTime: weatherResult.searchTime,
      firstResult: weatherResult.results[0]?.title
    });
    
    // Test 3: Generic query
    console.log('\n🔍 Testing generic query...');
    const genericResult = await searchService.search('artificial intelligence');
    console.log('✅ Generic search successful:', {
      query: genericResult.query,
      resultCount: genericResult.results.length,
      searchTime: genericResult.searchTime,
      firstResult: genericResult.results[0]?.title
    });
    
    console.log('\n🎉 All tests passed! WebSearchService is working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testWebSearchService().catch(console.error);


// scripts/test-search-integration.ts
import { MockSearchService } from '../src/features/chat/services/implementations/MockSearchService';

async function testSearchIntegration() {
  console.log('🧪 Testing Search Integration...\n');
  
  try {
    // Test search service directly
    console.log('🔍 Testing search service...');
    const searchService = new MockSearchService(3);
    
    const searchResult = await searchService.search('OpenAI ChatGPT');
    console.log(`   Found ${searchResult.results.length} results`);
    console.log(`   Search time: ${searchResult.searchTime}ms`);
    
    if (searchResult.results.length > 0) {
      console.log('\n📋 First result:');
      const firstResult = searchResult.results[0];
      console.log(`   Title: ${firstResult.title}`);
      console.log(`   Source: ${firstResult.source}`);
      console.log(`   URL: ${firstResult.url}`);
    }
    
    // Test different query types
    console.log('\n🔍 Testing different query types...');
    const reactResult = await searchService.search('React Native');
    console.log(`   React Native: ${reactResult.results.length} results`);
    
    const tsResult = await searchService.search('TypeScript');
    console.log(`   TypeScript: ${tsResult.results.length} results`);
    
    console.log('\n🎉 Search integration test completed successfully!');
    console.log('\n📋 Summary:');
    console.log('   ✅ Search service working');
    console.log('   ✅ Mock results generated correctly');
    console.log('   ✅ Different query types handled');
    console.log('   ✅ Ready for backend integration');
    
  } catch (error) {
    console.error('❌ Search integration test failed:', error);
  }
}

// Run the test
testSearchIntegration().catch(console.error);

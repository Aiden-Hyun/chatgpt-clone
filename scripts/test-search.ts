// scripts/test-search.ts
import { MockSearchService } from '../src/features/chat/services/implementations/MockSearchService';

async function testSearchService() {
  console.log('🧪 Testing Mock Search Service...\n');
  
  const searchService = new MockSearchService(3);
  
  // Test basic functionality
  console.log('✅ Service availability:', searchService.isAvailable());
  console.log('✅ Provider name:', searchService.getProviderName());
  
  try {
    // Test search functionality
    console.log('\n🔍 Testing search for "OpenAI ChatGPT"...');
    const result = await searchService.search('OpenAI ChatGPT');
    
    console.log('✅ Search completed successfully!');
    console.log('📊 Results:');
    console.log(`   Query: ${result.query}`);
    console.log(`   Total results: ${result.totalResults}`);
    console.log(`   Search time: ${result.searchTime}ms`);
    console.log(`   Results returned: ${result.results.length}`);
    
    if (result.results.length > 0) {
      console.log('\n📋 First result:');
      const firstResult = result.results[0];
      console.log(`   Title: ${firstResult.title}`);
      console.log(`   Source: ${firstResult.source}`);
      console.log(`   URL: ${firstResult.url}`);
      console.log(`   Snippet: ${firstResult.snippet.substring(0, 100)}...`);
    }
    
    // Test different query types
    console.log('\n🔍 Testing search for "React Native"...');
    const reactResult = await searchService.search('React Native');
    console.log(`   Found ${reactResult.results.length} React Native results`);
    
    console.log('\n🔍 Testing search for "TypeScript"...');
    const tsResult = await searchService.search('TypeScript');
    console.log(`   Found ${tsResult.results.length} TypeScript results`);
    
    console.log('\n🎉 Search service test completed successfully!');
    
  } catch (error) {
    console.error('❌ Search test failed:', error);
  }
}

// Run the test
testSearchService().catch(console.error);

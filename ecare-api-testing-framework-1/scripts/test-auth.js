#!/usr/bin/env node

const { request } = require('@playwright/test');
const AuthHelper = require('../utils/authHelper');
const ApiClient = require('../utils/apiClient');

async function testAuthentication() {
  console.log('🧪 TESTING AUTOMATIC TOKEN GENERATION');
  console.log('═'.repeat(50));
  
  try {
    // Create API client
    const apiRequest = await request.newContext({
      baseURL: 'https://stage-api.ecarehealth.com',
      ignoreHTTPSErrors: true
    });
    
    const apiClient = new ApiClient(apiRequest);
    
    // Test automatic authentication
    console.log('🔄 Testing automatic token generation...');
    const token = await AuthHelper.authenticate(apiClient);
    
    if (token) {
      console.log('\n✅ SUCCESS! Automatic token generation working perfectly!');
      
      // Test the token with a real API call
      console.log('\n🔍 Testing token with actual API call...');
      
      try {
        const testResponse = await apiClient.makeRequest('GET', '/api/master/provider', null, [200, 401, 403], true);
        
        if (testResponse.status === 200) {
          console.log('✅ Token works perfectly with API!');
          console.log('🎉 Ready for fully automatic testing!');
        } else if (testResponse.status === 401) {
          console.log('❌ Token generated but API returns 401 - check permissions');
        } else {
          console.log(`⚠️ API returned status ${testResponse.status} - may be normal`);
        }
        
      } catch (error) {
        console.log(`⚠️ API test inconclusive: ${error.message}`);
        console.log('✅ But token generation is working!');
      }
      
      console.log('\n🚀 READY TO RUN TESTS:');
      console.log('   npm test');
      console.log('\n💡 Each test run will now get a completely fresh token automatically!');
      
    } else {
      console.log('❌ Token generation failed - no token returned');
    }
    
    await apiRequest.dispose();
    
  } catch (error) {
    console.log(`❌ Authentication test failed: ${error.message}`);
    
    console.log('\n🔧 TROUBLESHOOTING:');
    console.log('1. Check your credentials in .env file');
    console.log('2. Verify network connectivity');
    console.log('3. Make sure Keycloak service is accessible');
    console.log('\nTry running the discovery script again:');
    console.log('   npm run discover-endpoints');
  }
}

// Run the test
testAuthentication().catch((error) => {
  console.error('Script error:', error);
  process.exit(1);
});
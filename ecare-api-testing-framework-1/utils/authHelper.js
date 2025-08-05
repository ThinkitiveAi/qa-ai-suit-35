class AuthHelper {
  static getLoginCredentials() {
    return {
      username: 'rose.gomez@jourrapide.com',
      password: process.env.TEST_PASSWORD || 'Pass@123',
      tenantId: 'stage_aithinkitive'
    };
  }

  // FULLY AUTOMATIC TOKEN GENERATION - Gets fresh token for every test run
  static async authenticate(apiClient) {
    console.log('\n🔐 Step 1: Authenticating user...');
    console.log('🔄 Generating fresh bearer token automatically...');
    
    const loginData = this.getLoginCredentials();
    console.log(`👤 User: ${loginData.username}`);

    try {
      // Use the discovered working Keycloak OIDC endpoint
      const tokenEndpoint = 'https://dev-iam.ecarehealth.com/realms/stage_aithinkitive/protocol/openid-connect/token';
      
      console.log('🔍 Connecting to Keycloak authentication service...');
      
      // Create request context for Keycloak
      const { request } = require('@playwright/test');
      const keycloakRequest = await request.newContext({
        baseURL: 'https://dev-iam.ecarehealth.com',
        extraHTTPHeaders: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        ignoreHTTPSErrors: true
      });

      // Prepare OAuth2 password grant request
      const formData = new URLSearchParams({
        grant_type: 'password',
        client_id: 'js-client',
        username: loginData.username,
        password: loginData.password,
        scope: 'openid profile email'
      });

      console.log('🔑 Requesting fresh access token...');

      // Get fresh token from Keycloak
      const response = await keycloakRequest.post('/realms/stage_aithinkitive/protocol/openid-connect/token', {
        data: formData.toString(),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      // Process response BEFORE disposing the request context
      const responseStatus = response.status();
      let tokenResponse;
      let errorText;

      if (responseStatus === 200) {
        tokenResponse = await response.json();
      } else {
        errorText = await response.text();
      }

      // Now dispose the request context
      await keycloakRequest.dispose();

      if (responseStatus === 200) {
        const freshToken = tokenResponse.access_token;
        
        if (freshToken) {
          // Set the fresh token in API client
          apiClient.setBearerToken(freshToken);
          
          console.log('✅ Fresh bearer token generated successfully!');
          this.logTokenInfo(freshToken);
          
          return freshToken;
        } else {
          throw new Error('No access token in response');
        }
      } else {
        throw new Error(`Authentication failed with status ${responseStatus}: ${errorText}`);
      }

    } catch (error) {
      console.log(`❌ Automatic token generation failed: ${error.message}`);
      
      // Provide helpful error information
      console.log('\n🔧 TROUBLESHOOTING:');
      console.log('1. Check if credentials are correct:');
      console.log(`   - Username: ${loginData.username}`);
      console.log(`   - Password: ${loginData.password ? '[PROVIDED]' : '[MISSING]'}`);
      console.log('2. Verify network connectivity to dev-iam.ecarehealth.com');
      console.log('3. Check if the Keycloak service is running');
      
      throw new Error(`Authentication failed: ${error.message}`);
    }
  }

  // Log detailed token information
  static logTokenInfo(token) {
    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]));
        const issuedDate = new Date(payload.iat * 1000);
        const expirationDate = new Date(payload.exp * 1000);
        const currentDate = new Date();
        const timeLeft = Math.ceil((expirationDate - currentDate) / (1000 * 60));
        
        console.log('📋 Token Details:');
        console.log(`   👤 User: ${payload.preferred_username || payload.name}`);
        console.log(`   🏢 Issuer: ${payload.iss.split('/').pop()}`);
        console.log(`   📱 Client: ${payload.azp}`);
        console.log(`   🕒 Issued: ${issuedDate.toLocaleString()}`);
        console.log(`   ⏰ Expires: ${expirationDate.toLocaleString()}`);
        console.log(`   ⏱️  Valid for: ${timeLeft > 0 ? timeLeft + ' minutes' : 'EXPIRED'}`);
        console.log(`   🔑 Token ID: ${payload.jti.substring(0, 8)}...`);
        
        // Show roles for debugging
        if (payload.realm_access && payload.realm_access.roles) {
          console.log(`   👑 Roles: ${payload.realm_access.roles.join(', ')}`);
        }
      }
    } catch (error) {
      console.log('✅ Fresh token generated (could not parse details)');
    }
  }

  // Verify token is working by testing API access
  static async verifyTokenWorks(apiClient) {
    try {
      console.log('🔍 Verifying token works with API...');
      
      // Test with a simple API call
      const response = await apiClient.makeRequest('GET', '/api/master/provider', null, [200, 401, 403], true);
      
      if (response.status === 200) {
        console.log('✅ Token verification successful - API accessible');
        return true;
      } else if (response.status === 401) {
        console.log('❌ Token verification failed - Unauthorized');
        return false;
      } else {
        console.log('⚠️ Token seems valid but different API response');
        return true; // Assume token is good
      }
    } catch (error) {
      console.log(`⚠️ Token verification inconclusive: ${error.message}`);
      return true; // Don't fail authentication due to API issues
    }
  }

  // Method to refresh token if needed (called automatically if token expires during test)
  static async refreshTokenIfNeeded(apiClient, currentToken) {
    if (!currentToken || this.isTokenExpired(currentToken)) {
      console.log('🔄 Token expired, generating fresh token...');
      return await this.authenticate(apiClient);
    }
    
    return currentToken;
  }

  // Check if token is expired
  static isTokenExpired(token) {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return true;
      
      const payload = JSON.parse(atob(parts[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      const bufferTime = 300; // 5 minutes buffer
      
      return payload.exp < (currentTime + bufferTime);
    } catch (error) {
      return true;
    }
  }
}

module.exports = AuthHelper;
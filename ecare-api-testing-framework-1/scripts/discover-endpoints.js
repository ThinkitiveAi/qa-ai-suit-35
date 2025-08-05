#!/usr/bin/env node

const { request } = require('@playwright/test');

class AuthenticationDiscovery {
  constructor() {
    this.credentials = {
      username: 'rose.gomez@jourrapide.com',
      password: 'Pass@123',
      tenantId: 'stage_aithinkitive'
    };
  }

  async discover() {
    console.log('🔍 COMPREHENSIVE AUTHENTICATION DISCOVERY');
    console.log('═'.repeat(60));
    console.log(`👤 Testing with user: ${this.credentials.username}\n`);

    // Method 1: Keycloak/OIDC Discovery
    await this.discoverKeycloak();
    
    // Method 2: Alternative auth services
    await this.discoverAuthServices();
    
    // Method 3: Frontend authentication
    await this.discoverFrontendAuth();
    
    // Method 4: JWT issuer analysis
    await this.analyzeJWTIssuer();
    
    // Method 5: Common endpoint patterns
    await this.discoverCommonPatterns();

    console.log('\n🎯 DISCOVERY COMPLETE');
    console.log('═'.repeat(40));
    console.log('Check the results above to find working authentication endpoints.');
  }

  async discoverKeycloak() {
    console.log('🔐 METHOD 1: KEYCLOAK/OIDC DISCOVERY');
    console.log('─'.repeat(50));
    
    // Based on JWT issuer from your token
    const keycloakBase = 'https://dev-iam.ecarehealth.com';
    const realm = 'stage_aithinkitive';
    
    try {
      const keycloakRequest = await request.newContext({
        baseURL: keycloakBase,
        ignoreHTTPSErrors: true
      });

      // Test OIDC discovery
      console.log(`🔍 Testing OIDC discovery: ${keycloakBase}/realms/${realm}/.well-known/openid-configuration`);
      
      try {
        const discoveryResponse = await keycloakRequest.get(`/realms/${realm}/.well-known/openid-configuration`);
        console.log(`  Status: ${discoveryResponse.status()}`);
        
        if (discoveryResponse.status() === 200) {
          const config = await discoveryResponse.json();
          console.log('  ✅ OIDC Configuration Found!');
          console.log(`  🔑 Token Endpoint: ${config.token_endpoint}`);
          console.log(`  🔑 Auth Endpoint: ${config.authorization_endpoint}`);
          
          // Test token endpoint
          if (config.token_endpoint) {
            await this.testTokenEndpoint(config.token_endpoint);
          }
        }
      } catch (error) {
        console.log(`  ❌ OIDC discovery failed: ${error.message}`);
      }

      // Test direct Keycloak endpoints
      const keycloakEndpoints = [
        `/realms/${realm}/protocol/openid-connect/token`,
        `/auth/realms/${realm}/protocol/openid-connect/token`,
        `/realms/${realm}/protocol/openid-connect/auth`
      ];

      for (const endpoint of keycloakEndpoints) {
        await this.testKeycloakEndpoint(keycloakRequest, keycloakBase, endpoint);
      }

      await keycloakRequest.dispose();
      
    } catch (error) {
      console.log(`❌ Keycloak discovery error: ${error.message}`);
    }
    
    console.log('');
  }

  async testKeycloakEndpoint(keycloakRequest, baseUrl, endpoint) {
    try {
      console.log(`🔍 Testing: ${baseUrl}${endpoint}`);
      
      const formData = new URLSearchParams({
        grant_type: 'password',
        client_id: 'js-client',
        username: this.credentials.username,
        password: this.credentials.password,
        scope: 'openid profile email'
      });

      const response = await keycloakRequest.post(endpoint, {
        data: formData.toString(),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      console.log(`  Status: ${response.status()}`);
      
      if (response.status() === 200) {
        const tokenResponse = await response.json();
        if (tokenResponse.access_token) {
          console.log('  🎉 SUCCESS! Token obtained');
          console.log(`  🔑 Token preview: ${tokenResponse.access_token.substring(0, 50)}...`);
          return true;
        }
      } else {
        const errorResponse = await response.text();
        console.log(`  ❌ Error: ${errorResponse.substring(0, 200)}...`);
      }
      
    } catch (error) {
      console.log(`  ❌ Request failed: ${error.message}`);
    }
    
    return false;
  }

  async testTokenEndpoint(tokenEndpoint) {
    try {
      console.log(`🔍 Testing token endpoint: ${tokenEndpoint}`);
      
      const tokenRequest = await request.newContext({
        ignoreHTTPSErrors: true
      });

      const formData = new URLSearchParams({
        grant_type: 'password',
        client_id: 'js-client',
        username: this.credentials.username,
        password: this.credentials.password,
        scope: 'openid profile email'
      });

      const response = await tokenRequest.post(tokenEndpoint, {
        data: formData.toString(),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      console.log(`  Status: ${response.status()}`);
      
      if (response.status() === 200) {
        const tokenResponse = await response.json();
        if (tokenResponse.access_token) {
          console.log('  🎉 SUCCESS! Fresh token obtained from OIDC endpoint');
          console.log(`  🔑 Token preview: ${tokenResponse.access_token.substring(0, 50)}...`);
        }
      }

      await tokenRequest.dispose();
      
    } catch (error) {
      console.log(`  ❌ Token endpoint test failed: ${error.message}`);
    }
  }

  async discoverAuthServices() {
    console.log('🔐 METHOD 2: ALTERNATIVE AUTH SERVICES');
    console.log('─'.repeat(50));
    
    const authServices = [
      'https://auth.ecarehealth.com',
      'https://identity.ecarehealth.com', 
      'https://login.ecarehealth.com',
      'https://iam.ecarehealth.com',
      'https://sso.ecarehealth.com',
      'https://api.ecarehealth.com'
    ];

    const endpoints = ['/api/auth/login', '/login', '/api/login', '/auth/login'];

    for (const service of authServices) {
      console.log(`🔍 Testing service: ${service}`);
      
      try {
        const serviceRequest = await request.newContext({
          baseURL: service,
          ignoreHTTPSErrors: true
        });

        for (const endpoint of endpoints) {
          await this.testAuthEndpoint(serviceRequest, service, endpoint);
        }

        await serviceRequest.dispose();
        
      } catch (error) {
        console.log(`  ❌ Service ${service} unreachable: ${error.message}`);
      }
    }
    
    console.log('');
  }

  async testAuthEndpoint(serviceRequest, baseUrl, endpoint) {
    try {
      const response = await serviceRequest.post(endpoint, {
        data: {
          username: this.credentials.username,
          password: this.credentials.password,
          tenantId: this.credentials.tenantId
        },
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log(`  ${endpoint}: ${response.status()}`);
      
      if (response.status() === 200) {
        const authResponse = await response.json();
        const token = this.extractToken(authResponse);
        
        if (token) {
          console.log(`  🎉 SUCCESS! Token from ${baseUrl}${endpoint}`);
          console.log(`  🔑 Token preview: ${token.substring(0, 50)}...`);
        }
      }
      
    } catch (error) {
      console.log(`  ${endpoint}: Request failed`);
    }
  }

  async discoverFrontendAuth() {
    console.log('🔐 METHOD 3: FRONTEND AUTHENTICATION');
    console.log('─'.repeat(50));
    
    const frontendBase = 'https://qa.practiceeasily.com';
    console.log(`🔍 Testing frontend: ${frontendBase}`);
    
    try {
      const frontendRequest = await request.newContext({
        baseURL: frontendBase,
        ignoreHTTPSErrors: true
      });

      const endpoints = ['/api/auth/login', '/api/login', '/login', '/auth/signin', '/signin'];

      for (const endpoint of endpoints) {
        await this.testAuthEndpoint(frontendRequest, frontendBase, endpoint);
      }

      await frontendRequest.dispose();
      
    } catch (error) {
      console.log(`❌ Frontend discovery error: ${error.message}`);
    }
    
    console.log('');
  }

  async analyzeJWTIssuer() {
    console.log('🔐 METHOD 4: JWT ISSUER ANALYSIS');
    console.log('─'.repeat(50));
    
    // Analyze the working token to understand the auth system
    const workingToken = 'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJldEJ0MVpKbDlOQ1pEX0VMWUM2dDlISzItQkQybU5wOHZHX3lhczFXN1pZIn0.eyJleHAiOjE3NTM0ODUwOTIsImlhdCI6MTc1MzQ0OTA5MiwianRpIjoiMDNiNmM3MWQtMDA3ZC00OWUyLWE0OGItZmM2NDNhZTk2MjQyIiwiaXNzIjoiaHR0cHM6Ly9kZXYtaWFtLmVjYXJlaGVhbHRoLmNvbS9yZWFsbXMvc3RhZ2VfYWl0aGlua2l0aXZlIiwiYXVkIjoiYWNjb3VudCIsInN1YiI6IjYxMjFjZjk2LWFkM2EtNDIxMC04N2ViLWFkNDNlZjcxYmY4ZSIsInR5cCI6IkJlYXJlciIsImF6cCI6ImpzLWNsaWVudCIsInNpZCI6ImY5N2IzMGRhLTEzNWMtNDc5ZS04OWExLTE5YzViMmI4OGM0ZiIsImFjciI6IjEiLCJhbGxvd2VkLW9yaWdpbnMiOlsiKiJdLCJyZWFsbV9hY2Nlc3MiOnsicm9sZXMiOlsib2ZmbGluZV9hY2Nlc3MiLCJQUk9WSURFUiIsInVtYV9hdXRob3JpemF0aW9uIiwiZGVmYXVsdC1yb2xlcy1zdGFnZV9haXRoaW5raXRpdmUiXX0sInJlc291cmNlX2FjY2VzcyI6eyJhY2NvdW50Ijp7InJvbGVzIjpbIm1hbmFnZS1hY2NvdW50IiwibWFuYWdlLWFjY291bnQtbGlua3MiLCJ2aWV3LXByb2ZpbGUiXX19LCJzY29wZSI6Im9wZW5pZCBwcm9maWxlIGVtYWlsIiwiZW1haWxfdmVyaWZpZWQiOmZhbHNlLCJuYW1lIjoiUm9zZSBHb21leiIsInByZWZlcnJlZF91c2VybmFtZSI6InJvc2UuZ29tZXpAam91cnJhcGlkZS5jb20iLCJnaXZlbl9uYW1lIjoiUm9zZSIsImZhbWlseV9uYW1lIjoiR29tZXoiLCJlbWFpbCI6InJvc2UuZ29tZXpAam91cnJhcGlkZS5jb20ifQ';
    
    try {
      const parts = workingToken.split('.');
      const payload = JSON.parse(atob(parts[1]));
      
      console.log('📋 JWT Analysis:');
      console.log(`  🏢 Issuer: ${payload.iss}`);
      console.log(`  👤 Subject: ${payload.sub}`);
      console.log(`  🎯 Audience: ${payload.aud}`);
      console.log(`  📱 Client ID: ${payload.azp}`);
      console.log(`  🕒 Expires: ${new Date(payload.exp * 1000).toLocaleString()}`);
      console.log(`  👥 User: ${payload.preferred_username}`);
      
      // Test the issuer URL directly
      if (payload.iss) {
        console.log(`\n🔍 Testing issuer URL: ${payload.iss}`);
        await this.testIssuerEndpoints(payload.iss, payload.azp);
      }
      
    } catch (error) {
      console.log(`❌ JWT analysis error: ${error.message}`);
    }
    
    console.log('');
  }

  async testIssuerEndpoints(issuerUrl, clientId) {
    try {
      const issuerRequest = await request.newContext({
        baseURL: issuerUrl,
        ignoreHTTPSErrors: true
      });

      const tokenEndpoints = [
        '/protocol/openid-connect/token',
        '/oauth/token',
        '/token'
      ];

      for (const endpoint of tokenEndpoints) {
        console.log(`  🔍 Testing: ${issuerUrl}${endpoint}`);
        
        try {
          const formData = new URLSearchParams({
            grant_type: 'password',
            client_id: clientId || 'js-client',
            username: this.credentials.username,
            password: this.credentials.password,
            scope: 'openid profile email'
          });

          const response = await issuerRequest.post(endpoint, {
            data: formData.toString(),
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            }
          });

          console.log(`    Status: ${response.status()}`);
          
          if (response.status() === 200) {
            const tokenData = await response.json();
            if (tokenData.access_token) {
              console.log('    🎉 SUCCESS! Fresh token obtained from issuer');
              console.log(`    🔑 Token preview: ${tokenData.access_token.substring(0, 50)}...`);
            }
          }
          
        } catch (error) {
          console.log(`    ❌ Failed: ${error.message}`);
        }
      }

      await issuerRequest.dispose();
      
    } catch (error) {
      console.log(`  ❌ Issuer test error: ${error.message}`);
    }
  }

  async discoverCommonPatterns() {
    console.log('🔐 METHOD 5: COMMON PATTERNS DISCOVERY');
    console.log('─'.repeat(50));
    
    // Test base API with different auth patterns
    const baseUrl = 'https://stage-api.ecarehealth.com';
    
    try {
      const apiRequest = await request.newContext({
        baseURL: baseUrl,
        ignoreHTTPSErrors: true
      });

      const patterns = [
        { endpoint: '/authenticate', method: 'POST' },
        { endpoint: '/api/authenticate', method: 'POST' },
        { endpoint: '/api/v1/authenticate', method: 'POST' },
        { endpoint: '/api/v1/auth/token', method: 'POST' },
        { endpoint: '/oauth/token', method: 'POST' },
        { endpoint: '/token', method: 'POST' },
        { endpoint: '/api/token', method: 'POST' },
        { endpoint: '/api/sessions', method: 'POST' },
        { endpoint: '/sessions', method: 'POST' }
      ];

      for (const pattern of patterns) {
        console.log(`🔍 Testing: ${baseUrl}${pattern.endpoint}`);
        
        try {
          const response = await apiRequest.post(pattern.endpoint, {
            data: {
              username: this.credentials.username,
              password: this.credentials.password,
              tenantId: this.credentials.tenantId
            }
          });

          console.log(`  Status: ${response.status()}`);
          
          if (response.status() === 200) {
            const authResponse = await response.json();
            const token = this.extractToken(authResponse);
            
            if (token) {
              console.log(`  🎉 SUCCESS! Token from ${pattern.endpoint}`);
              console.log(`  🔑 Token preview: ${token.substring(0, 50)}...`);
            }
          }
          
        } catch (error) {
          console.log(`  ❌ Failed: ${error.message}`);
        }
      }

      await apiRequest.dispose();
      
    } catch (error) {
      console.log(`❌ Pattern discovery error: ${error.message}`);
    }
  }

  extractToken(response) {
    if (!response) return null;

    const tokenFields = [
      'access_token', 'accessToken', 'token', 'authToken',
      'bearerToken', 'jwt', 'jwtToken', 'id_token'
    ];

    // Direct fields
    for (const field of tokenFields) {
      if (response[field]) return response[field];
    }

    // Nested objects
    const nestedObjects = ['data', 'result', 'response', 'payload', 'auth'];
    for (const obj of nestedObjects) {
      if (response[obj]) {
        for (const field of tokenFields) {
          if (response[obj][field]) return response[obj][field];
        }
      }
    }

    return null;
  }
}

// Run the comprehensive discovery
const discovery = new AuthenticationDiscovery();
discovery.discover().catch(console.error);
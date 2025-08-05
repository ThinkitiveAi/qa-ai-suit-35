// Environment configuration for different testing environments
const environments = {
  staging: {
    baseURL: 'https://stage-api.ecarehealth.com',
    loginEndpoint: '/api/auth/login', // Adjust this based on your actual login endpoint
    tenantId: 'stage_aithinkitive',
    credentials: {
      username: 'rose.gomez@jourrapide.com',
      password: process.env.TEST_PASSWORD || 'your_password_here' // Use environment variable for security
    }
  },
  
  production: {
    baseURL: 'https://api.ecarehealth.com',
    loginEndpoint: '/api/auth/login',
    tenantId: 'production_tenant',
    credentials: {
      username: 'prod.user@ecarehealth.com',
      password: process.env.PROD_PASSWORD || 'prod_password_here'
    }
  },

  development: {
    baseURL: 'https://dev-api.ecarehealth.com',
    loginEndpoint: '/api/auth/login',
    tenantId: 'dev_tenant',
    credentials: {
      username: 'dev.user@ecarehealth.com',
      password: process.env.DEV_PASSWORD || 'dev_password_here'
    }
  }
};

class EnvironmentConfig {
  static getCurrentEnvironment() {
    return process.env.TEST_ENV || 'staging';
  }

  static getEnvironmentConfig() {
    const currentEnv = this.getCurrentEnvironment();
    const config = environments[currentEnv];
    
    if (!config) {
      throw new Error(`Environment '${currentEnv}' not found. Available environments: ${Object.keys(environments).join(', ')}`);
    }
    
    console.log(`🌍 Using environment: ${currentEnv.toUpperCase()}`);
    return config;
  }

  static getBaseURL() {
    return this.getEnvironmentConfig().baseURL;
  }

  static getLoginEndpoint() {
    return this.getEnvironmentConfig().loginEndpoint;
  }

  static getCredentials() {
    return this.getEnvironmentConfig().credentials;
  }

  static getTenantId() {
    return this.getEnvironmentConfig().tenantId;
  }
}

module.exports = EnvironmentConfig;
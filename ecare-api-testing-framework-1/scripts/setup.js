#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up ECareHealth API Testing Framework...\n');

// Create required directories
const directories = [
  'utils',
  'tests',
  'config',
  'scripts',
  'examples',
  'test-results',
  'playwright-report'
];

directories.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`✅ Created directory: ${dir}`);
  }
});

// Create .env template file
const envTemplate = `# Environment Configuration
# Set your test environment (staging, production, development)
TEST_ENV=staging

# Credentials (use actual passwords here)
TEST_PASSWORD=your_actual_password_here
PROD_PASSWORD=your_prod_password_here
DEV_PASSWORD=your_dev_password_here

# Optional: Override specific configurations
# BASE_URL=https://your-custom-api.com
# LOGIN_ENDPOINT=/custom/auth/login
`;

const envPath = '.env';
if (!fs.existsSync(envPath)) {
  fs.writeFileSync(envPath, envTemplate);
  console.log('✅ Created .env template file');
  console.log('⚠️  Please update .env file with actual credentials');
}

// Create package.json if it doesn't exist
const packageJsonPath = 'package.json';
if (!fs.existsSync(packageJsonPath)) {
  const packageJson = {
    "name": "ecare-api-testing-framework",
    "version": "1.0.0",
    "description": "Playwright API Testing Framework for ECareHealth Clinician Management",
    "main": "index.js",
    "scripts": {
      "test": "npx playwright test",
      "test:debug": "npx playwright test --debug",
      "test:ui": "npx playwright test --ui",
      "test:headed": "npx playwright test --headed",
      "test:report": "npx playwright show-report",
      "test:staging": "TEST_ENV=staging npx playwright test",
      "test:prod": "TEST_ENV=production npx playwright test",
      "test:dev": "TEST_ENV=development npx playwright test",
      "install:browsers": "npx playwright install",
      "setup": "node scripts/setup.js"
    },
    "keywords": ["playwright", "api-testing", "automation", "healthcare"],
    "author": "Your Name",
    "license": "MIT",
    "devDependencies": {
      "@playwright/test": "^1.40.0",
      "@types/node": "^20.0.0"
    },
    "dependencies": {
      "faker": "^6.6.6",
      "moment": "^2.29.4",
      "dotenv": "^16.0.0"
    }
  };
  
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log('✅ Created package.json');
}

console.log(`
🎉 Setup completed successfully!

Next steps:
1. Install dependencies: npm install
2. Install Playwright browsers: npm run install:browsers
3. Update .env file with actual credentials
4. Run tests: npm test

Available commands:
- npm test                 # Run tests with current environment
- npm run test:staging     # Run tests on staging
- npm run test:prod        # Run tests on production
- npm run test:dev         # Run tests on development
- npm run test:ui          # Run with UI mode
- npm run test:debug       # Run in debug mode
- npm run test:report      # View test reports

Environment Configuration:
- Set TEST_ENV=staging|production|development
- Update credentials in .env file
- Framework will automatically get fresh token for each test run

Happy Testing! 🚀
`);
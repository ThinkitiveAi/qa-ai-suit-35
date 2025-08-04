import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 60000,
  expect: {
    timeout: 10000
  },
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['list']
  ],
  use: {
    baseURL: 'https://stage-api.ecarehealth.com/api/master',
    extraHTTPHeaders: {
      'Content-Type': 'application/json',
      'X-TENANT-ID': 'stage_aithinkitive'
    },
    ignoreHTTPSErrors: true
  },
  projects: [
    {
      name: 'api-tests',
      testDir: './tests'
    }
  ]
});
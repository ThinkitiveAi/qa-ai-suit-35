import { test, expect } from '@playwright/test';

// =========================
// Shared Test Data Store
// =========================
const testData = {
  provider: {
    firstName: 'Nisha',
    lastName: 'Dumbre',
    fullName: 'Nisha Dumbre',
    email: '',
    created: false,
    providerId: '' // Store provider ID for better tracking
  },
  patient: {
    firstName: 'Johnny',
    lastName: 'Das',
    fullName: 'Johnny Das',
    email: '',
    created: false
  },
  availability: {
    set: false
  }
};

// =========================
// Helper Functions
// =========================

// Simple logger utility
const Logger = {
  info: (message) => console.log(`[INFO] ${message}`),
  error: (message) => console.error(`[ERROR] ${message}`),
  success: (message) => console.log(`[SUCCESS] ${message}`),
  dependency: (message) => console.log(`[DEPENDENCY] ${message}`),
  warning: (message) => console.warn(`[WARNING] ${message}`)
};

// Generate random email for testing
function randomEmail(prefix = 'test.user') {
  const timestamp = Date.now();
  return `${prefix}.${timestamp}@example.com`;
}

// Enhanced login helper function with retry mechanism
async function login(page) {
  Logger.info('Starting login process');
  await page.goto('https://stage_aithinkitive.uat.provider.ecarehealth.com/auth/login');
  await page.getByRole('textbox', { name: 'Email' }).fill('rose.gomez@jourrapide.com');
  await page.getByRole('textbox', { name: '*********' }).fill('Pass@123');
  await page.getByRole('button', { name: 'Let\'s get Started' }).click();
  await page.waitForLoadState('networkidle');
  Logger.info('Login completed');
}

// Logout helper function
async function logout(page) {
  Logger.info('Starting logout process');
  try {
    await page.getByRole('banner').getByTestId('KeyboardArrowRightIcon').click();
    await page.getByRole('menuitem', { name: 'Logout' }).click();
    Logger.info('Logout completed');
  } catch (error) {
    Logger.error('Logout failed or elements not found');
  }
}

// Helper function to wait for provider to appear in availability dropdown
async function waitForProviderInAvailability(page, providerName, maxRetries = 10) {
  Logger.info(`Waiting for provider "${providerName}" to appear in availability dropdown...`);
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      // Navigate to availability page
      await page.getByRole('tab', { name: 'Scheduling' }).click();
      await page.getByText('Availability').click();
      await page.getByRole('button', { name: 'Edit Availability' }).click();
      
      // Open provider dropdown
      await page.locator('form').filter({ hasText: 'Select Provider *Select' }).getByLabel('Open').click();
      
      // Check if provider exists
      const providerExists = await page.getByRole('option', { name: providerName }).isVisible({ timeout: 2000 }).catch(() => false);
      
      if (providerExists) {
        Logger.success(`Provider "${providerName}" found in availability dropdown after ${i + 1} attempts`);
        await page.keyboard.press('Escape'); // Close dropdown
        return true;
      }
      
      Logger.warning(`Attempt ${i + 1}/${maxRetries}: Provider not found, waiting 30 seconds...`);
      await page.keyboard.press('Escape'); // Close dropdown
      await page.keyboard.press('Escape'); // Close modal if any
      await page.waitForTimeout(30000); // Wait 30 seconds
      
    } catch (error) {
      Logger.warning(`Attempt ${i + 1} failed: ${error.message}`);
      await page.keyboard.press('Escape'); // Close any open modals
      await page.waitForTimeout(5000);
    }
  }
  
  Logger.error(`Provider "${providerName}" not found after ${maxRetries} attempts`);
  return false;
}

// Helper function to verify provider exists in provider list
async function verifyProviderExists(page, providerName) {
  Logger.info(`Verifying provider "${providerName}" exists in provider list...`);
  
  try {
    await page.getByRole('banner').getByTestId('KeyboardArrowRightIcon').click();
    await page.getByRole('tab', { name: 'Settings' }).click();
    await page.getByRole('menuitem', { name: 'User Settings' }).click();
    await page.getByRole('tab', { name: 'Providers' }).click();
    
    // Look for the provider in the list
    const providerVisible = await page.locator(`text=${providerName}`).isVisible({ timeout: 5000 });
    
    if (providerVisible) {
      Logger.success(`Provider "${providerName}" confirmed in provider list`);
      return true;
    } else {
      Logger.error(`Provider "${providerName}" not found in provider list`);
      return false;
    }
  } catch (error) {
    Logger.error(`Error verifying provider: ${error.message}`);
    return false;
  }
}

// Helper function to close any open modals
async function closeModals(page) {
  try {
    // Try pressing Escape multiple times to close any modals
    for (let i = 0; i < 3; i++) {
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
    }
    
    // Try clicking close icons
    const closeButtons = await page.locator('[data-testid="CloseIcon"]').all();
    for (const button of closeButtons) {
      if (await button.isVisible()) {
        await button.click();
        await page.waitForTimeout(500);
      }
    }
  } catch (error) {
    // Ignore errors in modal closing
  }
}
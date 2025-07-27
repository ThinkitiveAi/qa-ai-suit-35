import { test, expect, Page } from '@playwright/test';

test.describe('Login and Navigate to Users Tab in Settings Menu', () => {
  
  test('Login and Navigate to Users tab in Settings Menu', async ({ page }) => {
    // Navigate to the login page
    await page.goto('https://qa.practiceeasily.com/auth/login');
    
    // Wait for page to load completely
    await page.waitForLoadState('networkidle');
    
    // Fill email field
    await page.fill('input[type="email"], input[name="email"], [placeholder*="email" i]', 'bhavna.adhav+13@thinkitive.com');
    
    // Fill password field
    await page.fill('input[type="password"], input[name="password"], [placeholder*="password" i]', 'Pass@123');
    
    // Click login button
    await page.click('button[type="submit"], input[type="submit"], button:has-text("Login"), button:has-text("Sign In")');
    
    // Wait for navigation after login
    await page.waitForLoadState('networkidle');
    
    // Verify successful login by checking for dashboard elements
    await expect(page.locator('p:has-text("Dashboard")')).toBeVisible();
    
    // Verify Settings menu is visible
    await expect(page.locator('p:has-text("Settings")')).toBeVisible();
    
    // Navigate to Users tab in Settings - the page already shows Practice Settings
    // Click on Users tab
    await page.click('button[aria-controls="simple-tabpanel-2"]');
    
    // Wait for Users tab content to load
    await page.waitForLoadState('networkidle');
    
    // Verify Users tab is selected
    await expect(page.locator('button[aria-controls="simple-tabpanel-2"]')).toHaveAttribute('aria-selected', 'true');
    
    // Verify we are on the Users tab by checking if the button is selected
    const usersTab = page.locator('button[aria-controls="simple-tabpanel-2"]');
    await expect(usersTab).toHaveClass(/Mui-selected/);
    
    // Take screenshot for verification
    await page.screenshot({ 
      path: 'test-results/users_tab_verification.png',
      fullPage: true 
    });
    
    console.log('Test completed successfully: User logged in and navigated to Users tab in Settings');
  });

  test.beforeEach(async ({ page }) => {
    // Set viewport size
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    // Set timeout for individual actions
    page.setDefaultTimeout(30000);
  });

});

// Alternative version with more explicit waits and error handling
test.describe('Login and Navigate to Users Tab - Robust Version', () => {
  
  test('Robust login and navigation to Users tab', async ({ page }) => {
    try {
      // Navigate to login page
      await page.goto('https://qa.practiceeasily.com/auth/login', { 
        waitUntil: 'networkidle',
        timeout: 60000 
      });
      
      // Wait for login form to be visible
      await page.waitForSelector('input[type="email"], input[name="email"]', { timeout: 10000 });
      
      // Fill credentials
      await page.locator('input[type="email"], input[name="email"]').fill('bhavna.adhav+13@thinkitive.com');
      await page.locator('input[type="password"], input[name="password"]').fill('Pass@123');
      
      // Click login and wait for navigation
      await Promise.all([
        page.waitForLoadState('networkidle'),
        page.click('button[type="submit"], input[type="submit"], button:has-text("Login")')
      ]);
      
      // Verify login success
      await page.waitForSelector('p:has-text("Dashboard")', { timeout: 10000 });
      await expect(page.locator('p:has-text("Dashboard")')).toBeVisible();
      
      // Verify Settings section is visible
      await page.waitForSelector('p:has-text("Settings")', { timeout: 5000 });
      
      // The page automatically loads Practice Settings, now click Users tab
      await page.waitForSelector('button[aria-controls="simple-tabpanel-2"]', { timeout: 10000 });
      await page.click('button[aria-controls="simple-tabpanel-2"]');
      
      // Verify Users tab is active
      await expect(page.locator('button[aria-controls="simple-tabpanel-2"]')).toHaveAttribute('aria-selected', 'true');
      
      console.log('✅ Test passed: Successfully logged in and navigated to Users tab');
      
    } catch (error) {
      console.error('❌ Test failed:', error);
      
      // Take screenshot on failure for debugging
      await page.screenshot({ 
        path: `test-results/failure-${Date.now()}.png`,
        fullPage: true 
      });
      
      throw error;
    }
  });
  
});
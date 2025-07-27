import { test, expect, Page } from '@playwright/test';

test.describe('User Management Tests', () => {
  test('Login and Navigate to Users tab in Settings Menu', async ({ page }) => {
    // Navigate to login page
    await page.goto('https://qa.practiceeasily.com/auth/login');
    await expect(page).toHaveURL(/.*login/);

    // Login with credentials
    await page.fill('input[type="email"], input[name="email"], [placeholder*="email" i]', 'bhavna.adhav+13@thinkitive.com');
    await page.fill('input[type="password"], input[name="password"], [placeholder*="password" i]', 'Pass@123');
    
    // Click login button
    await page.click('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")');
    
    // Wait for successful login - expect to be redirected away from login page
    await page.waitForURL('**/!(login)**');
    await page.waitForTimeout(3000); // Allow page to fully load

    // Navigate to Settings - we're already on settings page after login based on our test
    // The settings page should be visible with tabs
    await expect(page.locator('text=Practice Settings')).toBeVisible();

    // Click on Users tab
    await page.click('button[role="tab"]:has-text("Users")');
    
    // Verify we're on the Users tab
    await expect(page.locator('button[role="tab"][aria-selected="true"]:has-text("Users")')).toBeVisible();

    // Click on "Add User" button
    await page.click('button:has-text("Add User")');
    
    // Wait for the add user form to appear
    await expect(page.locator('text=Add User')).toBeVisible();
    await page.waitForSelector('form');

    // Fill mandatory details
    // 1. First name: Sanu
    await page.fill('input[name="firstName"]', 'Sanu');
    
    // 2. Last name: Bhor
    await page.fill('input[name="lastName"]', 'Bhor');
    
    // 3. Role: Front office admin
    await page.click('[role="combobox"][aria-labelledby="mui-component-select-role"]');
    await page.waitForTimeout(1000); // Wait for dropdown to open
    await page.click('li:has-text("Front Office Admin"), [role="option"]:has-text("Front Office Admin")');
    
    // Close dropdown by pressing Escape (as requested in requirements)
    await page.keyboard.press('Escape');
    
    // 4. Email id: rutuja.dumbre+39@thinkitive.com
    await page.fill('input[name="emailId"]', 'rutuja.dumbre+39@thinkitive.com');
    
    // 5. Contact number: (788) 956-4534
    await page.fill('input[type="tel"]', '+1 (788) 956-4534');
    
    // Note: NPI number field was not present in the form for Front Office Admin role
    // This might be role-specific or appear in a different form step
    
    // Click Save
    await page.click('button[type="submit"]:has-text("Save")');
    
    // Wait for the form to close and the user to be created
    await page.waitForTimeout(3000);
    
    // Verify user is created - check if the user appears in the users table
    await expect(page.locator('text=Sanu Bhor')).toBeVisible();
    await expect(page.locator('text=rutuja.dumbre+39@thinkitive.com')).toBeVisible();
    await expect(page.locator('text=+1 (788)-956-4534')).toBeVisible();
    await expect(page.locator('text=Front Office Admin')).toBeVisible();
    
    // Verify the user status is "Invited"
    const userRow = page.locator('tr:has-text("Sanu Bhor")');
    await expect(userRow.locator('text=Invited')).toBeVisible();
    
    console.log('✅ Test completed successfully!');
    console.log('📧 User created: Sanu Bhor (rutuja.dumbre+39@thinkitive.com)');
    console.log('📱 Contact: +1 (788)-956-4534');
    console.log('👤 Role: Front Office Admin');
    console.log('📋 Status: Invited');
  });
});

// Alternative test with additional error handling and detailed verification
test.describe('User Management Tests - Extended', () => {
  test('Login and Create User with Enhanced Verification', async ({ page }) => {
    // Test configuration
    const testData = {
      email: 'bhavna.adhav+13@thinkitive.com',
      password: 'Pass@123',
      firstName: 'Sanu',
      lastName: 'Bhor',
      role: 'Front Office Admin',
      userEmail: 'rutuja.dumbre+39@thinkitive.com',
      contactNumber: '+1 (788) 956-4534',
      npiNumber: '7058625609' // Note: This field might not be available for all roles
    };

    try {
      // Navigate and login
      await page.goto('https://qa.practiceeasily.com/auth/login');
      
      // Fill login credentials
      await page.fill('input[type="email"], input[name="email"]', testData.email);
      await page.fill('input[type="password"], input[name="password"]', testData.password);
      
      // Submit login form
      await Promise.all([
        page.waitForURL('**/!(login)**'),
        page.click('button[type="submit"], button:has-text("Login")')
      ]);

      // Navigate to Users section
      await page.click('button[role="tab"]:has-text("Users")');
      
      // Store initial user count for verification
      const initialUserRows = await page.locator('tbody tr').count();
      
      // Open Add User form
      await page.click('button:has-text("Add User")');
      await page.waitForSelector('form');

      // Fill user details
      await page.fill('input[name="firstName"]', testData.firstName);
      await page.fill('input[name="lastName"]', testData.lastName);
      
      // Select role
      await page.click('[role="combobox"][aria-labelledby="mui-component-select-role"]');
      await page.click(`li:has-text("${testData.role}")`);
      await page.keyboard.press('Escape');
      
      await page.fill('input[name="emailId"]', testData.userEmail);
      await page.fill('input[type="tel"]', testData.contactNumber);

      // Submit form
      await page.click('button[type="submit"]:has-text("Save")');
      
      // Wait for form to close and user to be added
      await page.waitForTimeout(3000);
      
      // Verify new user count
      const finalUserRows = await page.locator('tbody tr').count();
      expect(finalUserRows).toBeGreaterThan(initialUserRows);
      
      // Verify user details in the table
      const newUserRow = page.locator(`tr:has-text("${testData.firstName} ${testData.lastName}")`);
      await expect(newUserRow).toBeVisible();
      await expect(newUserRow.locator(`text=${testData.userEmail}`)).toBeVisible();
      await expect(newUserRow.locator('text=Invited')).toBeVisible();
      
      console.log('🎉 User creation test passed with all verifications!');
      
    } catch (error) {
      console.error('❌ Test failed:', error);
      await page.screenshot({ path: 'test-failure-screenshot.png', fullPage: true });
      throw error;
    }
  });
});
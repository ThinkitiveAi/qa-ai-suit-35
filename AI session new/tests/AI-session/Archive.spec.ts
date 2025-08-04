import { test, expect } from '@playwright/test';

test.describe('User Archive and Restore Tests', () => {
  
  // Helper function for login
  async function loginToApplication(page) {
    await page.goto('https://qa.practiceeasily.com/auth/login');
    await page.fill('input[type="email"], input[name="email"]', 'bhavna.adhav+13@thinkitive.com');
    await page.fill('input[type="password"], input[name="password"]', 'Pass@123');
    await page.click('button[type="submit"], button:has-text("Login")');
    await page.waitForURL('**/!(login)**');
    await page.waitForTimeout(3000);
    await page.click('button[role="tab"]:has-text("Users")');
  }

  test('Archive User', async ({ page }) => {
    // Login and navigate to Users tab
    await loginToApplication(page);
    
    // Search for the user to archive (assuming user "Snehal Bhor" exists)
    await page.fill('input[placeholder="Search User"]', 'Snehal');
    await page.waitForTimeout(2000);
    
    // Verify user exists in active list before archiving
    await expect(page.locator('text=Snehal Bhor')).toBeVisible();
    console.log('📋 User found in active users list');
    
    // Click on three dots (action menu) for the user
    await page.click('tr:has-text("Snehal Bhor") button[aria-label="more"], tr:has-text("Snehal Bhor") button:has([data-testid="MoreVertIcon"])');
    await page.waitForTimeout(1000);
    
    // Click Archive option
    await page.click('li:has-text("Archive"), [role="menuitem"]:has-text("Archive")');
    await page.waitForTimeout(3000);
    
    console.log('✅ Archive action completed');
    
    // Verify user is no longer in active list
    await page.fill('input[placeholder="Search User"]', 'Snehal');
    await page.waitForTimeout(2000);
    
    // User should not be visible in active list anymore
    await expect(page.locator('text=Snehal Bhor')).not.toBeVisible();
    console.log('✅ User removed from active users list');
    
    // Switch to Archive filter to verify user is archived
    await page.fill('input[placeholder="Search User"]', ''); // Clear search
    await page.click('[role="combobox"], .MuiSelect-select');
    await page.waitForTimeout(1000);
    await page.click('li:has-text("Archive"), [role="option"]:has-text("Archive")');
    await page.waitForTimeout(2000);
    
    // Search for archived user
    await page.fill('input[placeholder="Search User"]', 'Snehal');
    await page.waitForTimeout(2000);
    
    // Verify user appears in archived list
    await expect(page.locator('text=Snehal Bhor')).toBeVisible();
    await expect(page.locator('text=rutuja.dumbre+39@thinkitive.com')).toBeVisible();
    
    console.log('✅ User successfully archived and verified in archived list');
    console.log('📊 Archive Test Summary:');
    console.log('   - User: Snehal Bhor');
    console.log('   - Email: rutuja.dumbre+39@thinkitive.com');
    console.log('   - Status: Archived ✓');
  });

  test('Restore Archived User', async ({ page }) => {
    // Login and navigate to Users tab
    await loginToApplication(page);
    
    // Switch to Archive filter to find archived user
    await page.click('[role="combobox"], .MuiSelect-select');
    await page.waitForTimeout(1000);
    await page.click('li:has-text("Archive"), [role="option"]:has-text("Archive")');
    await page.waitForTimeout(2000);
    
    // Search for archived user
    await page.fill('input[placeholder="Search User"]', 'Snehal');
    await page.waitForTimeout(2000);
    
    // Verify user exists in archived list before restoring
    await expect(page.locator('text=Snehal Bhor')).toBeVisible();
    console.log('📋 User found in archived users list');
    
    // Click on three dots (action menu) for the archived user
    await page.click('tr:has-text("Snehal Bhor") button[aria-label="more"], tr:has-text("Snehal Bhor") button:has([data-testid="MoreVertIcon"])');
    await page.waitForTimeout(1000);
    
    // Click Restore option (this unarchives the user)
    await page.click('li:has-text("Restore"), [role="menuitem"]:has-text("Restore")');
    await page.waitForTimeout(3000);
    
    console.log('✅ Restore action completed');
    
    // Verify user is no longer in archived list
    await page.fill('input[placeholder="Search User"]', 'Snehal');
    await page.waitForTimeout(2000);
    
    // User should not be visible in archived list anymore
    await expect(page.locator('text=Snehal Bhor')).not.toBeVisible();
    console.log('✅ User removed from archived users list');
    
    // Switch back to All filter to verify user is restored
    await page.fill('input[placeholder="Search User"]', ''); // Clear search
    await page.click('[role="combobox"], .MuiSelect-select');
    await page.waitForTimeout(1000);
    await page.click('li:has-text("All"), [role="option"]:has-text("All")');
    await page.waitForTimeout(2000);
    
    // Search for restored user
    await page.fill('input[placeholder="Search User"]', 'Snehal');
    await page.waitForTimeout(2000);
    
    // Verify user is back in active list
    await expect(page.locator('text=Snehal Bhor')).toBeVisible();
    await expect(page.locator('text=rutuja.dumbre+39@thinkitive.com')).toBeVisible();
    await expect(page.locator('text=Front Office Admin')).toBeVisible();
    await expect(page.locator('text=Invited')).toBeVisible();
    
    console.log('✅ User successfully restored and verified in active users list');
    console.log('📊 Restore Test Summary:');
    console.log('   - User: Snehal Bhor');
    console.log('   - Email: rutuja.dumbre+39@thinkitive.com');
    console.log('   - Role: Front Office Admin');
    console.log('   - Status: Active (Restored) ✓');
  });

  test('Complete Archive and Restore Cycle', async ({ page }) => {
    // This test performs both archive and restore in one flow
    
    // Login and navigate to Users tab
    await loginToApplication(page);
    
    // PHASE 1: ARCHIVE USER
    console.log('🔄 Starting Archive Phase...');
    
    // Search for active user
    await page.fill('input[placeholder="Search User"]', 'Snehal');
    await page.waitForTimeout(2000);
    
    // Verify user is in active list
    await expect(page.locator('text=Snehal Bhor')).toBeVisible();
    
    // Archive the user
    await page.click('tr:has-text("Snehal Bhor") button[aria-label="more"]');
    await page.waitForTimeout(1000);
    await page.click('li:has-text("Archive")');
    await page.waitForTimeout(3000);
    
    // Verify archiving was successful
    await page.fill('input[placeholder="Search User"]', '');
    await page.click('[role="combobox"], .MuiSelect-select');
    await page.waitForTimeout(1000);
    await page.click('li:has-text("Archive")');
    await page.waitForTimeout(2000);
    await page.fill('input[placeholder="Search User"]', 'Snehal');
    await page.waitForTimeout(2000);
    
    await expect(page.locator('text=Snehal Bhor')).toBeVisible();
    console.log('✅ Phase 1 Complete: User successfully archived');
    
    // PHASE 2: RESTORE USER
    console.log('🔄 Starting Restore Phase...');
    
    // Restore the archived user
    await page.click('tr:has-text("Snehal Bhor") button[aria-label="more"]');
    await page.waitForTimeout(1000);
    await page.click('li:has-text("Restore")');
    await page.waitForTimeout(3000);
    
    // Verify restoration was successful
    await page.fill('input[placeholder="Search User"]', '');
    await page.click('[role="combobox"], .MuiSelect-select');
    await page.waitForTimeout(1000);
    await page.click('li:has-text("All")');
    await page.waitForTimeout(2000);
    await page.fill('input[placeholder="Search User"]', 'Snehal');
    await page.waitForTimeout(2000);
    
    await expect(page.locator('text=Snehal Bhor')).toBeVisible();
    await expect(page.locator('text=rutuja.dumbre+39@thinkitive.com')).toBeVisible();
    
    console.log('✅ Phase 2 Complete: User successfully restored');
    console.log('🎉 Complete Archive/Restore Cycle Finished Successfully!');
    console.log('📋 Final Status: User is active and all data preserved');
  });

  test('Archive Multiple Users and Restore Specific User', async ({ page }) => {
    // This test demonstrates working with multiple users
    
    await loginToApplication(page);
    
    const usersToTest = ['Snehal', 'Test']; // Add more users as needed
    
    console.log('🔄 Testing archive/restore with multiple users...');
    
    for (const userName of usersToTest) {
      console.log(`\n📋 Processing user: ${userName}`);
      
      // Search for user
      await page.fill('input[placeholder="Search User"]', userName);
      await page.waitForTimeout(2000);
      
      // Check if user exists in active list
      const userExists = await page.locator(`text*="${userName}"`).isVisible();
      
      if (userExists) {
        // Archive user
        await page.click(`tr:has-text("${userName}") button[aria-label="more"]`);
        await page.waitForTimeout(1000);
        
        const archiveButton = await page.locator('li:has-text("Archive")').isVisible();
        if (archiveButton) {
          await page.click('li:has-text("Archive")');
          await page.waitForTimeout(2000);
          console.log(`   ✅ ${userName} archived successfully`);
        } else {
          console.log(`   ⚠️ Archive option not available for ${userName}`);
        }
      } else {
        console.log(`   ⚠️ User ${userName} not found in active list`);
      }
      
      // Clear search for next iteration
      await page.fill('input[placeholder="Search User"]', '');
      await page.waitForTimeout(1000);
    }
    
    // Now restore a specific user (Snehal)
    console.log('\n🔄 Restoring specific user: Snehal');
    
    // Switch to archived view
    await page.click('[role="combobox"], .MuiSelect-select');
    await page.waitForTimeout(1000);
    await page.click('li:has-text("Archive")');
    await page.waitForTimeout(2000);
    
    // Find and restore Snehal
    await page.fill('input[placeholder="Search User"]', 'Snehal');
    await page.waitForTimeout(2000);
    
    const snehalExists = await page.locator('text=Snehal').isVisible();
    if (snehalExists) {
      await page.click('tr:has-text("Snehal") button[aria-label="more"]');
      await page.waitForTimeout(1000);
      await page.click('li:has-text("Restore")');
      await page.waitForTimeout(3000);
      console.log('   ✅ Snehal restored successfully');
      
      // Verify restoration
      await page.fill('input[placeholder="Search User"]', '');
      await page.click('[role="combobox"], .MuiSelect-select');
      await page.waitForTimeout(1000);
      await page.click('li:has-text("All")');
      await page.waitForTimeout(2000);
      await page.fill('input[placeholder="Search User"]', 'Snehal');
      await page.waitForTimeout(2000);
      
      await expect(page.locator('text=Snehal')).toBeVisible();
      console.log('   ✅ Snehal verified in active users list');
    }
    
    console.log('\n🎉 Multi-user archive/restore test completed!');
  });
});
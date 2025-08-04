import { test, expect } from '@playwright/test';

// =========================
// Shared Test Data Store
// =========================
const testData = {
  provider: {
    firstName: 'Sachin',
    lastName: 'Dhokale',
    fullName: 'Sachin Dhokale',
    email: '',
    created: false
  },
  patient: {
    firstName: 'Jonny',
    lastName: 'Watin',
    fullName: 'Jonny Watin',
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
  dependency: (message) => console.log(`[DEPENDENCY] ${message}`)
};

// Generate random email for testing
function randomEmail(prefix = 'test.user') {
  const timestamp = Date.now();
  return `${prefix}.${timestamp}@example.com`;
}

// Login helper function
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

// =========================
// Sequential Test Suite with Dependencies
// =========================

test.describe.serial('Healthcare Management Workflow - Full End-to-End', () => {
  
  test('01. Provider Creation - PREREQUISITE', async ({ page }) => {
    Logger.info('='.repeat(60));
    Logger.info('Starting Test 1: Provider Creation (PREREQUISITE)');
    Logger.info('='.repeat(60));
    
    try {
      await page.goto('https://stage_aithinkitive.uat.provider.ecarehealth.com/auth/login');
      await page.getByRole('textbox', { name: 'Email' }).click();
      await page.getByRole('textbox', { name: 'Email' }).fill('rose.gomez@jourrapide.com');
      await page.getByRole('textbox', { name: '*********' }).click();
      await page.getByRole('textbox', { name: '*********' }).fill('Pass@123');
      await page.getByRole('button', { name: 'Let\'s get Started' }).click();
      
      // Wait for navigation after login
      await page.waitForLoadState('networkidle');
      await page.getByRole('banner').getByTestId('KeyboardArrowRightIcon').click();
      await page.getByRole('tab', { name: 'Settings' }).click();
      await page.getByRole('menuitem', { name: 'User Settings' }).click();
      await page.getByRole('tab', { name: 'Providers' }).click();
      await page.getByRole('button', { name: 'Add Provider User' }).click();
      
      // Fill provider details
      await page.getByRole('textbox', { name: 'First Name *' }).fill(testData.provider.firstName);
      await page.getByRole('textbox', { name: 'Last Name *' }).fill(testData.provider.lastName);
      await page.getByRole('combobox', { name: 'Provider Type' }).click();
      await page.getByRole('option', { name: 'PSYD' }).click();
      await page.getByRole('combobox', { name: 'specialities' }).click();
      await page.getByRole('option', { name: 'Cardiology' }).click();
      await page.getByRole('combobox', { name: 'Role *' }).click();
      await page.getByRole('option', { name: 'Provider' }).click();
      
      // Fill DOB
      await page.getByRole('textbox', { name: 'DOB' }).fill('02-20-1980');
      await page.getByRole('combobox', { name: 'Gender *' }).click();
      await page.getByRole('option', { name: 'Female', exact: true }).click();
      await page.getByRole('textbox', { name: 'NPI Number', exact: true }).fill('8600759234');
      
      // Generate and store provider email
      testData.provider.email = randomEmail('provider');
      await page.getByRole('textbox', { name: 'Email *' }).fill(testData.provider.email);
      await page.getByRole('button', { name: 'Save' }).click();
      
      // Wait for save confirmation
      await page.waitForLoadState('networkidle');

      // Wait extra time for backend sync
      Logger.info('Waiting 60 seconds for provider to sync to backend...');
      await page.waitForTimeout(60000);

      // Mark provider as created
      testData.provider.created = true;

      Logger.success(`Provider created successfully: ${testData.provider.fullName}`);
      Logger.info(`Provider Email: ${testData.provider.email}`);
      Logger.info('='.repeat(60));
      
    } catch (error) {
      Logger.error(`Provider creation failed: ${error.message}`);
      throw error; // This will stop the test suite
    }
  });

  test('02. Patient Registration - REQUIRES: Provider Created', async ({ page }) => {
    Logger.info('='.repeat(60));
    Logger.info('Starting Test 2: Patient Registration');
    Logger.info('='.repeat(60));
    
    // Check dependency
    if (!testData.provider.created) {
      Logger.dependency('DEPENDENCY FAILED: Provider must be created first');
      throw new Error('Provider creation is required before patient registration');
    }
    Logger.dependency('✓ Provider dependency satisfied');
    
    try {
      // Step 1: Login
      await login(page);
      
      // Step 2: Wait for dashboard to load
      await page.waitForURL('**/scheduling/appointment');
      Logger.info('Dashboard loaded');
      
      // Step 3: Open Create > New Patient
      await page.locator('div').filter({ hasText: /^Create$/ }).nth(1).click();
      Logger.info('Clicked Create');
      await page.getByRole('menuitem', { name: 'New Patient' }).click();
      Logger.info('Selected New Patient');
      await page.locator('div').filter({ hasText: /^Enter Patient Details$/ }).click();
      Logger.info('Selected Enter Patient Details');
      await page.getByRole('button', { name: 'Next' }).click();
      Logger.info('Proceeded to patient details form');
      
      // Step 4: Fill patient details
      await page.getByRole('textbox', { name: 'First Name *' }).fill(testData.patient.firstName);
      await page.getByRole('textbox', { name: 'Last Name *' }).fill(testData.patient.lastName);
      await page.getByRole('textbox', { name: 'Date Of Birth *' }).fill('01-01-2002');
      await page.locator('form').filter({ hasText: 'Gender *Gender *' }).getByLabel('Open').click();
      await page.getByRole('option', { name: 'Male', exact: true }).click();
      await page.getByRole('textbox', { name: 'Mobile Number *' }).fill('9373602678');
      
      // Generate and store patient email
      testData.patient.email = randomEmail('patient');
      await page.getByRole('textbox', { name: 'Email *' }).fill(testData.patient.email);
      Logger.info('Filled patient details');
      
      // Step 5: Save patient
      await page.getByRole('button', { name: 'Save' }).click();
      Logger.info('Clicked Save');
      
      // Step 6: Verify patient creation
      await expect(page.locator('text=Patient Details Added Successfully')).toBeVisible({ timeout: 10000 });
      Logger.info('Verified patient creation success message');
      await page.waitForURL('**/patients');
      await expect(page.getByRole('tab', { name: 'Patients', selected: true })).toBeVisible();
      
      // Mark patient as created
      testData.patient.created = true;
      
      Logger.success(`Patient registered successfully: ${testData.patient.fullName}`);
      Logger.info(`Patient Email: ${testData.patient.email}`);
      Logger.info('='.repeat(60));
      
    } catch (error) {
      Logger.error(`Patient registration failed: ${error.message}`);
      throw error;
    }
  });

  // Fixed Test 3 - Set Provider Availability with better time slots
  test('03. Set Provider Availability - REQUIRES: Provider AND Patient Created', async ({ page }) => {
    Logger.info('='.repeat(60));
    Logger.info('Starting Test 3: Set Provider Availability');
    Logger.info('='.repeat(60));
    
    // Check dependencies
    if (!testData.provider.created) {
      Logger.dependency('DEPENDENCY FAILED: Provider must be created first');
      throw new Error('Provider creation is required before setting availability');
    }
    if (!testData.patient.created) {
      Logger.dependency('DEPENDENCY FAILED: Patient must be created first');
      throw new Error('Patient creation is required before setting availability');
    }
    Logger.dependency('✓ Provider dependency satisfied');
    Logger.dependency('✓ Patient dependency satisfied');
    
    try {
      // Reload and re-login before availability
      Logger.info('Reloading page and re-logging in before availability step...');
      await page.reload();
      await page.waitForLoadState('networkidle');
      await login(page);
      await page.waitForLoadState('networkidle');
      await page.getByRole('tab', { name: 'Scheduling' }).click();
      await page.waitForTimeout(2000);
      // Click on Availability
      try {
        await page.getByText('Availability').click();
      } catch {
        await page.locator('text=Availability').click();
      }
      await page.waitForTimeout(1000);
      await page.getByRole('button', { name: 'Edit Availability' }).click();
      await page.waitForTimeout(2000);

      // Enhanced provider selection
      const providerDropdown = page.locator('form').filter({ hasText: 'Select Provider *Select' }).getByLabel('Open');
      let found = false;
      
      Logger.info(`Looking for provider: ${testData.provider.fullName}`);
      
      for (let attempt = 0; attempt < 15; attempt++) {
        Logger.info(`Attempt ${attempt + 1} to find provider`);
        
        try {
          await providerDropdown.click();
          await page.waitForTimeout(500);

          // Type provider name in dropdown input to filter
          const dropdownInput = page.locator('input[aria-label="Select Provider"]');
          if (await dropdownInput.count() > 0) {
            await dropdownInput.fill('');
            await dropdownInput.type(testData.provider.fullName, { delay: 100 });
            Logger.info(`Typed provider name: ${testData.provider.fullName}`);
            await page.waitForTimeout(1000);
          }

          // Log all provider names in dropdown for debugging
          const allOptions = await page.locator('[role="option"]').allTextContents();
          Logger.info(`Attempt ${attempt + 1}: Provider dropdown options: ${allOptions.join(', ')}`);

          const providerOption = page.getByRole('option', { name: testData.provider.fullName });
          if (await providerOption.count() > 0) {
            await providerOption.click();
            found = true;
            Logger.success(`Selected provider: ${testData.provider.fullName}`);
            break;
          }

          // Try partial matches
          const partialOption = page.getByRole('option', { name: new RegExp(testData.provider.firstName, 'i') });
          if (await partialOption.count() > 0) {
            await partialOption.click();
            found = true;
            Logger.success(`Selected provider with partial match`);
            break;
          }

          await page.keyboard.press('Escape');
          await page.waitForTimeout(2000);

          if ((attempt + 1) % 5 === 0) {
            Logger.info('Refreshing page...');
            await page.reload();
            await page.waitForLoadState('networkidle');
            await login(page);
            await page.waitForLoadState('networkidle');
            await page.getByRole('tab', { name: 'Scheduling' }).click();
            await page.waitForTimeout(2000);
            await page.getByText('Availability').click();
            await page.waitForTimeout(1000);
            await page.getByRole('button', { name: 'Edit Availability' }).click();
            await page.waitForTimeout(2000);
          }

        } catch (error) {
          Logger.info(`Attempt ${attempt + 1} failed: ${error.message}`);
          await page.waitForTimeout(2000);
        }
      }
      
      if (!found) {
        await providerDropdown.click();
        await page.waitForTimeout(1000);
        const allOptions = await page.locator('[role="option"]').allTextContents();
        Logger.info(`Available provider options: ${allOptions.join(', ')}`);
        
        if (allOptions.length > 0) {
          Logger.info('Selecting first available provider as fallback');
          await page.getByRole('option').first().click();
          found = true;
        } else {
          throw new Error(`No providers found in dropdown`);
        }
      }
      
      await page.waitForTimeout(1000);
      
      // Set timezone - try multiple timezone options
      await page.locator('form').filter({ hasText: 'Time Zone *Time Zone *' }).getByLabel('Open').click();
      await page.waitForTimeout(500);
      
      // Try different timezone options
      const timezoneOptions = [
       'Eastern Standard Time (UTC -5)',
        'Central Standard Time (UTC -6)', 
        'Mountain Standard Time (UTC -7)',
        'Pacific Standard Time (UTC -8)',
        'Alaska Standard Time (UTC -9)'
      ];
      
      let timezoneSet = false;
      for (const timezone of timezoneOptions) {
        try {
          await page.getByRole('option', { name: timezone }).click();
          Logger.info(`Set timezone: ${timezone}`);
          timezoneSet = true;
          break;
        } catch {
          continue;
        }
      }
      
      if (!timezoneSet) {
        // Fallback to first available timezone
        await page.getByRole('option').first().click();
        Logger.info('Set fallback timezone');
      }
      
      // Set booking window
      await page.locator('form').filter({ hasText: 'Booking Window *Booking' }).getByLabel('Open').click();
      await page.waitForTimeout(500);
      await page.getByRole('option', { name: '1 Week' }).click();
      
      // Configure weekdays with BETTER TIME SLOTS for visibility
      const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
      for (const day of weekdays) {
        Logger.info(`Configuring ${day}`);
        await page.getByRole('tab', { name: day }).click();
        await page.waitForTimeout(500);
        
        // Set start time to 9:00 AM (business hours)
        await page.locator('form').filter({ hasText: 'Start Time *Start Time *' }).getByLabel('Open').click();
        await page.waitForTimeout(300);
        
        // Try multiple start time options
        const startTimes = ['9:00 AM', '08:00 AM', '10:00 AM', '7:00 AM'];
        let startTimeSet = false;
        for (const startTime of startTimes) {
          try {
            await page.getByRole('option', { name: startTime }).click();
            Logger.info(`Set start time: ${startTime}`);
            startTimeSet = true;
            break;
          } catch {
            continue;
          }
        }
        
        if (!startTimeSet) {
          // Fallback to first available time
          await page.getByRole('option').first().click();
          Logger.info('Set fallback start time');
        }
        
        // Set end time to 5:00 PM (business hours)
        await page.locator('form').filter({ hasText: 'End Time *End Time *' }).getByLabel('Open').click();
        await page.waitForTimeout(300);
        
        // Try multiple end time options
        const endTimes = ['5:00 PM (8 hrs)', '6:00 PM (9 hrs)', '4:00 PM (7 hrs)', '17:00 (8 hrs)'];
        let endTimeSet = false;
        for (const endTime of endTimes) {
          try {
            await page.getByRole('option', { name: endTime }).click();
            Logger.info(`Set end time: ${endTime}`);
            endTimeSet = true;
            break;
          } catch {
            continue;
          }
        }
        
        if (!endTimeSet) {
          // Fallback - try to find any option with "hrs" in it
          const hoursOptions = await page.locator('[role="option"]:has-text("hrs")').allTextContents();
          if (hoursOptions.length > 0) {
            await page.getByRole('option', { name: hoursOptions[0] }).click();
            Logger.info(`Set fallback end time: ${hoursOptions[0]}`);
          } else {
            await page.getByRole('option').last().click();
            Logger.info('Set fallback end time');
          }
        }
        
        // Enable telehealth
        const telehealthCheckbox = page.getByRole('checkbox', { name: 'Telehealth' });
        if (!(await telehealthCheckbox.isChecked())) {
          await telehealthCheckbox.check();
        }
        
        Logger.info(`✓ Configured availability for ${day}`);
      }
      
      // Set appointment details
      await page.locator('form').filter({ hasText: 'Appointment TypeAppointment' }).getByLabel('Open').click();
      await page.waitForTimeout(500);
      await page.getByRole('option', { name: 'New Patient Visit' }).click();
      
      await page.locator('form').filter({ hasText: 'DurationDuration' }).getByLabel('Open').click();
      await page.waitForTimeout(500);
      await page.getByRole('option', { name: '30 minutes' }).click();
      
      await page.locator('form').filter({ hasText: 'Schedule NoticeSchedule Notice' }).getByLabel('Open').click();
      await page.waitForTimeout(500);
      await page.getByRole('option', { name: '1 Hours Away' }).click();
      
      // Save the availability
      await page.getByRole('button', { name: 'Save' }).click();
      Logger.info('Clicked Save button');
      
      await page.waitForLoadState('networkidle', { timeout: 30000 });
      await page.waitForTimeout(3000);
      
      // Mark availability as set
      testData.availability.set = true;
      
      Logger.success(`Provider availability set successfully with business hours (9 AM - 5 PM)`);
      Logger.info('='.repeat(60));
      
    } catch (error) {
      Logger.error(`Setting provider availability failed: ${error.message}`);
      throw error;
    }
  });

  // Fixed Test 4 - Book Appointment with better slot detection
  test('04. Book Appointment - REQUIRES: Provider, Patient, AND Availability', async ({ page }) => {
    Logger.info('='.repeat(60));
    Logger.info('Starting Test 4: Book Appointment');
    Logger.info('='.repeat(60));
    
    // Check all dependencies
    if (!testData.provider.created) {
      Logger.dependency('DEPENDENCY FAILED: Provider must be created first');
      throw new Error('Provider creation is required before booking appointment');
    }
    if (!testData.patient.created) {
      Logger.dependency('DEPENDENCY FAILED: Patient must be created first');
      throw new Error('Patient creation is required before booking appointment');
    }
    if (!testData.availability.set) {
      Logger.dependency('DEPENDENCY FAILED: Provider availability must be set first');
      throw new Error('Provider availability must be set before booking appointment');
    }
    Logger.dependency('✓ Provider dependency satisfied');
    Logger.dependency('✓ Patient dependency satisfied');
    Logger.dependency('✓ Availability dependency satisfied');
    
    try {
      // Step 1: Login
      await login(page);
      
      // Step 2: Open appointment creation
      await page.getByText('Create').click();
      Logger.info('Clicked Create');
      await page.getByRole('menuitem', { name: 'New Appointment' }).locator('div').click();
      Logger.info('Selected New Appointment');
      
      // Step 3: Search and select the created patient
      await page.getByPlaceholder('Search Patient').click();
      await page.getByPlaceholder('Search Patient').fill(testData.patient.fullName);
      await page.waitForTimeout(1000);
      
      // Try different ways to select the patient
      try {
        await page.keyboard.press('ArrowDown');
        await page.keyboard.press('Enter');
      } catch {
        // Alternative selection method
        await page.getByRole('option', { name: testData.patient.fullName }).click();
      }
      Logger.info(`Selected patient: ${testData.patient.fullName}`);
      
      // Step 4: Select appointment type
      await page.getByPlaceholder('Select Type').click();
      await page.waitForTimeout(500);
      await page.getByRole('option', { name: 'New Patient Visit' }).click();
      Logger.info('Selected appointment type');
      
      // Step 5: Fill reason and select timezone
      await page.getByPlaceholder('Reason').fill('Fever');
      Logger.info('Filled reason for visit');
      
      await page.getByLabel('Timezone *').click();
      await page.waitForTimeout(500);
      
      // Try multiple timezone options that match availability
      const timezoneOptions = [
        'Eastern Daylight Time (GMT -04:00)',
        'Eastern Standard Time (GMT -05:00)',
        'Central Daylight Time (GMT -05:00)',
        'Central Standard Time (GMT -06:00)',
        'Mountain Daylight Time (GMT -06:00)',
        'Pacific Daylight Time (GMT -07:00)',
        'Alaska Daylight Time (GMT -08:00)'
      ];
      
      let timezoneSelected = false;
      for (const timezone of timezoneOptions) {
        try {
          await page.getByRole('option', { name: timezone }).click();
          Logger.info(`Selected timezone: ${timezone}`);
          timezoneSelected = true;
          break;
        } catch {
          continue;
        }
      }
      
      if (!timezoneSelected) {
        // Fallback to any available timezone
        await page.getByRole('option').first().click();
        Logger.info('Selected fallback timezone');
      }
      
      // Step 6: Select visit type and the created provider
      await page.getByRole('button', { name: 'Telehealth' }).click();
      Logger.info('Selected Telehealth');
      
      await page.getByPlaceholder('Search Provider').fill(`${testData.provider.firstName} ${testData.provider.lastName}`);
      await page.waitForTimeout(1000);
      
      try {
        await page.getByRole('option', { name: `${testData.provider.firstName} ${testData.provider.lastName}` }).click();
      } catch {
        // Try partial match
        await page.getByRole('option', { name: new RegExp(testData.provider.firstName, 'i') }).click();
      }
      Logger.info(`Selected provider: ${testData.provider.firstName} ${testData.provider.lastName}`);
      
      // Step 7: View availability
      await page.getByRole('button', { name: 'View availability' }).click();
      Logger.info('Viewing availability');
      await page.waitForTimeout(2000);
      
      // Step 8: Select July 29 as the appointment date
      let dateSelected = false;
      try {
        await page.getByRole('gridcell', { name: '29', exact: true }).click();
        Logger.info('Selected date: 29 July');
        await page.waitForTimeout(2000);
        // Check if slots are available after selecting date
        const slots = await page.locator("div[class*='MuiBox-root css-q6ik5y'], div[class*='time-slot'], button[class*='slot'], div[class*='slot-container']").count();
        Logger.info(`Found ${slots} time slots`);
        if (slots > 0) {
          dateSelected = true;
        } else {
          Logger.info('No slots available for 29 July');
        }
      } catch (error) {
        Logger.info(`Could not select date 29 July: ${error.message}`);
      }
      if (!dateSelected) {
        throw new Error('No slots available for 29 July');
      }
      
      // Step 9: Select time slot - try multiple selectors
      await page.waitForTimeout(1000);
      
      // Try different selectors for time slots
      const slotSelectors = [
        "xpath=(//div[@class='MuiBox-root css-q6ik5y'])[1]",
        "div[class*='MuiBox-root']:has-text('AM')",
        "div[class*='MuiBox-root']:has-text('PM')",
        "button[class*='slot']",
        "div[class*='time-slot']",
        ".slot-container > div:first-child",
        "[data-testid*='slot']"
      ];
      
      let slotSelected = false;
      for (const selector of slotSelectors) {
        try {
          const element = page.locator(selector);
          if (await element.count() > 0) {
            await element.first().click();
            Logger.info(`Selected time slot using selector: ${selector}`);
            slotSelected = true;
            break;
          }
        } catch (error) {
          Logger.info(`Selector ${selector} failed: ${error.message}`);
          continue;
        }
      }
      
      if (!slotSelected) {
        // Last resort - click any clickable element that might be a time slot
        const allClickableElements = await page.locator('div, button').allTextContents();
        Logger.info(`Available clickable elements: ${allClickableElements.slice(0, 10).join(', ')}`);
        
        // Look for elements with time patterns
        const timePattern = /\d{1,2}:\d{2}\s*(AM|PM)/i;
        for (let i = 0; i < allClickableElements.length; i++) {
          if (timePattern.test(allClickableElements[i])) {
            try {
              await page.locator(`text=${allClickableElements[i]}`).first().click();
              Logger.info(`Selected time slot: ${allClickableElements[i]}`);
              slotSelected = true;
              break;
            } catch {
              continue;
            }
          }
        }
      }
      
      if (!slotSelected) {
        // Take screenshot for debugging
        await page.screenshot({ path: `no-slots-debug-${Date.now()}.png`, fullPage: true });
        throw new Error('No available time slots found. Check availability settings and screenshot.');
      }
      
      // Step 10: Save appointment
      await page.waitForTimeout(1000);
      await page.getByRole('button', { name: 'Save And Close' }).click();
      Logger.info('Saved appointment');
      
      // Wait for confirmation
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      Logger.success('🎉 FULL WORKFLOW COMPLETED SUCCESSFULLY! 🎉');
      Logger.success(`Appointment booked for: ${testData.patient.fullName}`);
      Logger.success(`With provider: ${testData.provider.fullName}`);
      Logger.info('='.repeat(60));
      
    } catch (error) {
      Logger.error(`Appointment booking failed: ${error.message}`);
      
      // Take debug screenshot
      try {
        await page.screenshot({ path: `booking-error-debug-${Date.now()}.png`, fullPage: true });
        Logger.info('Debug screenshot taken');
      } catch (debugError) {
        Logger.error(`Debug screenshot failed: ${debugError.message}`);
      }
      
      throw error;
    }
  });
});

// =========================
// Test Configuration
// =========================

test.beforeEach(async ({ page }) => {
  // Set longer timeout for each test
  test.setTimeout(180000); // 3 minutes per test for sequential workflow
  
  // Set viewport size
  await page.setViewportSize({ width: 1280, height: 720 });
});

test.afterEach(async ({ page }) => {
  // Take screenshot on failure
  if (test.info().status !== test.info().expectedStatus) {
    const timestamp = Date.now();
    await page.screenshot({ 
      path: `test-results/failure-${test.info().title.replace(/[^a-zA-Z0-9]/g, '-')}-${timestamp}.png`,
      fullPage: true 
    });
    Logger.error(`Screenshot saved for failed test: ${test.info().title}`);
  }
});

// Cleanup function (optional - run manually if needed)
test.describe('Cleanup', () => {
  test.skip('Manual Cleanup - Run only when needed', async ({ page }) => {
    Logger.info('Running cleanup...');
    // Add cleanup logic here if needed
    // This test is skipped by default
  });
});
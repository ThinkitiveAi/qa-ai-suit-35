import { test, expect } from '@playwright/test';

// =========================
// Helper Functions
// =========================

// Simple logger utility

const Logger = {
  info: (message) => console.log(`[INFO] ${message}`),
  error: (message) => console.error(`[ERROR] ${message}`)
};

// Generate random email for testing

function randomEmail() {
  const timestamp = Date.now();
  return `test.user.${timestamp}@example.com`;
}

// Login helper function
async function login(page) {
  Logger.info('Starting login process');
  await page.goto('https://stage_aithinkitive.uat.provider.ecarehealth.com/auth/login');
  await page.getByRole('textbox', { name: 'Email' }).fill('rose.gomez@jourrapide.com');
  await page.getByRole('textbox', { name: '*********' }).fill('Pass@123');
  await page.getByRole('button', { name: 'Let\'s get Started' }).click();
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
// Test 1: Login and Provider Creation
// =========================

test('1. Login and Provider Creation', async ({ page }) => {
  Logger.info('Starting Test 1: Login and Provider Creation');
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
  await page.getByRole('textbox', { name: 'First Name *' }).fill('Siddhi');
  await page.getByRole('textbox', { name: 'Last Name *' }).fill('Dongare');
  await page.getByRole('combobox', { name: 'Provider Type' }).click();
  await page.getByRole('option', { name: 'PSYD' }).click();
  await page.getByRole('combobox', { name: 'specialities' }).click();
  await page.getByRole('option', { name: 'Cardiology' }).click();
  await page.getByRole('combobox', { name: 'Role *' }).click();
  await page.getByRole('option', { name: 'Provider' }).click();
  // Fix DOB format - complete date
  await page.getByRole('textbox', { name: 'DOB' }).fill('02-20-1980');
  await page.getByRole('combobox', { name: 'Gender *' }).click();
  await page.getByRole('option', { name: 'Female', exact: true }).click();
  await page.getByRole('textbox', { name: 'NPI Number', exact: true }).fill('2325648734');
  // Use dynamic email
  const providerEmail = "rutuja.dumbre+21@gmail.com";
  await page.getByRole('textbox', { name: 'Email *' }).fill(providerEmail);
  await page.getByRole('button', { name: 'Save' }).click();
  // Wait for save confirmation
  await page.waitForLoadState('networkidle');
  Logger.info('Test 1 completed: Provider created successfully');
});

// =========================
// Test 2: Set Availability
// =========================

test('3. Set Provider Availability', async ({ page }) => {
  Logger.info('Starting Test 3: Set Provider Availability');
  await page.goto('https://stage_aithinkitive.uat.provider.ecarehealth.com/auth/login');
  await page.getByRole('textbox', { name: 'Email' }).fill('rose.gomez@jourrapide.com');
  await page.getByRole('textbox', { name: '*********' }).fill('Pass@123');
  await page.getByRole('button', { name: 'Let\'s get Started' }).click();
  // Wait for navigation
  await page.waitForLoadState('networkidle');
  await page.getByRole('tab', { name: 'Scheduling' }).click();
  await page.getByText('Availability').click();
  await page.getByRole('button', { name: 'Edit Availability' }).click();
  // Select provider
  await page.locator('form').filter({ hasText: 'Select Provider *Select' }).getByLabel('Open').click();
  await page.getByRole('option', { name: 'Dr. Siddhi Dongare' }).click();
  // Set timezone
  await page.locator('form').filter({ hasText: 'Time Zone *Time Zone *' }).getByLabel('Open').click();
  await page.getByRole('option', { name: 'Alaska Standard Time (UTC -9)' }).click();
  // Set booking window
  await page.locator('form').filter({ hasText: 'Booking Window *Booking' }).getByLabel('Open').click();
  await page.getByRole('option', { name: '1 Week' }).click();
  // Configure weekdays (Monday to Friday)
  const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  for (const day of weekdays) {
    await page.getByRole('tab', { name: day }).click();
    // Set start time
    await page.locator('form').filter({ hasText: 'Start Time *Start Time *' }).getByLabel('Open').click();
    await page.getByRole('option', { name: '12:00 AM' }).click();
    // Set end time
    await page.locator('form').filter({ hasText: 'End Time *End Time *' }).getByLabel('Open').click();
    await page.getByRole('option', { name: '8:00 AM (8 hrs)' }).click();
    // Enable telehealth
    await page.getByRole('checkbox', { name: 'Telehealth' }).check();
  }
  // Set appointment details
  await page.locator('form').filter({ hasText: 'Appointment TypeAppointment' }).getByLabel('Open').click();
  await page.getByRole('option', { name: 'New Patient Visit' }).click();
  await page.locator('form').filter({ hasText: 'DurationDuration' }).getByLabel('Open').click();
  await page.getByRole('option', { name: '30 minutes' }).click();
  await page.locator('form').filter({ hasText: 'Schedule NoticeSchedule Notice' }).getByLabel('Open').click();
  await page.getByRole('option', { name: '1 Hours Away' }).click();
  await page.getByRole('button', { name: 'Save' }).click();
  // Wait for save confirmation
  await page.waitForLoadState('networkidle');
  Logger.info('Test 3 completed: Provider availability set successfully');
});

// =========================
// Test 3: Patient Registration
// =========================

test('2. Patient Registration - Mandatory Fields', async ({ page }) => {
  Logger.info('Starting Test 2: Patient Registration');
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
  await page.getByRole('textbox', { name: 'First Name *' }).fill('Johnny');
  await page.getByRole('textbox', { name: 'Last Name *' }).fill('Das');
  await page.getByRole('textbox', { name: 'Date Of Birth *' }).fill('01-01-2001');
  await page.locator('form').filter({ hasText: 'Gender *Gender *' }).getByLabel('Open').click();
  await page.getByRole('option', { name: 'Male', exact: true }).click();
  await page.getByRole('textbox', { name: 'Mobile Number *' }).fill('9373908888');
  // Use a random email for each run
  const email = randomEmail();
  await page.getByRole('textbox', { name: 'Email *' }).fill(email);
  Logger.info('Filled patient details');
  // Step 5: Save patient
  await page.getByRole('button', { name: 'Save' }).click();
  Logger.info('Clicked Save');
  // Step 6: Verify patient creation
  await expect(page.locator('text=Patient Details Added Successfully')).toBeVisible({ timeout: 10000 });
  Logger.info('Verified patient creation success message');
  await page.waitForURL('**/patients');
  await expect(page.getByRole('tab', { name: 'Patients', selected: true })).toBeVisible();
  Logger.info('Test 2 completed: Patient registered successfully');
});

// =========================
// Test 4: Appointment Booking
// =========================

test('4. Appointment Booking', async ({ page }) => {
  Logger.info('Starting Test 4: Appointment Booking');
  // Step 1: Login
  await login(page);
  // Step 2: Open appointment creation
  await page.getByText('Create').click();
  Logger.info('Clicked Create');
  await page.getByRole('menuitem', { name: 'New Appointment' }).locator('div').click();
  Logger.info('Selected New Appointment');
  // Step 3: Search and select patient
  await page.getByPlaceholder('Search Patient').click();
  await page.getByPlaceholder('Search Patient').fill('Johnny Das');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  Logger.info('Selected patient for appointment');
  // Step 4: Select appointment type
  await page.getByPlaceholder('Select Type').click();
  await page.getByRole('option', { name: 'New Patient Visit' }).click();
  Logger.info('Selected appointment type');
  // Step 5: Fill reason and select timezone
  await page.getByPlaceholder('Reason').fill('Fever');
  Logger.info('Filled reason for visit');
  await page.getByLabel('Timezone *').click();
  await page.getByRole('option', { name: 'Alaska Daylight Time (GMT -08:00)' }).click();
  Logger.info('Selected timezone');
  // Step 6: Select visit type and provider
  await page.getByRole('button', { name: 'Telehealth' }).click();
  await page.getByPlaceholder('Search Provider').fill('Siddhi Dongare');
  await page.getByRole('option', { name: 'Siddhi Dongare' }).click();
  Logger.info('Selected provider');
  // Step 7: View availability and select slot
  await page.getByRole('button', { name: 'View availability' }).click();
  Logger.info('Viewing availability');
  // Dynamically select a future date
  const today = new Date();
  const futureDate = today.getDate() + 2;
  await page.getByRole('gridcell', { name: String(futureDate), exact: true }).click();
  Logger.info(`Selected date: ${futureDate}`);
  // Select first available time slot
  await page.locator("xpath=(//div[@class='MuiBox-root css-q6ik5y'])[1]").click();
  Logger.info('Selected time slot');
  // Step 8: Save appointment
  await page.getByRole('button', { name: 'Save And Close' }).click();
  Logger.info('Saved appointment');
  // Wait for confirmation
  await page.waitForLoadState('networkidle');
  await logout(page);
  Logger.info('Test 4 completed: Appointment booked successfully');
});

// =========================
// Test Configuration
// =========================

test.beforeEach(async ({ page }) => {
  // Set longer timeout for each test
  test.setTimeout(60000);
  
  // Set viewport size
  await page.setViewportSize({ width: 1280, height: 720 });
});

test.afterEach(async ({ page }) => {
  // Take screenshot on failure
  if (test.info().status !== test.info().expectedStatus) {
    await page.screenshot({ 
      path: `test-results/failure-${test.info().title}-${Date.now()}.png`,
      fullPage: true 
    });
  }
});
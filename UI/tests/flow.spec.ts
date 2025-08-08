import { test, expect } from '@playwright/test';

// Data generation functions
function generateRandomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateRandomDate(startYear: number = 1970, endYear: number = 2000): string {
  const year = generateRandomNumber(startYear, endYear);
  const month = generateRandomNumber(1, 12).toString().padStart(2, '0');
  const day = generateRandomNumber(1, 28).toString().padStart(2, '0');
  return `${month}-${day}-${year}`;
}

function generateRandomPhone(): string {
  const areaCode = generateRandomNumber(200, 999);
  const firstPart = generateRandomNumber(200, 999);
  const secondPart = generateRandomNumber(1000, 9999);
  return `(${areaCode}) ${firstPart}-${secondPart}`;
}

function generateRandomEmail(firstName: string, lastName: string): string {
  const domains = ['mailor.com', 'testmail.com', 'example.com', 'tempmail.com'];
  const domain = domains[Math.floor(Math.random() * domains.length)];
  const randomSuffix = generateRandomNumber(100, 999);
  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}${randomSuffix}@${domain}`;
}

function generateNPINumber(): string {
  return generateRandomNumber(1000000000, 9999999999).toString();
}

function generateProviderData() {
  const firstNames = ['Goal', 'Sarah', 'Michael', 'Jennifer', 'David', 'Lisa', 'Robert', 'Maria', 'John', 'Amanda'];
  const lastNames = ['Sol', 'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez'];
  
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  
  return {
    firstName,
    lastName,
    fullName: `${firstName} ${lastName}`,
    dateOfBirth: generateRandomDate(1970, 1990),
    npiNumber: generateNPINumber(),
    email: generateRandomEmail(firstName, lastName)
  };
}

function generatePatientData() {
  const firstNames = ['Shubhq', 'Alex', 'Taylor', 'Jordan', 'Casey', 'Morgan', 'Riley', 'Cameron', 'Skyler', 'Quinn'];
  const lastNames = ['Sing', 'Anderson', 'Thompson', 'White', 'Harris', 'Martin', 'Jackson', 'Clark', 'Lewis', 'Lee'];
  
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  
  return {
    firstName,
    lastName,
    fullName: `${firstName} ${lastName}`,
    dateOfBirth: generateRandomDate(1990, 2010),
    mobileNumber: generateRandomPhone(),
    email: generateRandomEmail(firstName, lastName)
  };
}

test('Complete Healthcare Provider Workflow with Dynamic Data', async ({ page }) => {
  // Generate dynamic test data
  const providerData = generateProviderData();
  const patientData = generatePatientData();
  
  console.log('Generated Provider Data:', providerData);
  console.log('Generated Patient Data:', patientData);

  // 1. Login to the application
  await page.goto('https://stage_aithinkitive.uat.provider.ecarehealth.com/auth/login');
  await page.getByRole('textbox', { name: 'Email' }).click();
  await page.getByRole('textbox', { name: 'Email' }).fill('rose.gomez@jourrapide.com');
  await page.getByRole('textbox', { name: '*********' }).click();
  await page.getByRole('textbox', { name: '*********' }).fill('Pass@123');
  await page.getByRole('button', { name: 'Let\'s get Started' }).click();

  // 2. Create Provider - Navigate to User Settings and add a new provider
  await page.getByRole('banner').getByTestId('KeyboardArrowRightIcon').click();
  await page.getByRole('tab', { name: 'Settings' }).click();
  await page.getByRole('menuitem', { name: 'User Settings' }).click();
  await page.getByRole('tab', { name: 'Providers' }).click();
  await page.getByRole('button', { name: 'Add Provider User' }).click();

  // Fill provider details with dynamic data
  await page.getByRole('textbox', { name: 'First Name *' }).click();
  await page.getByRole('textbox', { name: 'First Name *' }).fill(providerData.firstName);
  await page.getByRole('paragraph').filter({ hasText: 'Last Name' }).click();
  await page.getByRole('textbox', { name: 'Last Name *' }).fill(providerData.lastName);
  await page.getByRole('combobox', { name: 'Provider Type' }).click();
  await page.getByRole('option', { name: 'PSYD' }).click();
  await page.getByRole('combobox', { name: 'specialities' }).click();
  await page.getByRole('option', { name: 'Cardiology' }).click();
  await page.getByRole('combobox', { name: 'Role *' }).click();
  await page.getByRole('option', { name: 'Provider' }).click();
  await page.getByRole('textbox', { name: 'DOB' }).click();
  await page.getByRole('textbox', { name: 'DOB' }).fill(providerData.dateOfBirth);
  await page.getByRole('combobox', { name: 'Gender *' }).click();
  await page.getByRole('option', { name: 'Male', exact: true }).click();
  await page.getByRole('textbox', { name: 'NPI Number', exact: true }).click();
  await page.getByRole('textbox', { name: 'NPI Number', exact: true }).fill(providerData.npiNumber);
  await page.getByRole('textbox', { name: 'Email *' }).click();
  await page.getByRole('textbox', { name: 'Email *' }).fill(providerData.email);
  await page.getByRole('button', { name: 'Save' }).click();

  // 3. Set Availability - Navigate to Scheduling and set up availability
  await page.getByRole('tab', { name: 'Scheduling' }).click();
  await page.getByText('Availability').click();
  await page.getByRole('button', { name: 'Edit Availability' }).click();

  // Set provider and basic settings
  await page.locator('form').filter({ hasText: 'Select Provider *Select' }).getByLabel('Open').click();
  await page.getByRole('option', { name: providerData.fullName }).first().click();
  await page.locator('form').filter({ hasText: 'Time Zone *Time Zone *' }).getByLabel('Open').click();
  await page.getByRole('option', { name: 'Alaska Standard Time (UTC -9)' }).click();
  await page.locator('form').filter({ hasText: 'Booking Window *Booking' }).getByLabel('Open').click();
  await page.getByRole('option', { name: '1 Week' }).click();

  // Set Monday availability
  await page.getByRole('tab', { name: 'Monday' }).click();
  await page.locator('form').filter({ hasText: 'Start Time *Start Time *' }).getByLabel('Open').click();
  await page.getByRole('option', { name: '12:00 AM' }).click();
  await page.locator('form').filter({ hasText: 'End Time *End Time *' }).getByLabel('Open').click();
  await page.getByRole('option', { name: ':00 AM (8 hrs)' }).click();
  await page.getByRole('checkbox', { name: 'Telehealth' }).check();

  // Set Tuesday availability
  await page.getByRole('tab', { name: 'Tuesday' }).click();
  await page.locator('form').filter({ hasText: 'Start Time *Start Time *' }).getByLabel('Open').click();
  await page.getByRole('option', { name: '12:00 AM' }).click();
  await page.locator('form').filter({ hasText: 'End Time *End Time *' }).getByLabel('Open').click();
  await page.getByRole('option', { name: ':00 AM (8 hrs)' }).click();
  await page.getByRole('checkbox', { name: 'Telehealth' }).check();

  // Set Wednesday availability
  await page.getByRole('tab', { name: 'Wednesday' }).click();
  await page.locator('form').filter({ hasText: 'Start Time *Start Time *' }).getByLabel('Open').click();
  await page.getByRole('option', { name: '12:00 AM' }).click();
  await page.locator('form').filter({ hasText: 'End Time *End Time *' }).getByLabel('Open').click();
  await page.getByRole('option', { name: ':00 AM (8 hrs)' }).click();
  await page.getByRole('checkbox', { name: 'Telehealth' }).check();

  // Set Thursday availability
  await page.getByRole('tab', { name: 'Thursday' }).click();
  await page.locator('div').filter({ hasText: /^Start Time \*$/ }).nth(1).click();
  await page.getByRole('option', { name: '12:00 AM' }).click();
  await page.locator('form').filter({ hasText: 'End Time *End Time *' }).getByLabel('Open').click();
  await page.getByRole('option', { name: ':00 AM (8 hrs)' }).click();
  await page.getByRole('checkbox', { name: 'Telehealth' }).check();

  // Set Friday availability
  await page.getByRole('tab', { name: 'Friday' }).click();
  await page.locator('div').filter({ hasText: /^Start Time \*$/ }).nth(1).click();
  await page.getByRole('option', { name: '12:00 AM' }).click();
  await page.locator('form').filter({ hasText: 'End Time *End Time *' }).getByLabel('Open').click();
  await page.getByRole('option', { name: ':00 AM (8 hrs)' }).click();
  await page.getByRole('checkbox', { name: 'Telehealth' }).check();

  // Set appointment type and duration settings
  await page.locator('form').filter({ hasText: 'Appointment TypeAppointment' }).getByLabel('Open').click();
  await page.getByRole('option', { name: 'New Patient Visit' }).click();
  await page.locator('form').filter({ hasText: 'DurationDuration' }).getByLabel('Open').click();
  await page.getByRole('option', { name: '30 minutes' }).click();
  await page.locator('form').filter({ hasText: 'Schedule NoticeSchedule Notice' }).getByLabel('Open').click();
  await page.getByRole('option', { name: '1 Hours Away' }).click();

  // Save availability settings
  await page.getByRole('button', { name: 'Save' }).click();

  // 4. Patient Creation - Create a new patient
  await page.locator('div').filter({ hasText: /^Create$/ }).nth(1).click();
  await page.getByText('New Patient', { exact: true }).click();
  await page.locator('div').filter({ hasText: /^Enter Patient Details$/ }).getByRole('img').click();
  await page.getByRole('button', { name: 'Next' }).click();

  // Fill patient details with dynamic data
  await page.locator('form').filter({ hasText: 'Provider Group' }).getByLabel('Open').click();
  await page.getByRole('textbox', { name: 'First Name *' }).click();
  await page.getByRole('textbox', { name: 'First Name *' }).fill(patientData.firstName);
  await page.getByRole('textbox', { name: 'Last Name *' }).click();
  await page.getByRole('textbox', { name: 'Last Name *' }).fill(patientData.lastName);
  await page.getByRole('textbox', { name: 'Date Of Birth *' }).click();
  await page.getByRole('textbox', { name: 'Date Of Birth *' }).fill(patientData.dateOfBirth);
  await page.getByRole('combobox', { name: 'Gender *' }).click();
  await page.getByRole('option', { name: 'Male', exact: true }).click();
  await page.locator('form').filter({ hasText: 'Time Zone *Time Zone *' }).getByLabel('Open').click();
  await page.getByRole('option', { name: 'Alaska Standard Time (UTC -9)' }).click();
  await page.getByRole('textbox', { name: 'Mobile Number *' }).click();
  await page.getByRole('textbox', { name: 'Mobile Number *' }).fill(patientData.mobileNumber);
  await page.getByRole('textbox', { name: 'Email *' }).click();
  await page.getByRole('textbox', { name: 'Email *' }).fill(patientData.email);
  await page.getByRole('button', { name: 'Save' }).click();

  // 5. Appointment Booking - Create a new appointment for the patient
  await page.getByRole('banner').getByTestId('ExpandMoreIcon').click();
  await page.getByText('New Appointment').click();

  // Fill appointment details with dynamic patient data - FIXED SECTION
  await page.locator('form').filter({ hasText: 'Patient Name *Patient Name *' }).getByLabel('Open').click();
  
  // Use the exact format from your working code: "FirstName LastName Day Month"
  const birthMonth = patientData.dateOfBirth.split('-')[0];
  const birthDay = patientData.dateOfBirth.split('-')[1];
  
  // Convert month number to month name abbreviation (matching your format)
  const monthNames = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthAbbr = monthNames[parseInt(birthMonth)];
  
  // Create the exact format: "Shubh Singu 3 Feb" (remove leading zero from day)
  const formattedDay = parseInt(birthDay).toString();
  const patientOptionText = `${patientData.firstName} ${patientData.lastName} ${formattedDay} ${monthAbbr}`;
  console.log(`Looking for patient: "${patientOptionText}"`);
  
  try {
    await page.getByRole('option', { name: patientOptionText }).click();
    console.log(`Selected patient: ${patientOptionText}`);
  } catch (error) {
    console.log('Exact match failed, trying fallback approaches...');
    
    // Fallback 1: Use regex pattern
    const patientPattern = new RegExp(`${patientData.firstName}\\s+${patientData.lastName}\\s+\\d+\\s+\\w{3}`);
    try {
      await page.getByRole('option', { name: patientPattern }).first().click();
      console.log(`Selected patient using regex pattern`);
    } catch (error2) {
      // Fallback 2: Use just name with .first()
      const namePattern = new RegExp(`${patientData.firstName}\\s+${patientData.lastName}`);
      await page.getByRole('option', { name: namePattern }).first().click();
      console.log(`Selected patient using name pattern with .first()`);
    }
  }
  
  await page.getByRole('combobox', { name: 'Appointment Type *' }).click();
  await page.getByRole('option', { name: 'New Patient Visit' }).click();
  await page.getByRole('textbox', { name: 'Reason For Visit *' }).click();
  await page.getByRole('textbox', { name: 'Reason For Visit *' }).fill('Fever');
  await page.locator('form').filter({ hasText: 'Timezone *Timezone *' }).getByLabel('Open').click();
  await page.getByRole('option', { name: 'Alaska Standard Time (GMT -09' }).click();
  await page.getByRole('button', { name: 'Telehealth' }).click();

  // Select provider and schedule appointment with dynamic provider data
  await page.locator('form').filter({ hasText: 'Provider *Provider *' }).getByLabel('Open').click();
  await page.getByRole('option', { name: providerData.fullName }).first().click();
  await page.getByRole('button', { name: 'View availability' }).click({
    button: 'right'
  });
  await page.getByRole('button', { name: 'View availability' }).click();
  
  // Wait for calendar to load and select an available date from Aug 5-9
  await page.waitForSelector('[role="gridcell"]', { timeout: 10000 });
  
  // Try to find and click on August dates 5, 6, 7, 8, 9
  const availableDays = ['5', '6', '7', '8', '9'];
  let daySelected = false;
  let selectedDay = '';
  
  for (const day of availableDays) {
    try {
      const dayCell = page.getByRole('gridcell', { name: day, exact: true });
      if (await dayCell.isVisible({ timeout: 2000 })) {
        await dayCell.click();
        daySelected = true;
        selectedDay = day;
        console.log(`Selected day: ${day}`);
        break;
      }
    } catch (error) {
      console.log(`Day ${day} not available, trying next...`);
    }
  }
  
  if (!daySelected) {
    // If none of the preferred days are available, click the first available day
    const firstAvailableDay = page.locator('[role="gridcell"]').first();
    await firstAvailableDay.click();
    selectedDay = await firstAvailableDay.textContent() || 'unknown';
    console.log(`Selected first available day: ${selectedDay}`);
  }
  
  // IMPORTANT: Wait for time slots to load after date selection
  console.log('Waiting for time slots to load after date selection...');
  await page.waitForTimeout(3000); // Give time for the UI to update
  
  // Look for time slot buttons in the format from your working code: ":45 AM - 04:15 AM"
  console.log('Looking for available time slots...');
  
  let timeSlotSelected = false;
  
  // Strategy 1: Look for buttons with the format from your working code (starts with colon)
  try {
    await page.waitForSelector('button', { timeout: 8000 });
    
    // Look for buttons with format like ":45 AM - 04:15 AM"
    const timeRangeButtons = page.locator('button').filter({ 
      hasText: /:\d{2}\s+(AM|PM)\s+-\s+\d{1,2}:\d{2}\s+(AM|PM)/ 
    });
    
    const timeRangeCount = await timeRangeButtons.count();
    console.log(`Found ${timeRangeCount} time range buttons (colon format)`);
    
    if (timeRangeCount > 0) {
      const firstTimeSlot = timeRangeButtons.first();
      const timeSlotText = await firstTimeSlot.textContent();
      await firstTimeSlot.click();
      console.log(`Selected time slot (colon format): ${timeSlotText}`);
      timeSlotSelected = true;
    }
  } catch (error) {
    console.log('Strategy 1 failed: No colon format time buttons found');
  }
  
  // Strategy 2: Look for buttons with full time range format "HH:MM AM/PM - HH:MM AM/PM"
  if (!timeSlotSelected) {
    try {
      const timeRangeButtons = page.locator('button').filter({ 
        hasText: /\d{1,2}:\d{2}\s+(AM|PM)\s+-\s+\d{1,2}:\d{2}\s+(AM|PM)/ 
      });
      
      const timeRangeCount = await timeRangeButtons.count();
      console.log(`Found ${timeRangeCount} full time range buttons`);
      
      if (timeRangeCount > 0) {
        const firstTimeSlot = timeRangeButtons.first();
        const timeSlotText = await firstTimeSlot.textContent();
        await firstTimeSlot.click();
        console.log(`Selected time slot (full range): ${timeSlotText}`);
        timeSlotSelected = true;
      }
    } catch (error) {
      console.log('Strategy 2 failed: No full time range buttons found');
    }
  }
  
  // Strategy 3: Look for buttons with simple AM/PM format
  if (!timeSlotSelected) {
    try {
      const timeSlots = page.locator('button:has-text("AM"), button:has-text("PM")').filter({ hasNotText: /disabled|unavailable/i });
      const timeSlotCount = await timeSlots.count();
      console.log(`Found ${timeSlotCount} AM/PM buttons`);
      
      if (timeSlotCount > 0) {
        const firstTimeSlot = timeSlots.first();
        const timeSlotText = await firstTimeSlot.textContent();
        await firstTimeSlot.click();
        console.log(`Selected time slot (AM/PM): ${timeSlotText}`);
        timeSlotSelected = true;
      }
    } catch (error) {
      console.log('Strategy 3 failed: No AM/PM buttons found');
    }
  }
  
  // Strategy 4: Debug and show all available buttons
  if (!timeSlotSelected) {
    console.log('Taking screenshot for debugging...');
    await page.screenshot({ path: 'debug-timeslots.png', fullPage: true });
    
    // Get all visible buttons and log their text for debugging
    const allButtons = page.locator('button:visible');
    const buttonCount = await allButtons.count();
    console.log(`Found ${buttonCount} visible buttons on page after selecting day ${selectedDay}`);
    
    // Log first 15 button texts for debugging
    for (let i = 0; i < Math.min(buttonCount, 15); i++) {
      try {
        const buttonText = await allButtons.nth(i).textContent();
        console.log(`Button ${i}: "${buttonText}"`);
      } catch (e) {
        console.log(`Button ${i}: Could not get text`);
      }
    }
    
    // Try to find any button that might be a time slot (contains numbers and is not navigation)
    const possibleTimeSlots = allButtons.filter({ 
      hasText: /\d/ 
    }).filter({ 
      hasNotText: /save|cancel|close|back|next|view|edit|delete|day|month|year/i 
    });
    
    const possibleCount = await possibleTimeSlots.count();
    console.log(`Found ${possibleCount} possible time slot buttons`);
    
    if (possibleCount > 0) {
      const firstButton = possibleTimeSlots.first();
      const buttonText = await firstButton.textContent();
      console.log(`Attempting to click possible time slot: "${buttonText}"`);
      await firstButton.click();
      timeSlotSelected = true;
    }
  }
  
  if (!timeSlotSelected) {
    throw new Error(`Unable to find and select any time slots for day ${selectedDay}. Check debug-timeslots.png for page state.`);
  }
  
  await page.getByRole('button', { name: 'Save And Close' }).click();

  // Log completion with generated data for debugging
  console.log('Test completed successfully with:');
  console.log(`Provider: ${providerData.fullName} (${providerData.email})`);
  console.log(`Patient: ${patientData.fullName} (${patientData.email})`);
});
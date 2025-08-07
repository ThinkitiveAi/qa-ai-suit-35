import { test, expect } from '@playwright/test';

test('Appointment Scheduling – Mandatory Fields', async ({ page }) => {
  // 1. Go to the login page
  await page.goto('https://stage_ketamin.uat.provider.ecarehealth.com/');

  // 2. Login
  await page.getByPlaceholder('Email').fill('amol.shete+TP@medarch.com');
  await page.getByPlaceholder('*********').fill('Test@123$');
  await page.getByRole('button', { name: "Let's get Started" }).click();

  // 3. Wait for dashboard to load
  await page.getByText('Create', { exact: true }).waitFor();

  // 4. Click "Create" > "New appointment."
  await page.getByText('Create', { exact: true }).click();
  await page.getByText('New Appointment', { exact: true }).click();

  // 5. Select "Patient name" from the dropdown - Rutuja Dumbre (search and select)
  await page.getByRole('combobox', { name: 'Patient Name *' }).click();
  await page.getByRole('combobox', { name: 'Patient Name *' }).fill('Rutuja Dumbre');
  await page.getByRole('option', { name: 'Rutuja Dumbre' }).click();

  // 6. Select "Appointment type." from the dropdown - Follow-up visit
  await page.getByRole('combobox', { name: 'Appointment Type *' }).click();
  await page.getByRole('option', { name: 'Follow-up visit' }).click();

  // 7. Fill "Reason for visit" textfield - Fever
  await page.getByRole('textbox', { name: 'Reason For Visit *' }).fill('Fever');

  // 8. Select "Time zone" from the dropdown - Alaska Standard Time (GMT -09:00)
  await page.getByRole('combobox', { name: 'Timezone *' }).click();
  await page.getByRole('option', { name: 'Alaska Standard Time (GMT -09:00)' }).click();

  // 9. Select "Visit type" from the toggle button - Telehealth
  await page.getByRole('button', { name: 'Telehealth' }).click();

  // 10. Select "Provider" from the dropdown - Sarah Johnson
  await page.getByRole('combobox', { name: 'Provider *' }).click();
  await page.getByRole('option', { name: 'Sarah Johnson' }).click();

  // 11. Click on "View Availability" button
  await page.getByRole('button', { name: /View availability/i }).click();

  // Wait for the calendar modal/dialog to be visible
  const calendarModal = page.locator('[role="dialog"]');
  await calendarModal.waitFor({ state: 'visible', timeout: 10000 });

  // 12. Click on July 15th in the calendar
  await calendarModal.locator('[role="gridcell"]').filter({ hasText: '17' }).click();

  // Wait for time slots to load after date selection
  await page.waitForTimeout(2000);

  // 13. Select the first available time slot
  // Look for buttons or clickable elements that contain time format (AM/PM)
  const timeSlotSelectors = [
    'button:has-text("10:30 AM - 10:45 AM")',
    'button:has-text("10:45 AM - 11:00 AM")',
    'button:has-text("11:00 AM - 11:15 AM")',
    '[role="button"]:has-text("AM")',
    '[role="button"]:has-text("PM")',
    'button[class*="time"]:has-text("AM")',
    'button[class*="time"]:has-text("PM")',
    'div[class*="slot"]:has-text("AM")',
    'div[class*="slot"]:has-text("PM")'
  ];

  let timeSlotSelected = false;
  
  for (const selector of timeSlotSelectors) {
    try {
      const timeSlot = page.locator(selector).first();
      if (await timeSlot.isVisible({ timeout: 2000 })) {
        await timeSlot.click();
        timeSlotSelected = true;
        console.log(`Selected time slot with selector: ${selector}`);
        break;
      }
    } catch (error) {
      // Continue to next selector if current one fails
      continue;
    }
  }

  // Alternative approach: Look for any clickable element containing time pattern
  if (!timeSlotSelected) {
    const allClickableElements = await page.locator('button, [role="button"], div[class*="clickable"], div[class*="slot"]').all();
    
    for (const element of allClickableElements) {
      try {
        const text = await element.textContent();
        if (text && /\d{1,2}:\d{2}\s*(AM|PM)/.test(text) && await element.isVisible()) {
          await element.click();
          timeSlotSelected = true;
          console.log(`Selected time slot with text: ${text}`);
          break;
        }
      } catch (error) {
        continue;
      }
    }
  }

  // If still no time slot selected, try the most generic approach
  if (!timeSlotSelected) {
    // Look for any element containing AM or PM that might be clickable
    const timeElements = await page.locator('*').filter({ hasText: /AM|PM/ }).all();
    
    for (const element of timeElements) {
      try {
        if (await element.isVisible()) {
          await element.click();
          timeSlotSelected = true;
          console.log('Selected time slot using generic AM/PM filter');
          break;
        }
      } catch (error) {
        continue;
      }
    }
  }

  if (!timeSlotSelected) {
    throw new Error('Could not select any time slot. Please check the page structure.');
  }

  // Wait a moment after selecting time slot
  await page.waitForTimeout(1000);

  // 14. Click on "Save and Close" button
  await page.getByRole('button', { name: /Save.*Close/i }).click();

  // Wait for the appointment to be saved
  await page.waitForTimeout(2000);

  // 15. Click on the Scheduling in task bar
  await page.getByText('Scheduling', { exact: true }).first().click();

  // 16. Click on the "Appointments"
  await page.getByText('Appointments', { exact: true }).click();

  // 17. Check if a new appointment is created (look for patient name)
  await expect(page.getByText('Rutuja').first()).toBeVisible({ timeout: 10000 });
  
  // Additional verification: Check for the appointment details
  await expect(page.getByText('Fever')).toBeVisible({ timeout: 5000 });
  
  console.log('Appointment successfully created and verified!');
});
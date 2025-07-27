import { test, expect } from '@playwright/test';

test('Patient Registration – Mandatory Fields', async ({ page }) => {
  // 1. Go to the login page
  await page.goto('/');

  // 2. Login
  await page.getByPlaceholder('Email').fill('amol.shete+TP@medarch.com');
  await page.getByPlaceholder('*********').fill('Test@123$');
  await page.getByRole('button', { name: "Let's get Started" }).click();

  // 3. Wait for dashboard to load
  await page.getByText('Create', { exact: true }).waitFor();

  // 4. Click "Create" > "New Patient"
  await page.getByText('Create', { exact: true }).click();
  await page.getByText('New Patient', { exact: true }).click();

  // 5. Click "Enter Patient Details" > Next
  await page.getByText('Enter Patient Details', { exact: true }).click();
  await page.getByRole('button', { name: 'Next' }).click();

  // 6. Fill mandatory Patient Details
  await page.getByRole('textbox', { name: 'First Name *' }).fill('Siddhi');
  await page.getByRole('textbox', { name: 'Last Name *' }).fill('Johnson');
  await page.getByRole('textbox', { name: 'Date Of Birth *' }).fill('05-07-2002');
  await page.getByRole('combobox', { name: 'Gender *' }).click();
  await page.getByRole('listbox', { name: 'Gender *' }).getByText('Female', { exact: true }).click();

  // 7. Fill mandatory Contact Info
  await page.getByRole('textbox', { name: 'Mobile Number *' }).fill('9876548987');
  await page.getByRole('textbox', { name: 'Email *' }).fill('rutuja.dumbre+43@thinkitive.com');

  // 8. Click "Save"
  await page.getByRole('button', { name: 'Save' }).click();

  // 9. Wait for either a validation error or navigation to the patient list
  // If a validation error appears, print it for debugging
  const errorLocator = page.locator('[role="alert"], .Mui-error, .MuiFormHelperText-root');
  if (await errorLocator.first().isVisible({ timeout: 3000 }).catch(() => false)) {
    const errorText = await errorLocator.allTextContents();
    console.log('Validation error(s):', errorText);
    throw new Error('Validation error(s) present: ' + errorText.join('; '));
  }

  // Wait for the patient list or dashboard to appear
  await page.waitForSelector('text=Patients', { timeout: 10000 });
  // Optionally, navigate to the patient list if not redirected
  // await page.getByText('Patients', { exact: true }).click();

  // 10. Assert: New patient is visible in the list (allow for phone formatting)
  // Explicitly navigate to Patients tab if needed
  await page.getByText('Patients', { exact: true }).click();
  // Optionally, use a search field if available
  // await page.getByPlaceholder('Find Patient').fill('Rutuja Dumbre');
  await expect(page.locator('text=Siddhi Johnson')).toBeVisible({ timeout: 10000 });
});

import { test, expect } from '@playwright/test';

test('Login to EcareHealth QA', async ({ page }) => {
  // 1. Go to the login page
  await page.goto('https://stage_ketamin.uat.provider.ecarehealth.com/');

  // 2. Login
  await page.getByPlaceholder('Email').fill('amol.shete+TP@medarch.com');
  await page.getByPlaceholder('*********').fill('Test@123$');
  await page.getByRole('button', { name: "Let's get Started" }).click();

  // 3. Wait for dashboard to load (presence of 'Create' button)
  await expect(page.getByText('Create', { exact: true })).toBeVisible({ timeout: 10000 });
});

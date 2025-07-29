import { test, expect } from '@playwright/test';

test.describe('Work with textbox', () => {
  test('Positive: Fill all textboxes and verify submitted data', async ({ page }) => {
    await page.goto('https://demoqa.com/text-box');

    // Fill all fields
    await page.fill('#userName', 'Katsiaryna Kaperskaya');
    await page.fill('#userEmail', 'katsiaryna.kaperskaya@example.com');
    await page.fill('#currentAddress', '37 Brilevskaya St, Minsk');
    await page.fill('#permanentAddress', '13 Gagarina St, Zhodino');

    // Click the Submit button and wait for the output block to appear
    await Promise.all([
      page.waitForSelector('#output', { state: 'visible' }),
      page.click('#submit'),
    ]);

    const output = page.locator('#output');

    // Checking the content taking into account the text format inside the elements
    await expect(output.locator('#name')).toContainText('Katsiaryna Kaperskaya');
    await expect(output.locator('#email')).toContainText('katsiaryna.kaperskaya@example.com');
    await expect(output.locator('#currentAddress')).toContainText('37 Brilevskaya St, Minsk');
    await expect(output.locator('#permanentAddress')).toContainText('13 Gagarina St, Zhodino');
  });

  // Negative Scenario: Submit with empty fields and check for validation or absence of data
  test('Negative: Submit empty form and verify no data is displayed', async ({ page }) => {
    // Open the page
    await page.goto('https://demoqa.com/text-box');

    // Clear all fields to ensure they are empty
    await page.fill('#userName', '');
    await page.fill('#userEmail', '');
    await page.fill('#currentAddress', '');
    await page.fill('#permanentAddress', '');

    // Click Submit button
    await page.click('#submit');

    // Verify that no output data is displayed (assuming the form does not submit or shows empty output)
    const outputSection = page.locator('#output');

    // Expect that output section is either hidden or contains no text
    await expect(outputSection).toBeHidden(); // if the output disappears when fields are empty

    // Alternatively, check that no data is shown
    await expect(outputSection).toBeEmpty(); // if applicable
  });
});

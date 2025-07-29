import { test, expect } from '@playwright/test';

test('Testing of sorting', async ({ page }) => {
  // Open site
  await page.goto('https://www.saucedemo.com');

  // Login as standard_user
  await page.fill('#user-name', 'standard_user');
  await page.fill('#password', 'secret_sauce');
  await page.click('#login-button');

  // Verify inventory page loaded
  await expect(page).toHaveURL(/.*inventory.html/);

  // Select sort by price (High to Low)
  await page.selectOption('.product_sort_container', 'hilo'); // 'hilo' is value for High to Low

  // Wait for products to be sorted (small delay to ensure UI updates)
  await page.waitForTimeout(1000);

  // Get prices displayed on the page
  const prices = await page.$$eval('.inventory_item_price', (elements) =>
    elements.map((el) => parseFloat(el.textContent?.replace('$', '') || '0')),
  );

  // Check prices array is sorted descending
  for (let i = 0; i < prices.length - 1; i++) {
    expect(prices[i]).toBeGreaterThanOrEqual(prices[i + 1]);
  }
});

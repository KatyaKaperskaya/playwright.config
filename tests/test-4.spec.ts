import { test, expect } from '@playwright/test';

test.describe('SauceDemo problem_user bug detection', () => {
  // Before each test, navigate to the site and log in as problem_user
  test.beforeEach(async ({ page }) => {
    await page.goto('https://www.saucedemo.com');

    // Login as problem_user
    await page.fill('#user-name', 'problem_user');
    await page.fill('#password', 'secret_sauce');
    await page.click('#login-button');

    // Wait for inventory page to load
    await expect(page).toHaveURL(/.*inventory.html/);
  });

  // Test 1: Detect broken or invalid product images
  test('Detect wrong or broken product images', async ({ page }) => {
    const productImages = page.locator('.inventory_item_img img');
    const count = await productImages.count();

    // Ensure there is at least one image
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const img = productImages.nth(i);
      const src = await img.getAttribute('src');
      expect(src).not.toBeNull(); // src attribute should exist

      // Check if image is loaded properly by evaluating naturalWidth
      const naturalWidth = await img.evaluate((node: HTMLImageElement) => node.naturalWidth);
      expect(naturalWidth).toBeGreaterThan(0); // Fail if image is broken
    }
  });

  // Test 2: Detect if any product images are duplicated or swapped
  test('Detect if any product images are duplicated or swapped', async ({ page }) => {
    // Collect all image src attributes into an array
    const srcs = await page.$$eval('.inventory_item_img img', (imgs) =>
      imgs.map((img) => img.getAttribute('src') || ''),
    );

    // Ensure there are multiple images to compare
    expect(srcs.length).toBeGreaterThan(1);

    // Create a set of unique srcs
    const uniqueSrcs = new Set(srcs);

    // Fail if duplicates are found (i.e., set size less than array length)
    expect(uniqueSrcs.size).toBe(srcs.length);
  });

  // Test 3: Detect broken add-to-cart buttons and their behavior
  test('Detect broken add to cart buttons or wrong behavior', async ({ page }) => {
    const buttons = page.locator('.inventory_item button');

    const count = await buttons.count();
    expect(count).toBeGreaterThan(0); // Ensure there are buttons

    for (let i = 0; i < count; i++) {
      const button = buttons.nth(i);

      // Get current button text and trim whitespace
      const textContent = await button.textContent();
      const text = textContent?.trim();

      // The button should be either "Add to cart" or "Remove"
      expect(['Add to cart', 'Remove']).toContain(text!);

      if (text === 'Add to cart') {
        // Click to add item to cart
        await button.click();

        // After clicking, button text should change to "Remove"
        const newTextContent = await button.textContent();
        const newText = newTextContent?.trim();
        expect(newText).toBe('Remove');

        // Click again to remove item from cart
        await button.click();

        // Button text should revert back to "Add to cart"
        const revertTextContent = await button.textContent();
        const revertText = revertTextContent?.trim();
        expect(revertText).toBe('Add to cart');
      } else if (text === 'Remove') {
        // If already "Remove", try clicking to remove item and check behavior
        await button.click();

        const afterClickTextContent = await button.textContent();
        const afterClickText = afterClickTextContent?.trim();
        expect(afterClickText).toBe('Add to cart');

        // Re-add for consistency in tests
        await button.click();
        const reAddTextContent = await button.textContent();
        const reAddText = reAddTextContent?.trim();
        expect(reAddText).toBe('Remove');
      }
    }
  });

  // Test 4: Check for layout issues or missing product titles
  test('Detect layout or missing product title issues', async ({ page }) => {
    const titles = await page.$$eval('.inventory_item_name', (els) =>
      els.map((el) => el.textContent?.trim() || ''),
    );

    // Ensure no empty titles exist
    for (const title of titles) {
      expect(title.length).toBeGreaterThan(0);
    }

    // Check that all titles are unique (optional)
    const uniqueTitles = new Set(titles);
    expect(uniqueTitles.size).toBe(titles.length);
  });

  // Test 5: Detect default sort order issues (e.g., sorting bugs)
  test('Detect default sort order issue', async ({ page }) => {
    // Collect prices of products on the page
    const prices = await page.$$eval('.inventory_item_price', (els) =>
      els.map((el) => parseFloat(el.textContent?.replace('$', '') || '0')),
    );

    expect(prices.length).toBeGreaterThan(0);

    // Log prices for manual inspection (optional)
    console.log('Prices on default load:', prices);

    // Check if prices are sorted ascending; expecting them NOT sorted indicates a bug.
    const sortedPricesAsc = [...prices].sort((a, b) => a - b);

    // If prices are sorted ascending when they shouldn't be, this will fail.

    expect(prices).not.toEqual(sortedPricesAsc);

    // Alternatively, if you want to check that they ARE sorted ascending:
    // expect(prices).toEqual(sortedPricesAsc);
  });
});

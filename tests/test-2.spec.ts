import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Automation Practice Form Tests', () => {
  const url = 'https://demoqa.com/automation-practice-form';

  // Common valid data for positive test
  const validData = {
    firstName: 'Alice',
    lastName: 'Johnson',
    email: 'alice.johnson@example.com',
    gender: 'Female', // options: Male, Female, Other
    mobile: '9876543210',
    dob: '10 May 1990', // we'll set it properly using the picker
    subjects: ['Maths', 'Physics'],
    hobbies: ['Sports', 'Reading'],
    picture: 'test-image.png', // make sure to have this image in test folder
    address: '1234 Elm Street',
    state: 'NCR',
    city: 'Delhi',
  };

  test.beforeEach(async ({ page }) => {
    await page.goto(url);
    // Remove footer and fixed banners that block click sometimes
    await page.evaluate(() => {
      const footer = document.querySelector('footer');
      if (footer) footer.remove();
      const fixedBanner = document.querySelector('#fixedban');
      if (fixedBanner) fixedBanner.remove();
    });
  });

  test('Positive scenario: Fill all fields correctly and submit', async ({ page }) => {
    // Fill first name, last name, email
    await page.fill('#firstName', validData.firstName);
    await page.fill('#lastName', validData.lastName);
    await page.fill('#userEmail', validData.email);

    // Select gender
    await page.locator(`label[for="gender-radio-2"]`).click(); // Female

    // Fill mobile
    await page.fill('#userNumber', validData.mobile);

    // Set DOB
    await page.click('#dateOfBirthInput');
    // Select year
    await page.selectOption('.react-datepicker__year-select', '1990');
    // Select month May (index 4, since 0-based)
    await page.selectOption('.react-datepicker__month-select', '4');
    // Select day 10
    await page
      .locator(`.react-datepicker__day--010:not(.react-datepicker__day--outside-month)`)
      .click();

    // Fill subjects - type and press Enter
    for (const subject of validData.subjects) {
      await page.fill('#subjectsInput', subject);
      await page.keyboard.press('Enter');
    }

    // Select hobbies
    for (const hobby of validData.hobbies) {
      const label = page.locator(`label:has-text("${hobby}")`);
      await expect(label).toBeVisible();
      await expect(label).toBeEnabled();
      await label.first().click({ force: true });
    }

    // Upload picture (make sure the file exists in the tests folder)
    const filePath = path.resolve(__dirname, validData.picture);
    await page.setInputFiles('#uploadPicture', filePath);

    // Current address
    await page.fill('#currentAddress', validData.address);

    // Wait for the element to appear and be visible
    const stateDropdown = page.locator('#state');
    await expect(stateDropdown).toBeVisible();

    // Click on it with force if necessary
    await stateDropdown.click({ force: true });

    // Select the desired state from the list
    await page.locator(`#stateCity-wrapper div:has-text("${validData.state}")`).nth(0).click();

    // Select City
    await page.click('#city');
    await page.locator(`#stateCity-wrapper div:has-text("${validData.city}")`).nth(0).click();
    // Submit the form
    await page.click('#submit');

    // Validate the modal appears
    const modal = page.locator('.modal-content');
    await expect(modal).toBeVisible();

    // Validate data in modal table
    await expect(modal.locator('td:has-text("Student Name") + td')).toHaveText(
      `${validData.firstName} ${validData.lastName}`,
    );
    await expect(modal.locator('td:has-text("Student Email") + td')).toHaveText(validData.email);
    await expect(modal.locator('td:has-text("Gender") + td')).toHaveText(validData.gender);
    await expect(modal.locator('td:has-text("Mobile") + td')).toHaveText(validData.mobile);
    await expect(modal.locator('td:has-text("Date of Birth") + td')).toHaveText('10 May,1990');
    await expect(modal.locator('td:has-text("Subjects") + td')).toHaveText(
      validData.subjects.join(', '),
    );
    await expect(modal.locator('td:has-text("Hobbies") + td')).toHaveText(
      validData.hobbies.join(', '),
    );
    await expect(modal.locator('td:has-text("Picture") + td')).toHaveText(validData.picture);
    await expect(modal.locator('td:has-text("Address") + td')).toHaveText(validData.address);
    await expect(modal.locator('td:has-text("State and City") + td')).toHaveText(
      `${validData.state} ${validData.city}`,
    );

    // Close modal
    await page.click('#closeLargeModal');
  });

  test('Negative scenario 1: Submit form without mandatory First Name', async ({ page }) => {
    // Fill in other required fields
    await page.fill('#lastName', validData.lastName);
    await page.fill('#userEmail', validData.email);
    await page.locator('label[for="gender-radio-1"]').click(); // Select Male
    await page.fill('#userNumber', validData.mobile);

    // Leave the First Name field empty intentionally

    // Focus and blur on the First Name input to trigger validation (if needed)
    const firstNameInput = page.locator('#firstName');
    await firstNameInput.focus();
    await firstNameInput.blur();

    // Attempt to submit the form
    await page.click('#submit');

    // Retrieve the native validation message
    const validationMessage = await firstNameInput.evaluate((el) => el.validationMessage);

    // Log the validation message for debugging purposes
    console.log('Validation message:', validationMessage);

    // Check that a validation message appears (non-empty)
    expect(validationMessage).toBeTruthy();

    // Optional: Check that the message contains key words in any language
    expect(validationMessage.toLowerCase()).toMatch(/fill|заполните|required/i);
  });

  test('Negative scenario 2: Submit form with invalid email', async ({ page }) => {
    await page.fill('#firstName', validData.firstName);
    await page.fill('#lastName', validData.lastName);
    await page.fill('#userEmail', 'invalid-email');
    await page.locator('label[for="gender-radio-1"]').click(); // Male
    await page.fill('#userNumber', validData.mobile);

    await page.click('#submit');

    const emailInput = page.locator('#userEmail');
    const isValid = await page.evaluate(() => {
      const emailInput = document.querySelector('#userEmail') as HTMLInputElement;
      return emailInput.checkValidity();
    });
    expect(isValid).toBe(false);
  });

  test('Negative scenario 3: Submit form without uploading picture', async ({ page }) => {
    // Fill all required fields except picture
    await page.fill('#firstName', validData.firstName);
    await page.fill('#lastName', validData.lastName);
    await page.fill('#userEmail', validData.email);
    await page.locator('label[for="gender-radio-1"]').click(); // Male
    await page.fill('#userNumber', validData.mobile);

    // DOB required for valid submit
    await page.click('#dateOfBirthInput');
    await page.selectOption('.react-datepicker__year-select', '1990');
    await page.selectOption('.react-datepicker__month-select', '4');
    await page
      .locator(`.react-datepicker__day--010:not(.react-datepicker__day--outside-month)`)
      .click();

    // No picture uploaded here

    await page.click('#submit');

    // The form actually submits even without picture on demo site.
    // So we will verify that picture field in modal is empty or absent.

    const modal = page.locator('.modal-content');
    await expect(modal).toBeVisible();
    await expect(modal.locator('td:has-text("Picture") + td')).toHaveText('');
    await page.click('#closeLargeModal');
  });

  test('Negative scenario 4: Submit form with invalid mobile number', async ({ page }) => {
    await page.fill('#firstName', validData.firstName);
    await page.fill('#lastName', validData.lastName);
    await page.fill('#userEmail', validData.email);
    await page.locator('label[for="gender-radio-1"]').click(); // Male

    // Invalid mobile number (less than 10 digits)
    await page.fill('#userNumber', '12345');

    await page.click('#submit');

    const mobileInput = page.locator('#userNumber');
    const isValid = await page.evaluate(() => {
      const mobileInput = document.querySelector('#userNumber') as HTMLInputElement;
      return mobileInput.checkValidity();
    });
    expect(isValid).toBe(false);
  });
});

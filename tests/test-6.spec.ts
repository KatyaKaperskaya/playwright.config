import { test } from '@playwright/test';
import { allure } from 'allure-playwright';

test('my test', async ({ page }) => {
  allure.epic('Bookstore Tests');
  allure.feature('Login');
  allure.story('Successful login test');
  allure.description('This test validates that user can login successfully.');

  // test steps...
});

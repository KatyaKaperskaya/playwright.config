import { test, expect, request } from '@playwright/test';
import { RegisterPage } from './register.page';
import { LoginPage } from './login.page';
import { ProfilePage } from './profile.page';

test.describe('Bookstore API and UI tests', () => {
  // Generate random user data for independence
  const generateUserData = () => ({
    username: `user_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    password: `Pass_${Math.random().toString(36).slice(-8)}!`,
  });

  let userData;
  let token;

  test.beforeAll(async ({ playwright }) => {
    // Create a request context for API calls
    const requestContext = await request.newContext();

    // Generate unique user data
    userData = generateUserData();

    // Register the user via API
    const registerPage = new RegisterPage();
    await registerPage.registerUser(requestContext, userData);

    // Log in to get token
    const loginPage = new LoginPage();
    token = await loginPage.loginUser(requestContext, userData);

    // Save token for subsequent requests
  });

  test('Add and remove book via API and verify UI', async ({ page }) => {
    // Use the token to add a book via API
    const bookIsbn = '9781449325862'; // Example ISBN, can be dynamic or fixed
    const addBookResponse = await request
      .newContext()
      .post('https://demoqa.com/BookStore/v1/Books', {
        headers: { Authorization: `Bearer ${token}` },
        data: { isbn: bookIsbn },
      });

    expect(addBookResponse.status()).toBe(201);

    // Navigate to profile page in UI
    const profilePage = new ProfilePage(page);
    await profilePage.navigate();

    // Verify the book appears in profile
    const isPresentBeforeDeletion = await profilePage.isBookPresent(bookIsbn);
    expect(isPresentBeforeDeletion).toBe(true);

    // Delete the book via API to clean up (idempotency)
    // First, get list of books to find the ID or title
    const responseBooks = await request.newContext().get('https://demoqa.com/BookStore/v1/Books', {
      headers: { Authorization: `Bearer ${token}` },
    });

    expect(responseBooks.status()).toBe(200);

    const booksList = await responseBooks.json();

    // Find the specific book object by ISBN or title
    const targetBook = booksList.books.find((b) => b.isbn === bookIsbn);

    if (targetBook && targetBook.id) {
      // Delete the book by ID via API
      const deleteResponse = await request
        .newContext()
        .delete(`https://demoqa.com/BookStore/v1/Book/${targetBook.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

      expect(deleteResponse.status()).toBe(204);

      // Refresh profile page and verify removal
      await profilePage.navigate();

      const isPresentAfterDeletion = await profilePage.isBookPresent(bookIsbn);
      expect(isPresentAfterDeletion).toBe(false);

      // Re-add the book to verify idempotency again if needed
      const reAddResponse = await request
        .newContext()
        .post('https://demoqa.com/BookStore/v1/Books', {
          headers: { Authorization: `Bearer ${token}` },
          data: { isbn: bookIsbn },
        });

      expect(reAddResponse.status()).toBe(201);

      // Verify again in UI
      await profilePage.navigate();

      expect(await profilePage.isBookPresent(bookIsbn)).toBe(true);
    } else {
      throw new Error('Target book not found in list');
    }
  });
});

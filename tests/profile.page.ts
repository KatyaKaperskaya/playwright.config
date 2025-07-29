import { Page } from '@playwright/test';

export class ProfilePage {
  constructor(private page: Page) {}

  async navigate() {
    await this.page.goto('https://demoqa.com/profile');
  }

  async getBooks() {
    return this.page.locator('.rt-tr-group');
  }

  async deleteBook(title: string) {
    const rows = this.page.locator('.rt-tr-group');
    const count = await rows.count();
    for (let i = 0; i < count; i++) {
      const row = rows.nth(i);
      const bookTitle = await row.locator('.rt-td').nth(0).textContent();
      if (bookTitle?.trim() === title) {
        await row.locator('button[title="Delete"]').click();
        break;
      }
    }
  }

  async isBookPresent(title: string): Promise<boolean> {
    const books = await this.getBooks().allTextContents();
    return books.some((text) => text.includes(title));
  }
}

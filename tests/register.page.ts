import { APIRequestContext } from '@playwright/test';

export class RegisterPage {
  constructor() {}

  async registerUser(request: APIRequestContext, userData: { username: string; password: string }) {
    const response = await request.post('https://demoqa.com/Account/v1/User', {
      data: {
        userName: userData.username,
        password: userData.password,
      },
    });
    if (response.status() !== 201) {
      throw new Error(`Registration failed: ${response.status()}`);
    }
  }
}

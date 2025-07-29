import { APIRequestContext } from '@playwright/test';

export class LoginPage {
  constructor() {}

  async loginUser(request: APIRequestContext, userData: { username: string; password: string }) {
    const response = await request.post('https://demoqa.com/Account/v1/Authorized', {
      data: {
        userName: userData.username,
        password: userData.password,
      },
    });
    if (response.status() !== 200) {
      throw new Error(`Login failed: ${response.status()}`);
    }
    const responseBody = await response.json();
    return responseBody.token; // JWT token for further requests
  }
}

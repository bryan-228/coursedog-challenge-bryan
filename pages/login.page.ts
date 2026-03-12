import { type Page, type Locator } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;
  readonly logoutLink: Locator;
  readonly homeLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.locator('#email');
    this.passwordInput = page.locator('#password');
    this.submitButton = page.locator('#submitLoginBtn');
    this.errorMessage = page.locator('#message.alert-danger');
    this.logoutLink = page.locator('#logout');
    this.homeLink = page.getByRole('link', { name: 'Home' });
  }

  async goto() {
    await this.page.goto('/auth_ecommerce');
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async logout() {
    await this.logoutLink.click();
  }
}

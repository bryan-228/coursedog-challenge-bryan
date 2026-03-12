import { type Page, type Locator } from '@playwright/test';

export class FileUploadPage {
  readonly page: Page;
  readonly fileInput: Locator;
  readonly submitButton: Locator;
  readonly uploadResponse: Locator;

  constructor(page: Page) {
    this.page = page;
    this.fileInput = page.locator('#file_upload');
    this.submitButton = page.getByRole('button', { name: 'Submit' });
    this.uploadResponse = page.locator('#file_upload_response');
  }

  async goto() {
    await this.page.goto('/file-upload');
  }

  async uploadFile(filePath: string) {
    await this.fileInput.setInputFiles(filePath);
  }

  async submitUpload() {
    await this.submitButton.click();
  }

  async uploadAndSubmit(filePath: string) {
    await this.uploadFile(filePath);
    await this.submitUpload();
  }
}

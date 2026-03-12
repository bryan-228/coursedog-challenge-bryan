import path from 'path';
import { test, expect } from '../fixtures';

const SAMPLE_FILE = path.resolve(__dirname, '..', 'test-data', 'sample-upload.txt');

test.describe('File Upload', () => {
  test.beforeEach(async ({ fileUploadPage }) => {
    await fileUploadPage.goto();
  });

  test('should upload a text file successfully', async ({ fileUploadPage }) => {
    await fileUploadPage.uploadAndSubmit(SAMPLE_FILE);

    await expect(fileUploadPage.uploadResponse).toBeVisible();
    await expect(fileUploadPage.uploadResponse).toContainText(
      'You have successfully uploaded "sample-upload.txt"',
    );
  });

  // TODO: Add more file upload scenarios here
  // - Submit without selecting a file -- expect validation or no success message
  // - Upload an image file (e.g., .png)
  // - Upload a file with special characters in the name
});

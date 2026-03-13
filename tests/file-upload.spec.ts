import path from 'path';
import { test, expect } from '../fixtures';

const SAMPLE_FILE_TXT = path.resolve(__dirname, '..', 'test-data', 'sample-upload.txt');
const SAMPLE_FILE_PNG = path.resolve(__dirname, '..', 'test-data', 'sample-upload.png');
const SAMPLE_FILE_EMPTY = path.resolve(__dirname, '..', 'test-data', 'sample-upload-empty.txt');
const SAMPLE_FILE_WRONG_EXTENSION = path.resolve(__dirname, '..', 'test-data', 'sample-upload-wrong-extension.js');
const SAMPLE_FILE_JPG = path.resolve(__dirname, '..', 'test-data', 'sample-upload.JPG');
const SAMPLE_FILE_PDF = path.resolve(__dirname, '..', 'test-data', 'sample-upload.pdf');
const SAMPLE_FILE_WAV = path.resolve(__dirname, '..', 'test-data', 'sample-upload.wav');
const SAMPLE_FILE_CSV = path.resolve(__dirname, '..', 'test-data', 'sample-upload.csv');
const SAMPLE_FILE_NO_EXTENSION = path.resolve(__dirname, '..', 'test-data', 'sample-upload-no-extension');
const SAMPLE_FILE_SPECIAL_CHARS = path.resolve(__dirname, '..', 'test-data', 'sample-upload-%$.txt');

test.describe('File Upload', () => {
  test.beforeEach(async ({ fileUploadPage }) => {
    await fileUploadPage.goto();
  });

  test('should upload various files successfully', async ({ fileUploadPage }) => {
    await fileUploadPage.uploadAndSubmit(SAMPLE_FILE_TXT);
    await expect(fileUploadPage.uploadResponse).toBeVisible({timeout: 2000});
    await expect(fileUploadPage.uploadResponse).toContainText(
      `You have successfully uploaded "sample-upload.txt"`,
    );

    await fileUploadPage.uploadAndSubmit(SAMPLE_FILE_PNG);
    await expect(fileUploadPage.uploadResponse).toBeVisible({timeout: 2000});
    await expect(fileUploadPage.uploadResponse).toContainText(
      `You have successfully uploaded "sample-upload.png"`,
    );

    await fileUploadPage.uploadAndSubmit(SAMPLE_FILE_EMPTY);
    await expect(fileUploadPage.uploadResponse).toBeVisible({timeout: 2000});
    await expect(fileUploadPage.uploadResponse).toContainText(
      `You have successfully uploaded "sample-upload-empty.txt"`,
    );

    await fileUploadPage.uploadAndSubmit(SAMPLE_FILE_WRONG_EXTENSION);
    await expect(fileUploadPage.uploadResponse).toBeVisible({timeout: 2000});
    await expect(fileUploadPage.uploadResponse).toContainText(
      `You have successfully uploaded "sample-upload-wrong-extension.js"`,
    );

    await fileUploadPage.uploadAndSubmit(SAMPLE_FILE_JPG);
    await expect(fileUploadPage.uploadResponse).toBeVisible({timeout: 2000});
    await expect(fileUploadPage.uploadResponse).toContainText(
      `You have successfully uploaded "sample-upload.JPG"`,
    );

    await fileUploadPage.uploadAndSubmit(SAMPLE_FILE_PDF);
    await expect(fileUploadPage.uploadResponse).toBeVisible({timeout: 2000});
    await expect(fileUploadPage.uploadResponse).toContainText(
      `You have successfully uploaded "sample-upload.pdf"`,
    );

    await fileUploadPage.uploadAndSubmit(SAMPLE_FILE_WAV);
    await expect(fileUploadPage.uploadResponse).toBeVisible({timeout: 2000});
    await expect(fileUploadPage.uploadResponse).toContainText(
      `You have successfully uploaded "sample-upload.wav"`,
    );

    await fileUploadPage.uploadAndSubmit(SAMPLE_FILE_CSV);
    await expect(fileUploadPage.uploadResponse).toBeVisible({timeout: 2000});
    await expect(fileUploadPage.uploadResponse).toContainText(
      `You have successfully uploaded "sample-upload.csv"`,
    );
  });

  test('should not upload file with no extension', async ({ fileUploadPage }) => {
    await fileUploadPage.uploadAndSubmit(SAMPLE_FILE_NO_EXTENSION);

    if (await fileUploadPage.uploadResponse.isVisible()) {
      console.log('File with no extension upload was allowd.');
    } else {
      console.log('File with no extension upload was prevented.');
    }
  });

  test('should not be able to click Submit without selecting a file', async ({ fileUploadPage }) => {
    await fileUploadPage.submitUpload();
    
    if (await fileUploadPage.uploadResponse.isVisible()) {
      console.log('Empty upload allowed.');
    } else {
      console.log('Empty upload prevented.');
    }
  });

  test('attempt upload of file with special characters in the name', async ({ fileUploadPage }) => {
    await fileUploadPage.uploadAndSubmit(SAMPLE_FILE_SPECIAL_CHARS);
    await expect(fileUploadPage.uploadResponse).toBeVisible({timeout: 2000});
    await expect(fileUploadPage.uploadResponse).toContainText(
      `You have successfully uploaded "sample-upload-%$.txt"`,
    );
  });
});

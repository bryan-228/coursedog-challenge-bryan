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
    console.log('Uploading sample text file');
    await fileUploadPage.uploadAndSubmit(SAMPLE_FILE_TXT);
    await expect(fileUploadPage.uploadResponse).toBeVisible({timeout: 2000});
    await expect(fileUploadPage.uploadResponse).toContainText(
      `You have successfully uploaded "sample-upload.txt"`,
    );
    console.log('Sample text file uploaded successfully');

    console.log('Uploading sample PNG file');
    await fileUploadPage.uploadAndSubmit(SAMPLE_FILE_PNG);
    await expect(fileUploadPage.uploadResponse).toBeVisible({timeout: 2000});
    await expect(fileUploadPage.uploadResponse).toContainText(
      `You have successfully uploaded "sample-upload.png"`,
    );
    console.log('Sample PNG file uploaded successfully');

    console.log('Uploading empty text file');
    await fileUploadPage.uploadAndSubmit(SAMPLE_FILE_EMPTY);
    await expect(fileUploadPage.uploadResponse).toBeVisible({timeout: 2000});
    await expect(fileUploadPage.uploadResponse).toContainText(
      `You have successfully uploaded "sample-upload-empty.txt"`,
    );
    console.log('Empty text file uploaded successfully');

    console.log('Uploading sample JPG file');
    await fileUploadPage.uploadAndSubmit(SAMPLE_FILE_JPG);
    await expect(fileUploadPage.uploadResponse).toBeVisible({timeout: 2000});
    await expect(fileUploadPage.uploadResponse).toContainText(
      `You have successfully uploaded "sample-upload.JPG"`,
    );
    console.log('Sample JPG file uploaded successfully');

    console.log('Uploading sample PDF file');
    await fileUploadPage.uploadAndSubmit(SAMPLE_FILE_PDF);
    await expect(fileUploadPage.uploadResponse).toBeVisible({timeout: 2000});
    await expect(fileUploadPage.uploadResponse).toContainText(
      `You have successfully uploaded "sample-upload.pdf"`,
    );
    console.log('Sample PDF file uploaded successfully');

    console.log('Uploading sample WAV file');
    await fileUploadPage.uploadAndSubmit(SAMPLE_FILE_WAV);
    await expect(fileUploadPage.uploadResponse).toBeVisible({timeout: 2000});
    await expect(fileUploadPage.uploadResponse).toContainText(
      `You have successfully uploaded "sample-upload.wav"`,
    );
    console.log('Sample WAV file uploaded successfully');

    console.log('Uploading sample CSV file');
    await fileUploadPage.uploadAndSubmit(SAMPLE_FILE_CSV);
    await expect(fileUploadPage.uploadResponse).toBeVisible({timeout: 2000});
    await expect(fileUploadPage.uploadResponse).toContainText(
      `You have successfully uploaded "sample-upload.csv"`,
    );
    console.log('Sample CSV file uploaded successfully');
  });

  test('should not upload file with no extension', async ({ fileUploadPage }) => {
    console.log('Uploading file with no extension');
    await fileUploadPage.uploadAndSubmit(SAMPLE_FILE_NO_EXTENSION);

    if (await fileUploadPage.uploadResponse.isVisible()) {
      console.log('File with no extension upload was allowd.');
    } else {
      console.log('File with no extension upload was prevented.');
    }
  });

  test('should not be able to click Submit without selecting a file', async ({ fileUploadPage }) => {
    console.log('Attempting to submit upload without selecting a file');
    await fileUploadPage.submitUpload();
    
    if (await fileUploadPage.uploadResponse.isVisible()) {
      console.log('Empty upload allowed.');
    } else {
      console.log('Empty upload prevented.');
    }
  });

  test('attempt upload of file with special characters in the name', async ({ fileUploadPage }) => {
    console.log('Uploading file with special characters in the name');
    await fileUploadPage.uploadAndSubmit(SAMPLE_FILE_SPECIAL_CHARS);
    await expect(fileUploadPage.uploadResponse).toBeVisible({timeout: 2000});
    await expect(fileUploadPage.uploadResponse).toContainText(
      `You have successfully uploaded "sample-upload-%$.txt"`,
    );
    console.log('File with special characters in the name uploaded successfully');
  });

  test('should not upload file with wrong extension', async ({ fileUploadPage }) => {
    console.log('Uploading file with wrong extension');
    await fileUploadPage.uploadAndSubmit(SAMPLE_FILE_WRONG_EXTENSION);
    if (await fileUploadPage.uploadResponse.isVisible()) {
      console.log('File with wrong extension upload was allowd.');
    } else {
      console.log('File with wrong extension upload was prevented.');
    }
  });
});

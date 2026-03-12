Coursedog QA Automation Challenge

<!-- NOTE: I have written comments in here as I do when others may have involvement with automation I write (so, all the time). They are purposely verbose and are intended to explain what I did and why, framed in a theoretical "anyone on the team can read this now or in the future and understand why this is the way it is" light. 
I have also added comments to all files in the project where it felt relevant.
-->


This document covers everything one needs to know to get started running and adding to the E2E test automation for the QA Practice app at https://qa-practice.netlify.app. 
-(3/11/2026) Current automation covers the e-commerce auth/order flow and file upload functionalities, as well as edge cases in those 2 areas. Additionally, some areas of security concern are covered.


Framework and Versions in tools used:

| Tool        | Version   |
|-------------|-----------|
| Playwright  | ^1.58     |
| TypeScript  | ^5.9      |
| Node.js     | 18+       |



---------------------------




SETUP INSTRUCTIONS


```bash
# 1. Install dependencies
npm install
# This installs @playwright/test since I put that in package.json. Having cloned
# the repo (and therefore having access to package.json, among everything else), you
# do not need to separately install Playwright, since that will be included in this command.

# 2. Install Playwright's Chromium browser. We could set it to use all
# browsers by removing 'chromium' from the command, but that's not necessary 
# for this project right now.
npx playwright install chromium
```




!!!!!
Commands to Run Tests 

```bash
# This runs all tests in headless mode (no browser visible)
npm test

# This runs all tests in headed mode (browser visible. Handy for writing early or new tests.)
npm run test:headed

# Runs tests with Playwright's interactive UI mode
npm run test:ui

# Runs tests in debug mode (so you can step through with inspector to debug)
npm run test:debug

# Opens the HTML test report after a run
npm run report
# or 
npx playwright show-report
```

Test Structure Overview 
(I had Claude Opus generate this since it does a good job making these charts)

```
├── fixtures/
│   └── index.ts              # Custom Playwright fixtures — extends `test` with page objects
├── pages/
│   ├── login.page.ts         # Login form page object
│   ├── products.page.ts      # Product catalog & shopping cart page object
│   ├── checkout.page.ts      # Shipping details & order submission page object
│   └── file-upload.page.ts   # File upload page object
├── tests/
│   ├── auth-ecommerce.spec.ts  # E-commerce flow: auth, cart, order, logout
│   └── file-upload.spec.ts     # File upload flow
├── test-data/
│   └── sample-upload.txt     # Sample file used in upload tests
└── playwright.config.ts      # Playwright configuration
```



Architecture

**Page Object Model**: I've created a dedicated class in the `pages/` folder for each page of the app. This is where I stored the locators I asked Opus to scan for. Tests never use raw selectors, and there are actions store in here for maximum modularity and extensibility.

**Custom Fixtures integrating our page object model**: `fixtures/index.ts` extends Playwright's built-in `test` object with the page object instances mentioned above (`loginPage`, `productsPage`, `checkoutPage`, `fileUploadPage`). Every test spec imports `test` and `expect` directly `../fixtures` instead of `@playwright/test`. When you add more page object files in the future (such as making tests beyond the ecommerce and file upload areas of the app), make sure to add those to `fixtures/index.ts` as well.
"Page" and "Request" are a few examples of built-in Playwright fixtures. We are adding our own here. When certain actions are going to be commonly used throughout all/most tests, fixtures function as essentially a custom command to maximally reduce code duplciation (and therefore further modularity and maintainability).

**Test Isolation**: Each test runs in a fresh browser context with no shared state. This is because each test.describe block starts a clean new browser instance. In some cases, you'll want multiple tests in the same describe block, but in our case, we don't (this is because no data created during any test run needs to stay persistent within the test itself to be acted upon by later steps.)

**Reusable Test Date**: Currently there is only one area that needed it (shipping info), but I created `test-data/formDetails.ts` as a container for shared simple data. In our case, `test/auth-ecommerce.spec.ts` and `tests/security.spec.ts` both fill out the Shipping Details form, so their data is abstracted to the formDetails.ts page.


(COME AND UPDATE THIS AFTER MANUALLY MESSING WITH TESTS)
Test Coverage

**E-commerce Auth and Order Flow** 
(Test file: `auth-ecommerce.spec.ts`)
- Login with valid credentials
- Login with invalid creds (should get error message)
- Add items to cart and verify amounts
- Add multiple items to cart
- Submit order with shipping details and verify confirmation
- Logout and verify return to login screen
- Full end-to-end happy path (login → cart → checkout → logout)

**File Upload** 
(Test file: `file-upload.spec.ts`)
- Upload a text file and verify success message

**Security**
(Test file: `security.spec.ts`)
- Intercept network response while adding item to cart, modify value to $0.00
- Intercept network response while adding item to cart, modify value to $-50.00



ADDITIONAL NOTES

*Functional Tests*
Ecommerce portion:

1.
Console warning "Form submission canceled because the form is not connected" appears on order submission / checkout (once Checkout button is clicked and order is confirmed). 
This appears to be a known issue with the practice site's form implementation and does not affect the functional outcome of the checkout flow.
Given that this is a 3rd-party practice site, we can't really do anything about this, but this is something I would report to the team for this site were I a member.

2. 
There is no Back button once on the Shipping Details page. Browser Back is also not an option in this case.
This forces user to Log Out to start over / select different items. This is something I would absolutely manually test for (and did, while scoping out what would need automated tests) but purposely did NOT write an automated test for because it seems to be a feature miss. 

*Security Tests*
Ecommerce portion: 

1. 
The ecommerce area calculates checkout values client-side in JS. There is no server-side validation (prices, totals, and order submission). This allows network call interception to occur and easily change the value of any items in the cart to any dollar amount, even negative values. Such vulnerabilities can be found manually with tools like Burpsuite, but Playwright has network interception capabilities as well. `tests/security.spec.ts` exploits this both with a $0 amount and a negative $ amount.
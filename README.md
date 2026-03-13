Coursedog QA Automation Challenge

I have written comments across the project as I normally do. They are purposely verbose and are intended to explain what I did and why.

I've also added console logging to the test specs and a Github Actions yml for pipeline usage. 

I chose the tests that are present because: 
1. Critical path / happy path scenarios were largely defined by the challenge already
2. Many edge cases presented themselves immediately
3. Many others (negative tests, security tests) came to mind as well from previous experience.


All aspects of the project are intended to be clear and maintainable.
This starts with the config-level files, then the env and env.config files, and fixtures, which are all explained further in the "Architecture" section below.



This document covers everything one needs to know to get started running and adding to the E2E test automation for the QA Practice app at https://qa-practice.netlify.app. 
-(3/13/2026) Current automation covers the e-commerce auth/order flow and file upload functionalities, as well as edge cases in those 2 areas. Additionally, some areas of security concern are covered.


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

# 2. Install Playwright's Chromium browser. 
npx playwright install chromium
# We could set it to use all browsers by removing 'chromium' from the command, 
# but that's not necessary for this project right now.
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

```
├── .github/
│   └── workflows/
│       └── e2e.yml              # GitHub Actions: run Playwright tests in CI
├── config/
│   └── env.config.ts            # Typed env vars (e.g. login credentials). Keeps ENV creds out of repo!!
├── fixtures/
│   └── index.ts                 # Custom fixtures — injects page objects into tests
├── pages/
│   ├── login.page.ts            # Login form page object
│   ├── products.page.ts         # Product catalog & shopping cart page object
│   ├── checkout.page.ts         # Shipping details & order submission page object
│   └── file-upload.page.ts      # File upload page object
├── test-data/
│   ├── commonObjects.ts         # Shared data (items, itemPrices, shippingDetails)
│   ├── helpers.ts               # Helper functions (e.g. addPrices for cart totals)
│   ├── sample-upload.txt        # Sample TXT file for upload tests
│   ├── sample-upload-%$.txt     # Special characters in filename
│   ├── sample-upload-empty.txt  # Empty file
│   ├── sample-upload-no-extension         # Sample file with no file extension
│   ├── sample-upload-wrong-extension.js   # Sample file with incorrected extension
│   ├── sample-upload.JPG        # Sample image
│   ├── sample-upload.csv        # Sample spreadsheet
│   ├── sample-upload.pdf        # Sample PDF
│   ├── sample-upload.png        # Another sample image
│   └── sample-upload.wav        # Sample audio file (doubles as a large file)
├── tests/
│   ├── auth-ecommerce.spec.ts   # E-commerce: auth, cart, order, logout, edge cases, SQLi
│   ├── file-upload.spec.ts      # File upload flow and edge cases
│   └── security.spec.ts         # Price tampering via network interception
├── .env.example                 # Template for env vars (copy to .env, not committed)
├── package.json
├── playwright.config.ts         # Playwright config (timeouts, baseURL, etc.)
└── tsconfig.json                
```



Architecture

**Page Object Model**: I've created a dedicated class in the `pages/` folder for each page of the app. This is where I stored the locators so tests never use raw selectors. There are actions store in here for maximum modularity and extensibility.

**Custom Fixtures integrating our page object model**: `fixtures/index.ts` extends Playwright's built-in `test` object with the page object instances mentioned above (`loginPage`, `productsPage`, `checkoutPage`, `fileUploadPage`). Every test spec imports `test` and `expect` directly from `../fixtures` instead of `@playwright/test`. When more page object files are added in the future (such as making tests beyond the ecommerce and file upload areas of the app), these need to be added to `fixtures/index.ts` as well.
"Page" and "Request" are a few examples of built-in Playwright fixtures. We are adding our own here. When certain actions are going to be commonly used throughout all/most tests, fixtures function as essentially a custom command to maximally reduce code duplciation (and therefore further modularity and maintainability).

**Test Isolation**: Each test runs in a fresh browser context with no shared state. This is because each test.describe block starts a clean new browser instance. In some cases, you'll want multiple tests in the same describe block, but in our case, we don't (this is because no data created during any test run needs to stay persistent within the test itself to be acted upon by later steps.)

**Reusable Test Data**: `test-data/commonObjects.ts` Is a container for shared simple data. In our case, `test/auth-ecommerce.spec.ts` and `tests/security.spec.ts` both fill out the Shipping Details form, so their data is abstracted to the `commonObjects.ts` page. Product names and Prices are also given names here.


TEST COVERAGE 

**E-commerce Auth and Order Flow** 
(Test file: `auth-ecommerce.spec.ts`)
- Login with valid credentials
- Login with invalid credentials (error message validation and negative cases)
- Add items to cart and verify item names, individual prices, and cart total (including helper-based totals)
- Add multiple different items to the cart and validate combined total
- Remove items, update quantities (including 0), and verify cart recalculations and empty-cart behavior
- Submit order with valid shipping details and verify confirmation content
- Attempt order submission with missing/empty shipping details and with an empty cart
- Logout and verify return to login screen and post-logout navigation behavior
- Full end-to-end happy path (login → cart → checkout → logout)

**File Upload** 
(Test file: `file-upload.spec.ts`)
- Upload a variety of file types and verify success message
- Additional edge cases: 
    - No file selected
    - File types that should not be allowed (special characters in file name, wrong extension, no extension)

**Security**
(Test file: `security.spec.ts`)
- Intercept network response while adding item to cart, modify value to $0.00 (currently vulnerable)
- Intercept network response while adding item to cart, modify value to $-50.00 (currently vulnerable)
- Attempt SQL injection on Login page (currently not vulnerable)

------------------------------------------------------------------------------------------------------------------------------------

ADDITIONAL NOTES

*Functional Tests*

1.
Console warning "Form submission canceled because the form is not connected" appears on order submission / checkout (once Checkout button is clicked and order is confirmed). 
This appears to be a known issue with the practice site's form implementation and does not affect the functional outcome of the checkout flow.
Given that this is a 3rd-party practice site, we can't really do anything about this, but this is something I would report to the team for this site were I a member.

2. 
There is no Back button once on the Shipping Details page. Browser Back is also not an option in this case.
This forces user to Log Out to start over / select different items. This is something I would absolutely manually test for (and did, while scoping out what would need automated tests) but purposely did NOT write an automated test for because it seems to be a feature miss. 

3.
There are a few tests that have an if/else statement at the end. These are for scenarios that are currently behaving in a way I would define as buggy. This is to demonstrate that this is something I would write a test about in a real scenario *once the issue was fixed* , but I didn't want the tests to fail here. So, instead, they just log the error in a console log and move on. In a working scenario, I would not write automated tests for a known-bug behavior until a fix was implemented, and these tests are simply to demonstrate that I took note of these areas' behavior.

*Security Tests*

1. 
The ecommerce area calculates checkout values client-side in JS. There is no server-side validation (prices, totals, and order submission). This allows network call interception to occur and easily change the value of any items in the cart to any dollar amount, even negative values. Such vulnerabilities can be found manually with tools like Burpsuite, but Playwright has network interception capabilities as well. `tests/security.spec.ts` exploits this both with a $0 amount and a negative $ amount.
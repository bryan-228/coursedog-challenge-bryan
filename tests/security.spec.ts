// AS NOTED IN THE README, this file is exposing a security flaw. 
// The test Passes for now. This is a security test, not a functional test, and
// should fail once the security flaw is fixed, and (after a theoretical fix is implemented) 
// be updated to pass if the app does NOT allow the price to be tampered with.

// More information on this vulnerability in the README.


import { test, expect } from '../fixtures';
import { ENV } from '../config/env.config';
import { shippingDetails } from '../test-data/commonObjects';

const { VALID_EMAIL, VALID_PASSWORD } = ENV;


test.describe('Security: Price Tampering via Network Interception', () => {
  test('should not allow checkout with $0.00 price', async ({
    page,
    loginPage,
    productsPage,
    checkoutPage,
  }) => {
    // Using page.route, we can intercept and modify the network response. THIS DOES NOT run quite yet...
    // it's setting a trap for when we actually go to the /auth_ecommerce endpoint.
    await page.route('**/auth_ecommerce', async (route) => {
      // fetch gets the request result without completing it, so we can modify from here
      const response = await route.fetch();
      let body = await response.text();
      
      body = body.replace(/\$\d+\.\d{2}/, '$0.00');
      await route.fulfill({ response, body });
    });

    // This triggers the request to /auth_ecommerce. This is where the trap above actually 
    // triggers. The response is modified in the route block, and then fulfilled 
    // with the modified response ($0.00)
    await loginPage.goto();


    // Logs in normally. We can login AFTER modifying the response, because the products have
    // already been rendered. Logging in doesn't trigger a page reload and stays on the same endpoint.
    // If it did, we could simply modify the endpoint in the route block, and still intercept the request.
    await loginPage.login(VALID_EMAIL, VALID_PASSWORD);
    await expect(loginPage.logoutLink).toBeVisible();

    // First product in list has already been changed to be $0.00, so that's what we'll add to the cart.
    const tamperedProduct = productsPage.shopItems.filter({ hasText: '$0.00' }).first();
    await expect(tamperedProduct).toBeVisible();
    await tamperedProduct.locator('.shop-item-button').click();

    await expect(productsPage.getCartItemPrice(0)).toHaveText('$0.00');
    await expect(productsPage.cartTotalPrice).toContainText('$0');

    await productsPage.proceedToCheckout();
    await checkoutPage.fillAndSubmitOrder(shippingDetails);

    // VULNERABILITY: The site accepts a $0 order with no server-side price validation.
    // A secure implementation would reject this or recalculate the total server-side.
    await expect(checkoutPage.orderMessage).toContainText('$0');
    if ((await checkoutPage.orderMessage.textContent())?.includes('$0')) {
      console.log('$0 security exploit: Order is for $0. Security flaw exploited.');
    } else {
      console.log('$0 security exploit: Order is not for $0. Security flaw NOT exploited.');
    }
  });

  // See comments above for in-depth explanation of this vulnerability. This test does 
  // the same thing in the same ways, just with a negative price.
  test('should not allow checkout with a negative price', async ({
    page,
    loginPage,
    productsPage,
    checkoutPage,
  }) => {
    await page.route('**/auth_ecommerce', async (route) => {
      const response = await route.fetch();
      let body = await response.text();
      body = body.replace(/\$\d+\.\d{2}/, '$-50.00');
      await route.fulfill({ response, body });
    });

    await loginPage.goto();
    await loginPage.login(VALID_EMAIL, VALID_PASSWORD);
    await expect(loginPage.logoutLink).toBeVisible();

    const tamperedProduct = productsPage.shopItems.filter({ hasText: '$-50.00' }).first();
    await expect(tamperedProduct).toBeVisible();
    await tamperedProduct.locator('.shop-item-button').click();

    await expect(productsPage.getCartItemPrice(0)).toHaveText('$-50.00');

    await productsPage.proceedToCheckout();
    await checkoutPage.fillAndSubmitOrder(shippingDetails);

    await expect(checkoutPage.orderMessage).toContainText('$-50');
    if ((await checkoutPage.orderMessage.textContent())?.includes('$-50')) {
      console.log('$-50 security exploit: Order is for $-50. Security flaw exploited.');
    } else {
      console.log('$-50 security exploit: Negative price not found in checkout confirmation. Security flaw NOT exploited.');
    }
  });
});

// add SQL injection / XSS in login fields (boundary) attack
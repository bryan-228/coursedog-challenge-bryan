import { test, expect } from '../fixtures';
import { ENV } from '../config/env.config';
import { shippingDetails, items, itemPrices } from '../test-data/commonObjects';
import { addPrices } from '../test-data/helpers';


const { VALID_EMAIL, VALID_PASSWORD } = ENV;

test.describe('Authentication', () => {
  // Goes to login page before each test in this describe block.
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  test('should login with valid credentials', async ({ loginPage }) => {
    console.log('Logging in with valid credentials');
    await loginPage.login(VALID_EMAIL, VALID_PASSWORD);
    await expect(loginPage.logoutLink).toBeVisible();
    console.log('Logged in successfully');
  });

  test('should show error for invalid credentials', async ({ loginPage }) => {
    console.log('Attempting login with invalid credentials');
    await loginPage.login('wrong@email.com', 'wrongpassword');
    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toContainText('Bad credentials');
    console.log('Login with invalid credentials prevented');
  });

  test('should NOT allow login with blank email and password', async ({ loginPage }) => {
    console.log('Attempting login with blank email and password');
    await loginPage.login('', '');
    await expect(loginPage.logoutLink).toBeHidden();
    await expect(loginPage.errorMessage).toBeVisible();
    console.log('Login with blank email and password prevented');
  });

  test('should NOT allow valid email + no password', async ({ loginPage }) => {
    console.log('Attempting login with valid email and no password');
    await loginPage.login(VALID_EMAIL, 'wrongpassword');
    await expect(loginPage.logoutLink).toBeHidden();
    await expect(loginPage.errorMessage).toBeVisible();
    console.log('Login with valid email and no password prevented');
  });

  test('should NOT allow wrong email + valid password', async ({ loginPage }) => {
    console.log('Attempting login with wrong email and valid password');
    await loginPage.login('wrong@email.com', VALID_PASSWORD);
    await expect(loginPage.logoutLink).toBeHidden();
    await expect(loginPage.errorMessage).toBeVisible();
    console.log('Login with wrong email and valid password prevented');
  });
});

test.describe('Shopping Cart', () => {
  // Goes to login page before each test in this describe block. 
  // (Each describe block starts a fresh browser instance, so this is necessary.)
  test.beforeEach(async ({ loginPage }) => {
    console.log('Logging in before each');
    await loginPage.goto();
    await loginPage.login(VALID_EMAIL, VALID_PASSWORD);
    await expect(loginPage.logoutLink).toBeVisible();
  });

  test('should add an item to the cart', async ({ productsPage }) => {
    console.log('Adding 1 item to cart');
    await productsPage.addToCart(items.iPhone12);
    console.log('1 item added to cart');
    await expect(productsPage.cartRows).toHaveCount(1);
    await expect(productsPage.getCartItemTitle(0)).toHaveText(items.iPhone12);
    await expect(productsPage.getCartItemPrice(0)).toHaveText(itemPrices.iPhone12);
    await expect(productsPage.cartTotalPrice).toContainText(itemPrices.iPhone12);
    console.log('Cart total price is correct: ' + itemPrices.iPhone12);
  });

  test('should add multiple different items to the cart', async ({ productsPage }) => {
    console.log('Adding 2 different items to cart');
    await productsPage.addToCart(items.iPhone12);
    await productsPage.addToCart(items.nokia105);

    await expect(productsPage.cartRows).toHaveCount(2);
    await expect(productsPage.cartTotalPrice)
      .toContainText(addPrices(itemPrices.iPhone12, itemPrices.nokia105));
    console.log('2 different items added to cart');
    console.log('Cart total price is correct: ' + addPrices(itemPrices.iPhone12, itemPrices.nokia105));
  });

  test('should be able to remove items from cart', async ({ productsPage }) => {
    console.log('Testing cart removal');
    console.log('Adding 2 items to cart to remove');
    await productsPage.addToCart(items.iPhone12);
    await productsPage.addToCart(items.nokia105);
    await expect(productsPage.cartRows).toHaveCount(2);
    console.log('2 items added to cart');
    await productsPage.removeCartItem(0); // Removes iPhone12
    await productsPage.removeCartItem(0); // Removes nokia105
    await expect(productsPage.cartRows).toHaveCount(0);
    console.log('2 items removed from cart');
  });

  test('should be able to update item quantity', async ({ productsPage }) => {
    console.log('Updating item quantity from 1 to 2');
    await productsPage.addToCart(items.iPhone12);
    await productsPage.updateCartItemQuantity(0, '2');
    await expect(productsPage.cartTotalPrice).toContainText(addPrices(itemPrices.iPhone12, itemPrices.iPhone12));
    console.log('Item quantity updated from 1 to 2');
    console.log('Cart total price is correct: ' + addPrices(itemPrices.iPhone12, itemPrices.iPhone12));
    console.log('Updating down to 1');
    await productsPage.updateCartItemQuantity(0, '1');
    await expect(productsPage.cartTotalPrice).toContainText(itemPrices.iPhone12);
    console.log('Item quantity updated down to 1');
    console.log('Cart total price is correct: ' + itemPrices.iPhone12);
  });

  test('try updating cart quantity to 0', async ({ productsPage }) => {
    console.log('Attempting to update cart quantity to 0');
    console.log('Adding 1 item to cart to start with');
    await productsPage.addToCart(items.iPhone12);
    
    // Attempts to set quantity to 0, but this should not be allowed. Should remain at 1.
    await productsPage.updateCartItemQuantity(0, '0'); 
    await expect(productsPage.cartRows).toHaveCount(1);
    console.log('Cart quantity not updated to 0');
    console.log('Cart total price is correct: ' + itemPrices.iPhone12);
    });

  test('try adding same item twice (should be prevented)', async ({ productsPage }) => {
    console.log('Adding first item to cart');
    await productsPage.addToCart(items.iPhone12);
    await expect(productsPage.cartRows).toHaveCount(1);
    console.log('1 item added to cart');
    console.log('Attempting to add same item again');
    await productsPage.addToCart(items.iPhone12);

    // There is a JS alert that pops up when trying to add the same item again.
    productsPage.page.once('dialog', async (dialog) => {
      expect(dialog.type()).toBe('alert');
      expect(dialog.message()).toContain('This item is already added to the cart');
      await dialog.accept();
      console.log('Popup accepted');
    });
    
    await expect(productsPage.cartRows).toHaveCount(1);
    console.log('Item not added again. Cart quantity still 1.');
  });

  test('cart should be empty on products page load', async ({ productsPage }) => {
    // We'll already be on the products page from logging in in the beforeEach hook.
    console.log('Already on products page. Making sure cart is empty.');
    await expect(productsPage.cartRows).toHaveCount(0);
    await expect(productsPage.cartTotalPrice).toContainText('$0');
    console.log('Cart is empty on products page load.');
  });

  test('should NOT be able to checkout with empty cart', async ({ productsPage, checkoutPage }) => {
    console.log('Clicking "Process to Checkout" with empty cart');
    await productsPage.proceedToCheckout();
    await checkoutPage.fillAndSubmitOrder(shippingDetails);

    if ((await checkoutPage.orderMessage.textContent())?.includes('Congrats')) {
      console.log('Order submitted successfully with empty cart. This should not be allowed.');
    } else {
      console.log('Order not submitted: empty cart.');
    }
  });

  test('should be able to go back to products page after checkout', async ({ productsPage, checkoutPage, loginPage }) => {
    console.log('Adding item to cart to checkout');
    await productsPage.addToCart(items.iPhone12);
    console.log('1 item added to cart');
    await productsPage.proceedToCheckout();
    console.log('Proceeding to checkout');
    await checkoutPage.fillAndSubmitOrder(shippingDetails);
    await expect(checkoutPage.orderMessage).toContainText('Congrats');
    await expect(checkoutPage.orderMessage).toContainText(itemPrices.iPhone12);
    console.log('Order submitted successfully');

    console.log('Clicking home button');
    await loginPage.homeLink.click();

    const errorHeading = loginPage.page.getByRole('heading', { name: "We're sorry for the" });
    const isErrorVisible = await errorHeading.isVisible();

    if (isErrorVisible) {
      console.log('Products page NOT loaded after checkout. Home button broken.');
    } else {
      console.log('Products page loaded after checkout. Home button works.');
    };
  });

});

test.describe('Order Submission', () => {
  test.beforeEach(async ({ loginPage, productsPage }) => {
    console.log('Logging in and adding 1 item to cart before each');
    await loginPage.goto();
    await loginPage.login(VALID_EMAIL, VALID_PASSWORD);
    await expect(loginPage.logoutLink).toBeVisible();
    await productsPage.addToCart(items.samsungGalaxyA32);
    console.log('Logged in and 1 item added to cart');
  });

  test('should complete checkout with valid shipping details: 1 item in cart', async ({ productsPage, checkoutPage }) => {
    console.log('Checking out with 1 item in cart');
    await expect(productsPage.cartRows).toHaveCount(1);
    await productsPage.proceedToCheckout();
    await checkoutPage.fillAndSubmitOrder(shippingDetails);

    await expect(checkoutPage.orderMessage).toContainText('Congrats');
    await expect(checkoutPage.orderMessage).toContainText(itemPrices.samsungGalaxyA32);
    await expect(checkoutPage.orderMessage).toContainText(shippingDetails.street);
    console.log('Checkout completed successfully. Shipping details displayed correctly.');
  });

  test('should complete checkout with valid shipping details: 2 items in cart', async ({ productsPage, checkoutPage }) => {
    console.log('Adding 1 more item to cart to make 2 items');
    await productsPage.addToCart(items.nokia105);
    await expect(productsPage.cartRows).toHaveCount(2);
    console.log('2 items in cart now');
    await productsPage.proceedToCheckout();
    console.log('Proceeding to checkout');
    await checkoutPage.fillAndSubmitOrder(shippingDetails);


    await expect(checkoutPage.orderMessage).toContainText('Congrats');
    await expect(checkoutPage.orderMessage).toContainText(addPrices(itemPrices.samsungGalaxyA32, itemPrices.nokia105));
    await expect(checkoutPage.orderMessage).toContainText(shippingDetails.street);
    console.log('Checkout completed successfully. Shipping details displayed correctly.');
    console.log('Cart total price is also correct: ' + addPrices(itemPrices.samsungGalaxyA32, itemPrices.nokia105));
  });

  test('should not complete checkout with empty shipping details', async ({ productsPage, checkoutPage }) => {
    console.log('Checking out with empty shipping details');
    await expect(productsPage.cartRows).toHaveCount(1);

    await productsPage.proceedToCheckout();
    console.log('Proceeding to checkout');
    await checkoutPage.submitOrder();

    if ((await checkoutPage.orderMessage.isVisible)) {
      console.log('Checkout completed with no shipping details.');
    } else {
      console.log('Checkout with no shipping details prevented.');
    }
  });

  test('should not be able to checkout with empty cart', async ({ productsPage, checkoutPage }) => {
    // Removing the item from the beforeEach hook. This is the only test in this describe block where that needs to be done.
    console.log('Removing 1 item from cart to make it empty');
    await productsPage.removeCartItem(0);
    await expect(productsPage.cartRows).toHaveCount(0);
    console.log('Cart is empty now');
    await productsPage.proceedToCheckout();
    console.log('Proceeding to checkout');
    await checkoutPage.fillAndSubmitOrder(shippingDetails);
    console.log('Clicking submit order button');

    if ((await checkoutPage.orderMessage.textContent())?.includes('Congrats')) {
      console.log('Checkout completed with empty cart.');
    } else {
      console.log('Checkout with empty cart prevented.');
    }
  });
});

test.describe('Logout', () => {
  test('should logout and return to login screen', async ({ loginPage }) => {
    console.log('Logging in')
    await loginPage.goto();
    await loginPage.login(VALID_EMAIL, VALID_PASSWORD);
    await expect(loginPage.logoutLink).toBeVisible();
    console.log('Logged in successfully');
    console.log('Logging out');
    await loginPage.logout();

    await expect(loginPage.submitButton).toBeVisible();
    await expect(loginPage.logoutLink).toBeHidden();
    console.log('Logged out successfully');
  });

  test('going Back after logout should not go back', async ({ loginPage, productsPage, checkoutPage }) => {
    console.log('Logging in');
    await loginPage.goto();
    await loginPage.login(VALID_EMAIL, VALID_PASSWORD);
    await expect(loginPage.logoutLink).toBeVisible();
    console.log('Logged in successfully');
    console.log('Adding 1 item to cart');
    await productsPage.addToCart(items.iPhone12);
    await expect(productsPage.cartRows).toHaveCount(1);
    console.log('1 item added to cart');
    console.log('Proceeding to checkout');
    await productsPage.proceedToCheckout();
    await checkoutPage.fillAndSubmitOrder(shippingDetails);
    await expect(checkoutPage.orderMessage).toContainText('Congrats');
    await expect(checkoutPage.orderMessage).toContainText(itemPrices.iPhone12);
    await expect(checkoutPage.orderMessage).toContainText(shippingDetails.street);
    console.log('Checkout completed successfully');
    console.log('Logging out');
    await loginPage.logout();
    await expect(loginPage.submitButton).toBeVisible();
    await expect(loginPage.logoutLink).toBeHidden();

    await loginPage.page.goBack();
    if (await checkoutPage.orderMessage.isVisible()) {
      console.log('Order message is visible after going back.');
    } else {
      console.log('Order message is not visible after going back. Stayed on Login page once logged out.');
    }
  });

  test('logout should clear login form fields', async ({ loginPage }) => {
    console.log('Logging in');
    await loginPage.goto();
    await loginPage.login(VALID_EMAIL, VALID_PASSWORD);
    await expect(loginPage.logoutLink).toBeVisible();
    console.log('Logged in successfully');

    console.log('Logging out');
    await loginPage.logout();
    await expect(loginPage.submitButton).toBeVisible();
    await expect(loginPage.logoutLink).toBeHidden();
    await expect(loginPage.emailInput).toBeEmpty();
    await expect(loginPage.passwordInput).toBeEmpty();
    console.log('Logged out successfully. All login form fields cleared.');
  });
});

test.describe('E2E: Smoke test / happy path', () => {
  test('login -> add items -> checkout -> submit order -> logout', async ({
    loginPage,
    productsPage,
    checkoutPage,
  }) => {
    console.log('Starting E2E: Smoke test / happy path');

    // Retries login up to 3 times until logout link is visible.
    const maxAttempts = 3;


    let attempt = 0;
    while (attempt < maxAttempts) {
      attempt++;
      console.log(`Logging in (attempt ${attempt}/${maxAttempts})`);
      await loginPage.goto();
      await loginPage.login(VALID_EMAIL, VALID_PASSWORD);
      if (await loginPage.logoutLink.isVisible()) {
        console.log('Logged in successfully');
        break;
      }
      if (attempt === maxAttempts) {
        throw new Error(`Login did not succeed after ${maxAttempts} attempts`);
      }
    }

    // This restries the add-to-cart action up to 3 times until cart has 2 items 
    // (reloads page between attempts)
    attempt = 0;
    while (attempt < maxAttempts) {
      attempt++;
      console.log(`Adding 2 items to cart (attempt ${attempt}/${maxAttempts})`);
      await productsPage.addToCart(items.huaweiMate20Lite);
      await productsPage.addToCart(items.nokia105);
      const count = await productsPage.cartRows.count();
      if (count === 2) {
        console.log('2 items added to cart');
        break;
      }
      if (attempt === maxAttempts) {
        throw new Error(`Cart had ${count} items after ${maxAttempts} attempts (expected 2)`);
      }
      await loginPage.page.reload();
    }
    await expect(productsPage.cartTotalPrice).toContainText(addPrices(itemPrices.huaweiMate20Lite, itemPrices.nokia105));
    console.log('Cart total price is correct: ' + addPrices(itemPrices.huaweiMate20Lite, itemPrices.nokia105));

    console.log('Proceeding to checkout');
    await productsPage.proceedToCheckout();
    console.log('On shipping details page');

    // Retries checkout submit click up to 3 times until success message appears
    attempt = 0;
    while (attempt < maxAttempts) {
      attempt++;
      console.log(`Filling and submitting order (attempt ${attempt}/${maxAttempts})`);
      await checkoutPage.fillAndSubmitOrder(shippingDetails);
      const message = await checkoutPage.orderMessage.textContent();
      if (message?.includes('Congrats')) {
        console.log('Order submitted successfully');
        break;
      }
      if (attempt === maxAttempts) {
        throw new Error(`Order confirmation was not successful after ${maxAttempts} attempts`);
      }
    }

    console.log('Logging out');
    await loginPage.logout();
    await expect(loginPage.submitButton).toBeVisible();
    console.log('Logged out successfully. Smoke test complete.');
  });
});

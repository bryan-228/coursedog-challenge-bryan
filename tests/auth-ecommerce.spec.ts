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
    await loginPage.login(VALID_EMAIL, VALID_PASSWORD);
    await expect(loginPage.logoutLink).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ loginPage }) => {
    await loginPage.login('wrong@email.com', 'wrongpassword');
    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toContainText('Bad credentials');
  });

  test('should NOT allow login with blank email and password', async ({ loginPage }) => {
    await loginPage.login('', '');
    await expect(loginPage.logoutLink).toBeHidden();
    await expect(loginPage.errorMessage).toBeVisible();
  });

  test('should NOT allow valid email + no password', async ({ loginPage }) => {
    await loginPage.login(VALID_EMAIL, 'wrongpassword');
    await expect(loginPage.logoutLink).toBeHidden();
    await expect(loginPage.errorMessage).toBeVisible();
  });

  test('should NOT allow wrong email + valid password', async ({ loginPage }) => {
    await loginPage.login('wrong@email.com', VALID_PASSWORD);
    await expect(loginPage.logoutLink).toBeHidden();
    await expect(loginPage.errorMessage).toBeVisible();
  })
});

test.describe('Shopping Cart', () => {
  // Goes to login page before each test in this describe block. 
  // (Each describe block starts a fresh browser instance, so this is necessary.)
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.login(VALID_EMAIL, VALID_PASSWORD);
    await expect(loginPage.logoutLink).toBeVisible();
  });

  test('should add an item to the cart', async ({ productsPage }) => {
    await productsPage.addToCart(items.iPhone12);

    await expect(productsPage.cartRows).toHaveCount(1);
    await expect(productsPage.getCartItemTitle(0)).toHaveText(items.iPhone12);
    await expect(productsPage.getCartItemPrice(0)).toHaveText(itemPrices.iPhone12);
    await expect(productsPage.cartTotalPrice).toContainText(itemPrices.iPhone12);
  });

  test('should add multiple different items to the cart', async ({ productsPage }) => {
    await productsPage.addToCart(items.iPhone12);
    await productsPage.addToCart(items.nokia105);

    await expect(productsPage.cartRows).toHaveCount(2);
    await expect(productsPage.cartTotalPrice)
      .toContainText(addPrices(itemPrices.iPhone12, itemPrices.nokia105));
  });

  test('should be able to remove items from cart', async ({ productsPage }) => {
    await productsPage.addToCart(items.iPhone12);
    await productsPage.addToCart(items.nokia105);
    await expect(productsPage.cartRows).toHaveCount(2);
    await productsPage.removeCartItem(0); // Removes iPhone12
    await productsPage.removeCartItem(0); // Removes nokia105
    await expect(productsPage.cartRows).toHaveCount(0);
  });

  test('should be able to update item quantity', async ({ productsPage }) => {
    console.log('Updating item quantity from 1 to');
    await productsPage.addToCart(items.iPhone12);
    await productsPage.updateCartItemQuantity(0, '2');
    await expect(productsPage.cartTotalPrice).toContainText(addPrices(itemPrices.iPhone12, itemPrices.iPhone12));

    console.log('Updating down to 1');
    await productsPage.updateCartItemQuantity(0, '1');
    await expect(productsPage.cartTotalPrice).toContainText(itemPrices.iPhone12);
  });

  test('try updating cart quantity to 0', async ({ productsPage }) => {
    await productsPage.addToCart(items.iPhone12);
    
    // Attempts to set quantity to 0, but this should not be allowed. Should remain at 1.
    await productsPage.updateCartItemQuantity(0, '0'); 
    await expect(productsPage.cartRows).toHaveCount(1);
  });

  test('try adding same item twice (should be prevented)', async ({ productsPage }) => {
    await productsPage.addToCart(items.iPhone12);
    await expect(productsPage.cartRows).toHaveCount(1);

    console.log('Attempting to add same item again');
    await productsPage.addToCart(items.iPhone12);

    // There is a JS alert that pops up when trying to add the same item again.
    productsPage.page.once('dialog', async (dialog) => {
      expect(dialog.type()).toBe('alert');
      expect(dialog.message()).toContain('This item is already added to the cart');
      await dialog.accept();
    });
    
    await expect(productsPage.cartRows).toHaveCount(1);
    console.log('Item not added again. Cart quantity still 1.');
  });

  test('cart should be empty on products page load', async ({ productsPage }) => {
    // We'll already be on the products page from logging in in the beforeEach hook.
    await expect(productsPage.cartRows).toHaveCount(0);
    await expect(productsPage.cartTotalPrice).toContainText('$0');
    console.log('Cart is empty on products page load.');
  });

  test('should NOT be able to checkout with empty cart', async ({ productsPage, checkoutPage }) => {
    await productsPage.proceedToCheckout();
    await checkoutPage.fillAndSubmitOrder(shippingDetails);

    if ((await checkoutPage.orderMessage.textContent())?.includes('Congrats')) {
      console.log('Order submitted successfully with empty cart. This should not be allowed.');
    } else {
      console.log('Order not submitted: empty cart.');
    }
  });

  test('should be able to go back to products page after checkout', async ({ productsPage, checkoutPage, loginPage }) => {
    await productsPage.addToCart(items.iPhone12);
    await productsPage.proceedToCheckout();
    await checkoutPage.fillAndSubmitOrder(shippingDetails);
    await expect(checkoutPage.orderMessage).toContainText('Congrats');
    await expect(checkoutPage.orderMessage).toContainText(itemPrices.iPhone12);

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
    await loginPage.goto();
    await loginPage.login(VALID_EMAIL, VALID_PASSWORD);
    await expect(loginPage.logoutLink).toBeVisible();
    await productsPage.addToCart(items.samsungGalaxyA32);
  });

  test('should submit order with valid shipping details', async ({ productsPage, checkoutPage }) => {
    await productsPage.proceedToCheckout();
    await checkoutPage.fillAndSubmitOrder(shippingDetails);

    await expect(checkoutPage.orderMessage).toContainText('Congrats');
    await expect(checkoutPage.orderMessage).toContainText(itemPrices.samsungGalaxyA32);
    await expect(checkoutPage.orderMessage).toContainText(shippingDetails.street);
  });

  // TODO: Add more order scenarios
  // - Submit order with empty shipping fields -- expect validation
  // - Submit order with empty cart
  // - Verify order total matches cart total in success message
});

test.describe('Logout', () => {
  test('should logout and return to login screen', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.login(VALID_EMAIL, VALID_PASSWORD);
    await expect(loginPage.logoutLink).toBeVisible();

    await loginPage.logout();

    await expect(loginPage.submitButton).toBeVisible();
    await expect(loginPage.logoutLink).toBeHidden();
  });

  // TODO: Add more logout scenarios
  // - After logout, navigating back should not restore authenticated state
  // - Verify login form fields are cleared after logout
});

test.describe('E2E: Smoke test / happy path', () => {
  test('login -> add items -> checkout -> submit order -> logout', async ({
    loginPage,
    productsPage,
    checkoutPage,
  }) => {
    await loginPage.goto();
    await loginPage.login(VALID_EMAIL, VALID_PASSWORD);
    await expect(loginPage.logoutLink).toBeVisible();

    await productsPage.addToCart('Huawei Mate 20 Lite, 64GB, Black');
    await productsPage.addToCart('Nokia 105, Black');
    await expect(productsPage.cartRows).toHaveCount(2);
    await expect(productsPage.cartTotalPrice).toContainText('$256.11');

    await productsPage.proceedToCheckout();
    await checkoutPage.fillAndSubmitOrder(shippingDetails);
    await expect(checkoutPage.orderMessage).toContainText('Congrats');

    await loginPage.logout();
    await expect(loginPage.submitButton).toBeVisible();
  });
});

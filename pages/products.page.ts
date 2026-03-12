import { type Page, type Locator } from '@playwright/test';

export class ProductsPage {
  readonly page: Page;
  readonly shopItems: Locator;
  readonly cartItems: Locator;
  readonly cartRows: Locator;
  readonly cartTotalPrice: Locator;
  readonly proceedToCheckoutButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.shopItems = page.locator('.shop-item');
    this.cartItems = page.locator('.cart-items');
    this.cartRows = page.locator('.cart-items .cart-row');
    this.cartTotalPrice = page.locator('.cart-total-price');
    this.proceedToCheckoutButton = page.locator('.btn-purchase');
  }

  getProductByName(name: string) {
    return this.page.locator('.shop-item', { hasText: name });
  }

  getAddToCartButton(productName: string) {
    return this.getProductByName(productName).locator('.shop-item-button');
  }

  getProductPrice(productName: string) {
    return this.getProductByName(productName).locator('.shop-item-price');
  }

  getCartItemTitle(index: number) {
    return this.cartRows.nth(index).locator('.cart-item-title');
  }

  getCartItemPrice(index: number) {
    return this.cartRows.nth(index).locator('.cart-price');
  }

  getCartItemQuantityInput(index: number) {
    return this.cartRows.nth(index).locator('.cart-quantity-input');
  }

  getCartItemRemoveButton(index: number) {
    return this.cartRows.nth(index).locator('.btn-danger');
  }

  // Clicks the "Add to Cart" button for the given product name.
  async addToCart(productName: string) {
    await this.getAddToCartButton(productName).click();
  }

  // Clicks the "Remove" button for the given item.
  async removeCartItem(index: number) {
    await this.getCartItemRemoveButton(index).click();
  }

  // Updates the quantity of the given item index to the given quantity.
  async updateCartItemQuantity(index: number, quantity: string) {
    const input = this.getCartItemQuantityInput(index);
    await input.clear();
    await input.fill(quantity);
    await input.press('Enter');
  }

  async proceedToCheckout() {
    await this.proceedToCheckoutButton.click();
  }
}

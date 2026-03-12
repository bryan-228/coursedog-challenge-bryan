import { type Page, type Locator } from '@playwright/test';

export interface ShippingDetails {
  phone: string;
  street: string;
  city: string;
  country: string;
}

export class CheckoutPage {
  readonly page: Page;
  readonly shippingForm: Locator;
  readonly phoneInput: Locator;
  readonly streetInput: Locator;
  readonly cityInput: Locator;
  readonly countryDropdown: Locator;
  readonly submitOrderButton: Locator;
  readonly orderMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.shippingForm = page.locator('#shippingForm');
    this.phoneInput = page.locator('#phone');
    this.streetInput = page.locator('input[name="street"]');
    this.cityInput = page.locator('input[name="city"]');
    this.countryDropdown = page.locator('#countries_dropdown_menu');
    this.submitOrderButton = page.locator('#submitOrderBtn');
    this.orderMessage = page.locator('#message');
  }

  async fillShippingDetails(details: ShippingDetails) {
    await this.phoneInput.fill(details.phone);
    await this.streetInput.fill(details.street);
    await this.cityInput.fill(details.city);
    await this.countryDropdown.selectOption(details.country);
  }

  async submitOrder() {
    await this.submitOrderButton.click();
  }

  async fillAndSubmitOrder(details: ShippingDetails) {
    await this.fillShippingDetails(details);
    await this.submitOrder();
  }
}

import { getShipping } from '../../checkout-state.js';
import { field, orderSummary, panel, stepper } from './layout.js';

export function createAddressView(getCart) {
  return {
    name: 'checkout-address',
    mount(app) {
      const shipping = getShipping() ?? {};

      app.innerHTML = `
        <section data-testid="checkout-address-page" class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
          ${panel(`
            ${stepper(1)}
            <h2 class="text-xl font-bold text-gray-900 mb-1">Shipping address</h2>
            <p class="text-sm text-gray-500 mb-5">Where should we send your order?</p>
            <div class="space-y-4">
              ${field({ id: 'shipping-name', testid: 'shipping-name-input', label: 'Full name', value: shipping.name, autocomplete: 'name' })}
              ${field({ id: 'shipping-email', testid: 'shipping-email-input', label: 'Email', value: shipping.email, type: 'email', autocomplete: 'email' })}
              ${field({ id: 'shipping-address', testid: 'shipping-address-input', label: 'Street address', value: shipping.address, autocomplete: 'street-address' })}
              <div class="grid gap-4 sm:grid-cols-2">
                ${field({ id: 'shipping-city', testid: 'shipping-city-input', label: 'City', value: shipping.city, autocomplete: 'address-level2' })}
                ${field({ id: 'shipping-zip', testid: 'shipping-zip-input', label: 'Postal code', value: shipping.zip, autocomplete: 'postal-code' })}
              </div>
              <button
                data-action="checkout-continue"
                data-testid="checkout-continue-btn"
                class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors cursor-pointer"
              >Continue to Payment</button>
            </div>
          `)}
          ${panel(orderSummary(getCart()), 'lg:sticky lg:top-6')}
        </section>`;
    },
  };
}

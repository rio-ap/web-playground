import { getPayment, getShipping } from '../../checkout-state.js';
import { detectCardBrand } from '../../payment.js';
import { formatPrice } from '../../products.js';
import { getSubtotal } from '../../cart.js';
import { escapeHtml, itemList, orderSummary, panel, stepper } from './layout.js';

function brandLabel(brand) {
  return brand ? brand.charAt(0).toUpperCase() + brand.slice(1) : 'Card';
}

export function createReviewView(getCart) {
  return {
    name: 'checkout-review',
    mount(app) {
      const cart = getCart();
      const shipping = getShipping() ?? {};
      const payment = getPayment() ?? {};
      const lastFour = String(payment.cardNumber ?? '').replace(/\D/g, '').slice(-4);

      app.innerHTML = `
        <section data-testid="checkout-review-page" class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
          ${panel(`
            ${stepper(3)}
            <h2 class="text-xl font-bold text-gray-900 mb-5">Review your order</h2>
            <div data-testid="review-shipping" class="rounded-xl border border-gray-200 p-4 mb-3">
              <p class="text-xs font-bold uppercase tracking-wide text-gray-500 mb-1">Ship to</p>
              <p class="text-sm text-gray-900">${escapeHtml(shipping.name)} · ${escapeHtml(shipping.address)}, ${escapeHtml(shipping.city)} ${escapeHtml(shipping.zip)}</p>
              <p class="text-sm text-gray-500">${escapeHtml(shipping.email)}</p>
            </div>
            <div data-testid="review-payment" class="rounded-xl border border-gray-200 p-4 mb-4">
              <p class="text-xs font-bold uppercase tracking-wide text-gray-500 mb-1">Payment</p>
              <p class="text-sm text-gray-900">${brandLabel(detectCardBrand(payment.cardNumber))} ending ${escapeHtml(lastFour)} · expires ${escapeHtml(payment.expiry)}</p>
            </div>
            <h3 class="text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">Items</h3>
            <div data-testid="review-items">${itemList(cart)}</div>
          `)}
          ${panel(`${orderSummary(cart, { tax: true, items: false })}
            <button
              data-action="place-order"
              data-testid="place-order-btn"
              class="mt-5 w-full bg-green-700 hover:bg-green-800 text-white font-semibold py-3 px-4 rounded-lg transition-colors cursor-pointer"
            >Place Order · ${formatPrice(getSubtotal(cart))}</button>
          `, 'lg:sticky lg:top-6')}
        </section>`;
    },
  };
}

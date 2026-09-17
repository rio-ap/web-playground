import { getPayment } from '../../checkout-state.js';
import { detectCardBrand, formatCardNumber } from '../../payment.js';
import { escapeHtml, orderSummary, panel, stepper } from './layout.js';

function paymentField({ id, testid, label, value = '', type = 'text', autocomplete = 'on' }) {
  return `
    <div>
      <label for="${id}" class="block text-sm font-medium text-gray-700 mb-1">${label}</label>
      <input
        id="${id}"
        data-testid="${testid}"
        type="${type}"
        autocomplete="${autocomplete}"
        value="${escapeHtml(value)}"
        class="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <p data-testid="${testid.replace('-input', '-error')}" class="text-red-600 text-sm mt-1 hidden"></p>
    </div>`;
}

export function createPaymentView(getCart) {
  return {
    name: 'checkout-payment',
    mount(app) {
      const payment = getPayment() ?? {};
      const cardNumber = formatCardNumber(payment.cardNumber);
      const brand = detectCardBrand(cardNumber);

      app.innerHTML = `
        <section data-testid="checkout-payment-page" class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
          ${panel(`
            ${stepper(2)}
            <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">Payment method
              <span data-testid="test-mode-chip" class="rounded-full border border-amber-200 bg-amber-100 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-amber-800">Test mode</span>
            </h2>
            <div data-testid="secure-payment-banner" class="flex items-start gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2.5 text-sm font-medium text-green-800 mb-5">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <rect x="4" y="10" width="16" height="10" rx="2" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M8 10V7a4 4 0 018 0v3" />
              </svg>
              <span>Payments are simulated — card details never leave your browser and are not stored.</span>
            </div>
            <div class="space-y-4">
              <div>
                <label for="payment-card" class="block text-sm font-medium text-gray-700 mb-1">Card number</label>
                <div class="card-field relative border border-blue-300 rounded-lg bg-white focus-within:ring-2 focus-within:ring-blue-500">
                  <svg xmlns="http://www.w3.org/2000/svg" class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <rect x="4" y="10" width="16" height="10" rx="2" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M8 10V7a4 4 0 018 0v3" />
                  </svg>
                  <input
                    id="payment-card"
                    data-testid="payment-card-input"
                    inputmode="numeric"
                    autocomplete="cc-number"
                    value="${escapeHtml(cardNumber)}"
                    class="relative w-full bg-transparent pl-10 pr-20 py-2 text-gray-900 focus:outline-none"
                  />
                  <span data-testid="card-brand" class="absolute right-3 top-1/2 -translate-y-1/2 rounded border border-blue-200 bg-blue-50 px-1.5 py-0.5 text-[10px] font-extrabold tracking-wider text-blue-700 ${brand ? '' : 'hidden'}">${brand ? brand.toUpperCase() : ''}</span>
                </div>
                <p data-testid="payment-card-error" class="text-red-600 text-sm mt-1 hidden"></p>
              </div>
              <div class="grid gap-4 sm:grid-cols-2">
                ${paymentField({ id: 'payment-expiry', testid: 'payment-expiry-input', label: 'Expiry (MM/YY)', value: payment.expiry, autocomplete: 'cc-exp' })}
                ${paymentField({ id: 'payment-cvv', testid: 'payment-cvv-input', label: 'CVV', value: payment.cvv, type: 'password', autocomplete: 'cc-csc' })}
              </div>
              <button
                data-action="payment-review"
                data-testid="payment-review-btn"
                class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors cursor-pointer"
              >Review Order</button>
            </div>
          `)}
          ${panel(`${orderSummary(getCart(), { tax: true })}
            <div data-testid="test-card-hint" class="mt-4 rounded-lg border border-dashed border-gray-300 bg-gray-50 px-3 py-2 text-xs text-gray-600">
              This is a demo. Use the test card 4242 4242 4242 4242 — no payment will be processed.
            </div>`, 'lg:sticky lg:top-6')}
        </section>`;
    },
  };
}

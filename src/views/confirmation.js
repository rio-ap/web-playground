import { getLastOrder } from '../checkout-state.js';
import { escapeHtml } from './checkout/layout.js';

export function renderConfirmation(app) {
  const order = getLastOrder();

  app.innerHTML = `
    <section data-testid="confirmation-page" class="max-w-xl mx-auto text-center py-10">
      <div data-testid="confirmation-check" class="confirm-check mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
          <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h1 class="text-3xl font-extrabold tracking-tight text-gray-900">Order confirmed</h1>
      <p class="mt-2 text-gray-600">Thanks, ${escapeHtml(order.shipping.name)}! Your order number is</p>
      <p data-testid="order-number" class="mt-1 font-mono text-lg font-bold text-blue-700">${escapeHtml(order.orderNumber)}</p>
      <p class="mt-3 text-sm text-gray-500">Simulated payment · nothing was charged</p>
      <button
        data-action="continue-shopping"
        data-testid="continue-shopping-btn"
        class="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors cursor-pointer"
      >Continue Shopping</button>
    </section>`;
}

export const confirmationView = { name: 'confirmation', mount: renderConfirmation };

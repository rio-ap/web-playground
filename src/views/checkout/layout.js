import { getSubtotal } from '../../cart.js';
import { formatPrice } from '../../products.js';

const STEPS = [
  { step: 1, key: 'address', label: 'Address' },
  { step: 2, key: 'payment', label: 'Payment' },
  { step: 3, key: 'review', label: 'Review' },
];

export function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function panel(content, className = '') {
  return `<div class="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 ${className}">${content}</div>`;
}

export function field({ id, testid, label, value = '', type = 'text', autocomplete = 'on' }) {
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

export function stepper(activeStep) {
  const items = STEPS.map(({ step, key, label }) => {
    const state = step === activeStep ? 'active' : step < activeStep ? 'done' : 'upcoming';
    const dotClass = state === 'upcoming'
      ? 'border-gray-300 text-gray-500 bg-white'
      : state === 'active'
        ? 'border-blue-600 text-blue-600 bg-white'
        : 'border-green-700 bg-green-700 text-white';
    const labelClass = state === 'upcoming' ? 'text-gray-500' : state === 'active' ? 'text-blue-700' : 'text-green-700';

    return `
      <li data-testid="stepper-${key}" data-state="${state}" aria-current="${state === 'active' ? 'step' : 'false'}" class="flex items-center gap-2">
        <span class="w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold ${dotClass}">${state === 'done' ? '✓' : step}</span>
        <span class="text-sm font-semibold ${labelClass}">${label}</span>
      </li>`;
  }).join('<li aria-hidden="true" class="hidden sm:block flex-1 h-px bg-gray-200"></li>');

  return `<ol data-testid="checkout-stepper" class="flex items-center gap-3 mb-6">${items}</ol>`;
}

export function itemList(cart) {
  const items = cart.map(({ product, quantity }) => `
    <li data-testid="summary-item-${product.id}" class="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0">
      <img src="${product.image}" alt="" class="w-12 h-12 rounded-lg object-cover bg-gray-50" />
      <div class="flex-1 min-w-0">
        <p class="text-sm font-medium text-gray-900 truncate">${escapeHtml(product.name)}</p>
        <p class="text-xs text-gray-500">${formatPrice(product.price)} × ${quantity}</p>
      </div>
      <span class="text-sm font-semibold text-gray-700">${formatPrice(product.price * quantity)}</span>
    </li>`).join('');

  return `<ul data-testid="summary-items" class="divide-y divide-gray-100">${items}</ul>`;
}

export function orderSummary(cart, { tax = false, items = true } = {}) {
  const subtotal = formatPrice(getSubtotal(cart));
  const itemsMarkup = items
    ? cart.length === 0
      ? '<p data-testid="summary-empty" class="text-sm text-gray-500 py-3">Your cart is empty.</p>'
      : itemList(cart)
    : '';

  return `
    <aside data-testid="order-summary" aria-label="Order summary">
      <h2 class="text-lg font-semibold text-gray-900 mb-1">Order summary</h2>
      ${itemsMarkup}
      <dl class="mt-4 space-y-2 border-t border-gray-200 pt-4">
        <div class="flex justify-between text-sm text-gray-600"><dt>Subtotal</dt><dd data-testid="summary-subtotal">${subtotal}</dd></div>
        <div class="flex justify-between text-sm text-gray-600"><dt>Shipping</dt><dd>Free</dd></div>
        ${tax ? '<div class="flex justify-between text-sm text-gray-600"><dt>Tax</dt><dd data-testid="summary-tax">$0.00</dd></div>' : ''}
        <div class="flex justify-between text-base font-bold text-gray-900 border-t border-gray-200 pt-3"><dt>Total</dt><dd data-testid="summary-total">${subtotal}</dd></div>
      </dl>
    </aside>`;
}

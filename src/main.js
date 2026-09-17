import { getProducts, formatPrice } from './products.js';
import { addItem, removeItem, updateQuantity, getSubtotal, getItemCount } from './cart.js';
import { validateShippingInfo, validatePaymentInfo, processOrder } from './checkout.js';
import {
  setShipping,
  getShipping,
  setPayment,
  getPayment,
  setLastOrder,
  getLastOrder,
} from './checkout-state.js';
import { detectCardBrand, formatCardNumber, formatExpiry } from './payment.js';
import { bumpCart, flyToCart, showToast } from './effects.js';
import { registerRoute, startRouter } from './router.js';
import { homeView } from './views/home.js';
import { shopView } from './views/shop.js';
import { createAddressView } from './views/checkout/address.js';
import { createPaymentView } from './views/checkout/payment.js';
import { createReviewView } from './views/checkout/review.js';
import { confirmationView } from './views/confirmation.js';

let cart = [];

const cartModal = document.querySelector('[data-testid="cart-modal"]');
const cartOverlay = document.querySelector('[data-testid="cart-overlay"]');
const cartToggle = document.querySelector('[data-testid="cart-toggle-btn"]');
const cartClose = document.querySelector('[data-testid="cart-close-btn"]');
const cartBadge = document.querySelector('[data-testid="cart-badge"]');
const cartEmpty = document.querySelector('[data-testid="cart-empty"]');
const cartItemsContainer = document.getElementById('cart-items-container');
const cartFooter = document.getElementById('cart-footer');
const cartTotal = document.querySelector('[data-testid="cart-total-price"]');
const checkoutBtn = document.querySelector('[data-testid="checkout-btn"]');

const addressView = createAddressView(() => cart);
const paymentView = createPaymentView(() => cart);
const reviewView = createReviewView(() => cart);

function updateBadge() {
  const count = getItemCount(cart);
  cartBadge.textContent = count;
  cartBadge.classList.toggle('hidden', count === 0);
}

function renderCartItems() {
  if (cart.length === 0) {
    cartEmpty.classList.remove('hidden');
    cartItemsContainer.classList.add('hidden');
    cartFooter.classList.add('hidden');
    return;
  }

  cartEmpty.classList.add('hidden');
  cartItemsContainer.classList.remove('hidden');
  cartFooter.classList.remove('hidden');

  cartItemsContainer.innerHTML = cart.map((item) => `
    <div data-testid="cart-item-${item.product.id}" class="flex items-center gap-4 py-4 border-b border-gray-100">
      <img data-testid="cart-item-image-${item.product.id}" src="${item.product.image}" alt="${item.product.name}" class="w-16 h-16 object-cover rounded-lg" />
      <div class="flex-1 min-w-0">
        <h4 data-testid="cart-item-name-${item.product.id}" class="font-semibold text-gray-900 truncate">${item.product.name}</h4>
        <p data-testid="cart-item-price-${item.product.id}" class="text-blue-600 font-bold">${formatPrice(item.product.price)}</p>
      </div>
      <div data-testid="cart-item-quantity-${item.product.id}" class="flex items-center gap-2">
        <button data-testid="decrement-btn-${item.product.id}" data-id="${item.product.id}" class="cart-qty-btn w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 font-medium text-gray-600 cursor-pointer">-</button>
        <span data-testid="item-quantity-${item.product.id}" class="w-6 text-center font-medium text-gray-900">${item.quantity}</span>
        <button data-testid="increment-btn-${item.product.id}" data-id="${item.product.id}" class="cart-qty-btn w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 font-medium text-gray-600 cursor-pointer">+</button>
      </div>
      <button data-testid="remove-btn-${item.product.id}" data-id="${item.product.id}" class="cart-remove-btn text-red-600 hover:text-red-700 text-sm font-medium cursor-pointer">Remove</button>
    </div>
  `).join('');

  cartTotal.textContent = formatPrice(getSubtotal(cart));

  document.querySelectorAll('.cart-qty-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = Number(btn.dataset.id);
      if (btn.textContent === '+') {
        cart = addItem(cart, { id });
      } else {
        const item = cart.find((i) => i.product.id === id);
        if (item) {
          cart = updateQuantity(cart, id, item.quantity - 1);
        }
      }
      renderCartItems();
      updateBadge();
    });
  });

  document.querySelectorAll('.cart-remove-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = Number(btn.dataset.id);
      cart = removeItem(cart, id);
      renderCartItems();
      updateBadge();
    });
  });
}

function openCart() {
  renderCartItems();
  cartModal.classList.remove('hidden');
  document.body.classList.add('overflow-hidden');
}

function closeCart() {
  cartModal.classList.add('hidden');
  document.body.classList.remove('overflow-hidden');
}

cartToggle.addEventListener('click', () => {
  if (cartModal.classList.contains('hidden')) {
    openCart();
  } else {
    closeCart();
  }
});

cartClose.addEventListener('click', closeCart);
cartOverlay.addEventListener('click', closeCart);

checkoutBtn.addEventListener('click', () => {
  closeCart();
  window.location.hash = '#/checkout/address';
});

function readShippingForm() {
  return {
    name: document.querySelector('[data-testid="shipping-name-input"]').value,
    address: document.querySelector('[data-testid="shipping-address-input"]').value,
    city: document.querySelector('[data-testid="shipping-city-input"]').value,
    zip: document.querySelector('[data-testid="shipping-zip-input"]').value,
    email: document.querySelector('[data-testid="shipping-email-input"]').value,
  };
}

function readPaymentForm() {
  return {
    cardNumber: document.querySelector('[data-testid="payment-card-input"]').value,
    expiry: document.querySelector('[data-testid="payment-expiry-input"]').value,
    cvv: document.querySelector('[data-testid="payment-cvv-input"]').value,
  };
}

function showErrors(prefix, errors) {
  Object.keys(errors).forEach((key) => {
    const el = document.querySelector(`[data-testid="${prefix}-${key}-error"]`);
    if (el) {
      el.textContent = errors[key];
      el.classList.remove('hidden');
    }
  });
}

function clearErrors() {
  document.querySelectorAll('[data-testid$="-error"]').forEach((el) => {
    el.textContent = '';
    el.classList.add('hidden');
  });
}

function handleCheckoutAction(action) {
  if (action === 'checkout-continue') {
    clearErrors();
    const shipping = readShippingForm();
    const errors = validateShippingInfo(shipping);
    if (Object.keys(errors).length > 0) {
      showErrors('shipping', errors);
      return;
    }
    setShipping(shipping);
    window.location.hash = '#/checkout/payment';
    return;
  }

  if (action === 'payment-review') {
    clearErrors();
    const payment = readPaymentForm();
    const errors = validatePaymentInfo(payment);
    if (Object.keys(errors).length > 0) {
      showErrors('payment', errors);
      return;
    }
    setPayment(payment);
    window.location.hash = '#/checkout/review';
    return;
  }

  if (action === 'place-order') {
    const order = processOrder(cart, getShipping(), getPayment());
    setLastOrder(order);
    cart = [];
    updateBadge();
    closeCart();
    window.location.hash = '#/confirmation';
    return;
  }

  if (action === 'continue-shopping') {
    window.location.hash = '#/shop';
  }
}

document.addEventListener('click', (event) => {
  const actionEl = event.target.closest('[data-action]');
  if (actionEl) {
    handleCheckoutAction(actionEl.dataset.action);
    return;
  }

  const btn = event.target.closest('.add-to-cart-btn');
  if (!btn) return;
  const id = Number(btn.dataset.id);
  const product = getProducts().find((p) => p.id === id);
  if (!product) return;
  cart = addItem(cart, product);
  updateBadge();
  const image = btn.closest('[data-testid^="product-card-"]')?.querySelector(`[data-testid="product-image-${id}"]`);
  if (image) {
    flyToCart(image);
  } else {
    bumpCart();
  }
  showToast(`${product.name} added to cart`);
});

document.addEventListener('input', (event) => {
  const input = event.target;
  if (!(input instanceof HTMLInputElement)) return;
  const testid = input.getAttribute('data-testid');

  if (testid === 'payment-card-input') {
    input.value = formatCardNumber(input.value);
    const brand = detectCardBrand(input.value);
    const chip = document.querySelector('[data-testid="card-brand"]');
    if (chip) {
      chip.textContent = brand ? brand.toUpperCase() : '';
      chip.classList.toggle('hidden', !brand);
    }
    return;
  }

  if (testid === 'payment-expiry-input') {
    input.value = formatExpiry(input.value);
  }
});

function guarded(view, guard) {
  return {
    name: view.name,
    mount(app) {
      const redirect = guard();
      if (redirect) {
        window.location.replace(redirect);
        return;
      }
      view.mount(app);
    },
  };
}

registerRoute('/', homeView);
registerRoute('/shop', shopView);
registerRoute('/checkout', {
  name: 'checkout-redirect',
  mount() {
    window.location.replace('#/checkout/address');
  },
});
registerRoute('/checkout/address', guarded(addressView, () => (cart.length === 0 ? '#/shop' : null)));
registerRoute('/checkout/payment', guarded(paymentView, () => {
  if (cart.length === 0) return '#/shop';
  if (!getShipping()) return '#/checkout/address';
  return null;
}));
registerRoute('/checkout/review', guarded(reviewView, () => {
  if (cart.length === 0) return '#/shop';
  if (!getPayment()) return '#/checkout/payment';
  return null;
}));
registerRoute('/confirmation', guarded(confirmationView, () => (getLastOrder() ? null : '#/')));

startRouter();

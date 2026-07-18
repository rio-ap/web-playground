import { getProducts, formatPrice } from './products.js';
import { addItem, removeItem, updateQuantity, getSubtotal, getItemCount } from './cart.js';
import { validateShippingInfo, validatePaymentInfo, processOrder } from './checkout.js';

let cart = [];

const grid = document.querySelector('[data-testid="product-grid"]');
const cartModal = document.querySelector('[data-testid="cart-modal"]');
const cartOverlay = document.querySelector('[data-testid="cart-overlay"]');
const cartToggle = document.querySelector('[data-testid="cart-toggle-btn"]');
const cartClose = document.querySelector('[data-testid="cart-close-btn"]');
const cartBadge = document.querySelector('[data-testid="cart-badge"]');
const cartBody = document.getElementById('cart-body');
const cartEmpty = document.querySelector('[data-testid="cart-empty"]');
const cartItemsContainer = document.getElementById('cart-items-container');
const cartFooter = document.getElementById('cart-footer');
const cartTotal = document.querySelector('[data-testid="cart-total-price"]');
const checkoutBtn = document.querySelector('[data-testid="checkout-btn"]');
const checkoutView = document.getElementById('checkout-view');
const checkoutForm = document.querySelector('[data-testid="checkout-form"]');
const checkoutStepTitle = document.querySelector('[data-testid="checkout-step-title"]');
const stepShipping = document.getElementById('checkout-step-shipping');
const stepPayment = document.getElementById('checkout-step-payment');
const stepConfirmation = document.getElementById('checkout-step-confirmation');

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
      <button data-testid="remove-btn-${item.product.id}" data-id="${item.product.id}" class="cart-remove-btn text-red-400 hover:text-red-600 text-sm font-medium cursor-pointer">Remove</button>
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

function showCartView() {
  checkoutView.classList.add('hidden');
  cartBody.classList.remove('hidden');
  cartFooter.classList.remove('hidden');
  renderCartItems();
}

function showCheckoutView() {
  cartBody.classList.add('hidden');
  cartFooter.classList.add('hidden');
  checkoutView.classList.remove('hidden');
}

function openCart() {
  cartModal.classList.remove('hidden');
  document.body.classList.add('overflow-hidden');
  showCartView();
}

function closeCart() {
  cartModal.classList.add('hidden');
  document.body.classList.remove('overflow-hidden');
  showCartView();
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
  showCheckoutView();
  checkoutStepTitle.textContent = 'Shipping Info';
  stepShipping.classList.remove('hidden');
  stepPayment.classList.add('hidden');
  stepConfirmation.classList.add('hidden');
  clearErrors();
});

document.querySelector('[data-testid="checkout-cancel-btn"]').addEventListener('click', () => {
  showCartView();
});

document.querySelector('[data-testid="checkout-next-btn"]').addEventListener('click', () => {
  const data = {
    name: document.querySelector('[data-testid="shipping-name-input"]').value,
    address: document.querySelector('[data-testid="shipping-address-input"]').value,
    city: document.querySelector('[data-testid="shipping-city-input"]').value,
    zip: document.querySelector('[data-testid="shipping-zip-input"]').value,
    email: document.querySelector('[data-testid="shipping-email-input"]').value,
  };

  const errors = validateShippingInfo(data);
  clearErrors();

  if (Object.keys(errors).length > 0) {
    showErrors('shipping', errors);
    return;
  }

  stepShipping.classList.add('hidden');
  stepPayment.classList.remove('hidden');
  checkoutStepTitle.textContent = 'Payment Info';
  clearErrors();
});

document.querySelector('[data-testid="checkout-back-btn"]').addEventListener('click', () => {
  stepPayment.classList.add('hidden');
  stepShipping.classList.remove('hidden');
  checkoutStepTitle.textContent = 'Shipping Info';
  clearErrors();
});

document.querySelector('[data-testid="checkout-submit-btn"]').addEventListener('click', () => {
  const data = {
    cardNumber: document.querySelector('[data-testid="payment-card-input"]').value,
    expiry: document.querySelector('[data-testid="payment-expiry-input"]').value,
    cvv: document.querySelector('[data-testid="payment-cvv-input"]').value,
  };

  const errors = validatePaymentInfo(data);
  clearErrors();

  if (Object.keys(errors).length > 0) {
    showErrors('payment', errors);
    return;
  }

  const shippingData = {
    name: document.querySelector('[data-testid="shipping-name-input"]').value,
    address: document.querySelector('[data-testid="shipping-address-input"]').value,
    city: document.querySelector('[data-testid="shipping-city-input"]').value,
    zip: document.querySelector('[data-testid="shipping-zip-input"]').value,
    email: document.querySelector('[data-testid="shipping-email-input"]').value,
  };

  const order = processOrder(cart, shippingData, data);

  stepPayment.classList.add('hidden');
  stepConfirmation.classList.remove('hidden');
  checkoutStepTitle.textContent = 'Order Confirmed!';
  document.querySelector('[data-testid="order-number"]').textContent = order.orderNumber;
});

document.querySelector('[data-testid="continue-shopping-btn"]').addEventListener('click', () => {
  cart = [];
  updateBadge();
  closeCart();
});

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

function renderProducts() {
  const products = getProducts();
  grid.innerHTML = products.map((product) => `
    <div
      data-testid="product-card-${product.id}"
      class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
    >
      <img
        data-testid="product-image-${product.id}"
        src="${product.image}"
        alt="${product.name}"
        class="w-full h-48 object-cover"
        loading="lazy"
      />
      <div class="p-4 space-y-2">
        <h3
          data-testid="product-name-${product.id}"
          class="text-lg font-semibold text-gray-900"
        >${product.name}</h3>
        <p class="text-sm text-gray-500">${product.description}</p>
        <p
          data-testid="product-price-${product.id}"
          class="text-xl font-bold text-blue-600"
        >${formatPrice(product.price)}</p>
        <button
          data-testid="add-to-cart-btn-${product.id}"
          data-id="${product.id}"
          class="add-to-cart-btn w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors cursor-pointer"
        >
          Add to Cart
        </button>
      </div>
    </div>
  `).join('');

  document.querySelectorAll('.add-to-cart-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = Number(btn.dataset.id);
      const product = products.find((p) => p.id === id);
      if (product) {
        cart = addItem(cart, product);
        updateBadge();
      }
    });
  });
}

renderProducts();

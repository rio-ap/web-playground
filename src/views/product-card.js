import { formatPrice } from '../products.js';

export function productCard(product) {
  return `
    <div
      data-testid="product-card-${product.id}"
      class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full"
    >
      <img
        data-testid="product-image-${product.id}"
        src="${product.image}"
        alt="${product.name}"
        class="w-full h-48 object-cover"
        loading="lazy"
      />
      <div class="p-4 flex flex-col flex-1 gap-2">
        <h3
          data-testid="product-name-${product.id}"
          class="text-lg font-semibold text-gray-900"
        >${product.name}</h3>
        <p class="text-sm text-gray-500 flex-1">${product.description}</p>
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
  `;
}

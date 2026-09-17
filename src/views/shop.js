import { getProducts } from '../products.js';
import { productCard } from './product-card.js';

export function mountShop(app) {
  const grid = getProducts().map(productCard).join('');

  app.innerHTML = `
    <h2 class="text-xl font-semibold text-gray-800 mb-6">Products</h2>
    <div data-testid="product-grid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">${grid}</div>
  `;
}

export const shopView = { name: 'shop', mount: mountShop };

import { getProducts } from '../products.js';
import { productCard } from './product-card.js';

export function mountHome(app) {
  const featured = getProducts()
    .slice(0, 3)
    .map(productCard)
    .join('');

  app.innerHTML = `
    <section data-testid="home-view">
      <div class="bg-gradient-to-br from-blue-50 to-slate-50 border border-blue-100 rounded-2xl px-6 py-10 sm:px-9 sm:py-11 mb-7">
        <p class="text-blue-600 text-xs font-bold uppercase tracking-widest mb-2">Demo storefront · built for automation practice</p>
        <h1 class="text-4xl font-extrabold tracking-tight text-gray-900 mb-2">Welcome to Trazire Mart</h1>
        <p class="text-gray-600 max-w-2xl mb-5">Six products, a working cart, and a checkout that behaves like the real thing — minus the payments. Built as a playground for QA engineers to point their automation at.</p>
        <a href="#/shop" data-testid="start-shopping-btn" class="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-lg shadow-lg shadow-blue-600/25 transition-colors cursor-pointer">Start Shopping →</a>
        <div class="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-500">
          <span><b class="text-gray-700">Free shipping</b> over $50</span>
          <span><b class="text-gray-700">30-day</b> returns</span>
          <span><b class="text-gray-700">Secure</b> checkout (simulated)</span>
        </div>
      </div>
      <h2 class="text-xl font-semibold text-gray-800 mb-6">Featured</h2>
      <div data-testid="featured-grid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">${featured}</div>
    </section>
  `;
}

export const homeView = { name: 'home', mount: mountHome };

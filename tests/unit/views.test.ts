import { describe, it, expect } from 'vitest';
import { productCard } from '../../src/views/product-card';
import { renderHome } from '../../src/views/home';
import { renderShop } from '../../src/views/shop';
import { getProducts, formatPrice } from '../../src/products';

const countTestId = (html: string, testId: string) =>
  (html.match(new RegExp(`data-testid="${testId}-`, 'g')) ?? []).length;

describe('productCard', () => {
  it('renders the card testids, image, copy and formatted price', () => {
    const product = getProducts()[0];
    const html = productCard(product);

    expect(html).toContain(`data-testid="product-card-${product.id}"`);
    expect(html).toContain(`data-testid="product-image-${product.id}"`);
    expect(html).toContain(`data-testid="product-name-${product.id}"`);
    expect(html).toContain(`data-testid="product-price-${product.id}"`);
    expect(html).toContain(`data-testid="add-to-cart-btn-${product.id}"`);
    expect(html).toContain(`src="${product.image}"`);
    expect(html).toContain(`alt="${product.name}"`);
    expect(html).toContain(product.name);
    expect(html).toContain(product.description);
    expect(html).toContain(formatPrice(product.price));
  });
});

describe('renderHome', () => {
  it('renders the hero CTA and the first three featured products', () => {
    const app = { innerHTML: '' };
    renderHome(app);

    expect(app.innerHTML).toContain('data-testid="start-shopping-btn"');
    expect(app.innerHTML).toContain('Welcome to Trazire Mart');
    expect(countTestId(app.innerHTML, 'product-card')).toBe(3);
  });
});

describe('renderShop', () => {
  it('renders the product grid with all six products', () => {
    const app = { innerHTML: '' };
    renderShop(app);

    expect(app.innerHTML).toContain('data-testid="product-grid"');
    expect(countTestId(app.innerHTML, 'product-card')).toBe(6);
  });
});

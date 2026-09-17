import { describe, it, expect } from 'vitest';
import { execFileSync } from 'node:child_process';
import { tagsForPaths, ALL_TAGS } from '../../scripts/detect-e2e-tags.mjs';

describe('tagsForPaths', () => {
  it('maps a single module source file to its tag', () => {
    expect(tagsForPaths(['src/products.js'])).toEqual(['@home', '@shop']);
    expect(tagsForPaths(['src/cart.js'])).toEqual(['@cart']);
    expect(tagsForPaths(['src/checkout.js'])).toEqual(['@checkout']);
    expect(tagsForPaths(['src/payment.js'])).toEqual(['@checkout']);
    expect(tagsForPaths(['src/checkout-state.js'])).toEqual(['@checkout']);
  });

  it('maps home and shop view sources to their tags', () => {
    expect(tagsForPaths(['src/views/home.js'])).toEqual(['@home']);
    expect(tagsForPaths(['src/views/shop.js'])).toEqual(['@shop']);
  });

  it('maps checkout view sources to the checkout tag', () => {
    expect(tagsForPaths(['src/views/checkout/payment.js'])).toEqual(['@checkout']);
    expect(tagsForPaths(['src/views/confirmation.js'])).toEqual(['@checkout']);
  });

  it('maps module spec and component files to their tags', () => {
    expect(tagsForPaths(['tests/e2e/home.spec.ts'])).toEqual(['@home']);
    expect(tagsForPaths(['tests/e2e/product-grid.spec.ts'])).toEqual(['@shop']);
    expect(tagsForPaths(['tests/e2e/cart-flow.spec.ts'])).toEqual(['@cart']);
    expect(tagsForPaths(['tests/e2e/add-to-cart-feedback.spec.ts'])).toEqual(['@cart']);
    expect(tagsForPaths(['tests/e2e/checkout-flow.spec.ts'])).toEqual(['@checkout']);
    expect(tagsForPaths(['tests/e2e/checkout-guards.spec.ts'])).toEqual(['@checkout']);
    expect(tagsForPaths(['tests/component/cart-item.spec.ts'])).toEqual(['@cart']);
    expect(tagsForPaths(['tests/component/checkout-form.spec.ts'])).toEqual(['@checkout']);
  });

  it('returns tags in stable order for multiple modules', () => {
    expect(tagsForPaths(['src/checkout.js', 'src/cart.js'])).toEqual(['@cart', '@checkout']);
  });

  it('returns all tags when a shared file changed', () => {
    const sharedPaths = [
      'src/main.js',
      'src/router.js',
      'src/effects.js',
      'src/views/product-card.js',
      'src/style.css',
      'index.html',
      'public/favicon.svg',
      'vite.config.js',
      'vitest.config.js',
      'playwright.config.ts',
      'playwright.smoke.config.ts',
      'package.json',
      'package-lock.json',
      'tests/e2e/pages/CartModalPage.ts',
      'tests/e2e/helpers/test-data.ts',
      'tests/a11y/a11y.spec.ts',
      'tests/e2e/visual/layout.spec.ts',
      'scripts/detect-e2e-tags.mjs',
      '.github/workflows/ci.yml',
    ];
    for (const path of sharedPaths) {
      expect(tagsForPaths([path]), path).toEqual(ALL_TAGS);
    }
  });

  it('returns nothing for unrelated paths', () => {
    expect(tagsForPaths(['README.md', 'LICENSE', 'HOWTO.md'])).toEqual([]);
  });

  it('ignores unrelated paths mixed with module paths', () => {
    expect(tagsForPaths(['README.md', 'src/cart.js'])).toEqual(['@cart']);
  });

  it('handles empty and blank input', () => {
    expect(tagsForPaths([])).toEqual([]);
    expect(tagsForPaths(['', '   '])).toEqual([]);
  });
});

describe('detect-e2e-tags CLI', () => {
  const run = (input: string) =>
    execFileSync('node', ['scripts/detect-e2e-tags.mjs'], { input }).toString().trim();

  it('prints grep-ready tags from stdin', () => {
    expect(run('src/cart.js\n')).toBe('@cart');
    expect(run('src/checkout.js\nsrc/cart.js\n')).toBe('@cart|@checkout');
  });

  it('prints nothing for unrelated input', () => {
    expect(run('README.md\n')).toBe('');
  });

  it('prints the checkout tag for the checkout form component', () => {
    expect(run('tests/component/checkout-form.spec.ts\n')).toBe('@checkout');
  });

  it('prints all tags for shared input', () => {
    expect(run('index.html\n')).toBe('@home|@shop|@cart|@checkout');
  });
});

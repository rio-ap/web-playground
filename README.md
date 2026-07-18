# ShopCart

A fully interactive E-Commerce Shopping Cart single-page application built with vanilla JavaScript, Tailwind CSS, and TDD.

**Live demo:** Deployed via GitHub Actions on push to `main` — see [.github/workflows/cd.yml](.github/workflows/cd.yml)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| UI | HTML, Tailwind CSS (v4, built with npm via Vite), vanilla JS |
| State | In-memory + localStorage-ready patterns |
| Unit Tests | Vitest (TypeScript) |
| E2E / Component Tests | Playwright (TypeScript) |
| CI/CD | GitHub Actions |

All interactive elements use `data-testid` attributes for test selectors — no fragile CSS or text selectors.

## Local Setup

```bash
# Clone the repo
git clone https://github.com/<your-username>/web-playground.git
cd web-playground

# Install dependencies
npm install

# Build for production
npm run build

# Preview production build locally
npm run preview

# Start dev server
npm run dev
```

Open http://localhost:5173 in your browser.

## Running Tests

```bash
# Unit tests (Vitest) — cart math, checkout validation, product helpers
npm test

# Watch mode
npm run test:watch

# E2E + Component tests (Playwright)
npm run test:e2e
```

### Test structure

```
tests/
├── unit/          # Vitest — pure business logic (no DOM)
│   ├── products.test.ts
│   ├── cart.test.ts
│   └── checkout.test.ts
├── component/     # Playwright — isolated UI component rendering
│   ├── cart-item.spec.ts
│   └── checkout-form.spec.ts
└── e2e/           # Playwright — full user flows
    ├── product-grid.spec.ts
    ├── cart-flow.spec.ts
    └── checkout-flow.spec.ts
```

## Project Structure

```
├── index.html              # Entry point — product grid + cart modal + checkout
├── package.json
├── vitest.config.js
├── playwright.config.ts
├── src/
│   ├── products.js         # Product data + formatPrice
│   ├── cart.js             # Cart operations (add, remove, update, totals)
│   └── checkout.js         # Validation + order processing
└── tests/
    ├── unit/
    ├── component/
    └── e2e/
```

## Features

- **Product Grid** — 6 products with image placeholders, names, prices, and Add to Cart buttons
- **Cart Slide-out Modal** — add/remove items, increment/decrement quantity, live subtotal, badge count
- **Checkout Flow** — multi-step form: Shipping info → Payment info → Order confirmation with validation

## Contribution Guide

1. **Fork** the repo and create a feature branch from `main`
2. **Write tests first** — see existing tests for patterns. Every new function needs a failing test before code.
3. **Implement** the minimal code to make tests pass
4. **Run all tests** locally before pushing
5. Open a **Pull Request** against `main`

CI will automatically run the relevant tests (unit tests for `src/` / `tests/unit/` changes, Playwright for UI changes). All tests must pass before merging.

### Commit conventions

Use clear, descriptive commit messages. Prefix with the scope:

```
cart: add increment quantity handler
checkout: validate payment card number
ci: run e2e tests only on ui changes
```

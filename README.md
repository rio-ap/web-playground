# Trazire Mart — a front-end test automation playground

A small, self-contained e-commerce SPA (home → shop → cart → checkout) built to be a stable target for practising front-end test automation — and a reference implementation for test architecture and CI/CD design.

[![CI](https://github.com/rio-ap/web-playground/actions/workflows/ci.yml/badge.svg)](https://github.com/rio-ap/web-playground/actions/workflows/ci.yml)
[![CD](https://github.com/rio-ap/web-playground/actions/workflows/cd.yml/badge.svg)](https://github.com/rio-ap/web-playground/actions/workflows/cd.yml)

**Live demo:** [https://playground.trazire.com/web-playground/](https://playground.trazire.com/web-playground/)

**Test reports:** [unit coverage](https://playground.trazire.com/web-playground/coverage/) · [Playwright report](https://playground.trazire.com/web-playground/test-reports/)

## What this is

The app does four things: a landing page, a six-product catalog, a cart drawer, and a validated checkout. Everything beyond that exists to make automation honest and repeatable:

- every interactive element carries a `data-testid` — no brittle CSS or text selectors needed
- business logic is pure and separated from the DOM, so it is unit-testable without a browser
- no backend, no auth, no real payments, no third-party runtime dependencies
- deterministic state and UI — safe for visual regression and CI

It is deliberately small. The point is the engineering around it, not the app.

## Who it's for

QA and SDET practitioners who want something more realistic than a todo list to practise against:

- locator and waiting strategies against a real DOM
- Page Object Model and test layering
- negative-path and guard testing (validation, redirects, deep links)
- unit-testing pure logic, including the CI's own path-to-tag mapping
- accessibility auditing with axe
- visual regression across browsers
- reading — or rebuilding — a CI/CD pipeline that actually gates a deploy

## Application design

| Piece | Choice | Why |
|-------|--------|-----|
| App | Vanilla JS ES modules | No framework noise between the test and the browser |
| Logic | `src/products.js`, `src/cart.js`, `src/checkout.js`, `src/payment.js`, `src/checkout-state.js` | Pure functions — unit tests need no DOM |
| Views | `src/views/**` | Pure `mount(app)` renderers; no listeners, so they are unit-testable with a stub object |
| Routing | `src/router.js` — hash routes | Works on GitHub Pages with no server rewrites, gives real URLs and a working Back button |
| Wiring | `src/main.js` | The only place that touches the DOM, listens for events, and enforces route guards |
| Feedback | `src/effects.js` | Fly-to-cart, badge pop, toast; all gated behind `prefers-reduced-motion` |
| Build | Vite 6 | Fast dev server; production bundle served from the repo's Pages sub-path |
| Styling | Tailwind CSS 4 (`@tailwindcss/vite`) | Utility classes only; no runtime CSS |
| Assets | Local SVG placeholders, local favicon, generated OG image | No CDN or third-party requests — CI and users see identical pages |

Routes: `#/` (home), `#/shop`, `#/checkout/address`, `#/checkout/payment`, `#/checkout/review`, `#/confirmation`. The cart is a stateful drawer available from every screen; only checkout is routed, so a deep link can never skip a step — guards redirect you to the right one.

Additional design details:

- **Payment is simulated, and says so.** A lock banner, a `TEST MODE` chip and an explicit "details are never stored" note keep the UX honest while still feeling like a real checkout. Card input is formatted live (Visa/Mastercard/Amex grouping), with brand detection and caret-preserving edits.
- **A strict CSP meta policy** (`default-src 'self'`, no inline scripts) plus local-only assets keeps the browser console clean — which the smoke test enforces.
- **The sans font stack is pinned** (`Arial, Helvetica, sans-serif`) so Linux CI and local runs render identically. Before pinning, the same page was 1017px tall locally and 977px on the runner, and every visual baseline failed for a reason that had nothing to do with the code.

## Test architecture

Six layers, each chosen because it catches something the others cannot:

| Layer | Tool | Scope |
|-------|------|-------|
| Unit | Vitest | Cart math, checkout/payment validation and formatting, checkout state, view renderers, and the CI path-to-tag mapping |
| Component | Playwright (`setContent`) | Markup contracts for cart items and checkout pages without the full app |
| E2E | Playwright + Page Object Model | Home, shop, cart, routing, checkout flow, guards, validation negatives — Chromium, Firefox, WebKit |
| Accessibility | `@axe-core/playwright` (own config, chromium) | 7 page-level audits: home, shop, cart, address, payment, review, confirmation |
| Visual regression | Playwright screenshots | 7 screens × 3 browsers, baselines committed and generated on Linux |
| Production smoke | Playwright against `vite preview` | Built output sanity: base path resolves, no console errors or failed requests, images decode, add-to-cart works |

### Why these layers

- **Pure logic first.** Cart, validation and payment rules are functions, not DOM code, so the fastest tests cover the most behavior. Coverage thresholds are enforced **per file** (90% statements/functions/lines, 80% branches) — a new, untested file cannot hide behind well-covered ones.
- **Views are unit-tested too.** Each view is a pure `mount(app)` renderer; tests assert the rendered markup against a stub object. Only `main.js`, `router.js` and `effects.js` are excluded from unit coverage — they are event/DOM-bound by design and are covered by the browser suites instead.
- **E2E is selected by module tags, not by file lists.** Every spec is tagged (`@home`, `@shop`, `@cart`, `@checkout`), which is what lets CI run a targeted slice for a PR instead of the whole suite.
- **Accessibility lives in its own chromium job.** Page-level axe audits need the real composed app and interactions, but not three browser engines; the browser matrix runs flows and visual regression.
- **Visual baselines are environment-sensitive by nature.** They are generated on Linux with fonts pinned, dynamic data (order numbers) masked, and animations disabled via `prefers-reduced-motion` so screenshots are stable.
- **Smoke tests the built artefact, not the dev server.** Base-path and asset problems — the classic Pages failure — fail the pipeline before a deploy can happen.

### Negative paths covered

Validation is tested as thoroughly as the happy path: empty forms, invalid email, non-numeric ZIP, out-of-range expiry month, incomplete card number, wrong CVV for Amex, all checkout guard redirects (empty cart, missing shipping/payment/order, post-order re-entry), cart removal/empty states, and unknown-route fallback.

### Current scale

113 unit tests, 174 Playwright runs across three browsers (58 each), 7 a11y audits and 1 smoke test — fast enough to run on every PR.

## CI/CD design

**Pull request checks** — change-aware fan-out: a one-module PR only runs that module's tests.

```mermaid
flowchart TD
  PR([Pull request]) --> DC["detect-changes<br/>diff → unit flags + module tags"]
  DC --> U["unit jobs<br/>only for changed modules"]
  DC --> E["e2e + visual<br/>chromium · firefox · webkit<br/>--grep module tags"]
  DC --> A["a11y audit<br/>chromium"]
  PR --> C["coverage<br/>per-file thresholds"]
```

**Release pipeline** — every stage must pass before the next one; the deploy happens last.

```mermaid
flowchart LR
  M([Push to main]) --> C["coverage +<br/>per-file thresholds"] --> E["playwright<br/>3 browsers"] --> A["a11y<br/>chromium"] --> B["vite build"] --> S["production smoke<br/>vite preview"] --> D["deploy to<br/>GitHub Pages"] --> R["publish coverage +<br/>Playwright reports"]
```

**CI (pull requests).** A `detect-changes` action inspects the diff and drives job fan-out: a changed module only runs its own unit job, and the 3-browser Playwright matrix only runs when UI or E2E files change. E2E selection is tag-based — changed paths are mapped to module tags by a unit-tested script (`scripts/detect-e2e-tags.mjs`), so a cart-only PR runs just the cart-tagged E2E and visual tests plus the cart a11y audit, while shared or config changes run everything. Coverage thresholds are enforced on every PR, and per-browser Playwright reports, the a11y report and coverage HTML are uploaded as artifacts. Concurrency groups cancel superseded runs. These jobs are wired as required status checks, so a red run blocks the merge.

**CD (push to `main`).** The pipeline re-runs unit coverage, the full 3-browser E2E suite, the accessibility audits, and the Vite build. Only then does the production smoke test run against the built output — the deploy step cannot execute if it fails. Coverage and Playwright reports are copied into the deployed site, so every release publishes its own test evidence at `/coverage/` and `/test-reports/`.

Workflows: [`.github/workflows/ci.yml`](.github/workflows/ci.yml) · [`.github/workflows/cd.yml`](.github/workflows/cd.yml)

### Change detection in practice

| A PR changes | Unit jobs | Browser tests |
|---|---|---|
| `src/cart.js` | `cart-unit` | `@cart` E2E, component, a11y and visual tests only |
| `src/views/home.js` | — | `@home` |
| `src/products.js` | `products-unit` | `@home` + `@shop` (product data feeds both) |
| `src/payment.js` | — (coverage still runs all unit tests) | `@checkout` |
| `package.json` | all three unit jobs | everything (shared/config path) |
| `README.md` | — | E2E and a11y jobs skipped; coverage (all unit tests) still runs |

## Design decisions and trade-offs

| Decision | Alternatives considered | Why this way |
|---|---|---|
| Hash routing | History API, multi-page app | Pages has no server rewrites; hash gives deep links, Back-button behavior and zero deploy config |
| Vanilla JS modules | React/Vue | Removes framework noise from both the tests and the CI runtime; keeps the playground focused on test engineering |
| Pure views + delegated events | View-local listeners | Views stay unit-testable; all DOM wiring lives in one place |
| Per-file coverage thresholds | Global thresholds | Global averages let a new untested file pass; per-file does not |
| Module tags for E2E selection | Run everything, or select by changed spec files | Targeted runs keep PR feedback fast; tags follow behavior, not file paths |
| a11y in its own chromium job | Part of the 3-browser matrix | Same signal at a third of the cost; page-level audits do not need three engines |
| Smoke test gating deploy | Rely on E2E against the dev server | Only the built artefact catches base-path/asset breakage before it ships |
| Pinned font stack | System font stack | Removes cross-environment layout drift from visual tests (1017px vs 977px) |
| Local SVG assets | placehold.co / CDN images | No third-party runtime dependency; CI and users see byte-identical pages |
| Simulated payment with explicit TEST MODE messaging | Fake it silently | Keeps the demo honest without giving up the realistic UX |

## Known limitations and next steps

- Expiry validation checks format and month range, not that the date is in the future; there is no Luhn check. The demo does not need them, but a production store would.
- The component layer renders committed markup fragments; if the views change, those fixtures must be updated by hand (the real coverage lives in unit view tests and E2E).
- The a11y audits run the WCAG A/AA rule set only; axe best-practice rules are not enabled.
- The next architectural step — kept deliberately out of this repo for now — is moving E2E and visual tests into a separate test repository and triggering them cross-repo on module changes via a reusable workflow, mirroring how larger organisations decouple test suites from the app repo.

## How this repo was built

The application code was built with AI assistance. The test strategy, automation architecture, and CI/CD pipeline were designed and implemented by me — that's the part this repo is meant to demonstrate.

## Author

**Rio Anggara Pratama** — Senior SDET, 10+ years in QA engineering.

- LinkedIn: [linkedin.com/in/rio-anggara](https://www.linkedin.com/in/rio-anggara/)
- GitHub: [@rio-ap](https://github.com/rio-ap)

## License

MIT — see [LICENSE](LICENSE).

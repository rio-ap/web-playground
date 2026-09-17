let flyingImage = null;
let toastHideTimer = null;

export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function bumpCart() {
  if (prefersReducedMotion()) return;
  const cartBadge = document.querySelector('[data-testid="cart-badge"]');
  const cartToggle = document.querySelector('[data-testid="cart-toggle-btn"]');
  cartBadge.animate(
    [{ transform: 'scale(1)' }, { transform: 'scale(1.5)' }, { transform: 'scale(1)' }],
    { duration: 450, easing: 'cubic-bezier(0.3, 1.6, 0.5, 1)' }
  );
  const cartIcon = cartToggle.querySelector('svg');
  if (cartIcon) {
    cartIcon.animate(
      [
        { transform: 'rotate(0deg)' },
        { transform: 'rotate(-12deg)' },
        { transform: 'rotate(9deg)' },
        { transform: 'rotate(-4deg)' },
        { transform: 'rotate(0deg)' },
      ],
      { duration: 500, easing: 'ease' }
    );
  }
}

export function flyToCart(imgEl) {
  if (prefersReducedMotion()) return;
  if (flyingImage) {
    flyingImage.remove();
    flyingImage = null;
  }
  const cartToggle = document.querySelector('[data-testid="cart-toggle-btn"]');
  const imgRect = imgEl.getBoundingClientRect();
  const cartRect = cartToggle.getBoundingClientRect();
  const clone = imgEl.cloneNode(true);
  clone.style.cssText = `position:fixed;left:${imgRect.left}px;top:${imgRect.top}px;width:${imgRect.width}px;height:${imgRect.height}px;border-radius:12px;z-index:50;pointer-events:none;`;
  document.body.appendChild(clone);
  flyingImage = clone;
  const dx = cartRect.left + cartRect.width / 2 - (imgRect.left + imgRect.width / 2);
  const dy = cartRect.top + cartRect.height / 2 - (imgRect.top + imgRect.height / 2);
  const animation = clone.animate(
    [
      { transform: 'translate(0, 0) scale(1)', opacity: 1 },
      { transform: `translate(${dx * 0.5}px, ${dy * 0.5 - 60}px) scale(0.5)`, opacity: 1, offset: 0.6 },
      { transform: `translate(${dx}px, ${dy}px) scale(0.08)`, opacity: 0.2 },
    ],
    { duration: 650, easing: 'cubic-bezier(0.2, 0.7, 0.3, 1)' }
  );
  const cleanup = () => {
    clone.remove();
    if (flyingImage === clone) flyingImage = null;
  };
  animation.onfinish = () => {
    cleanup();
    bumpCart();
  };
  animation.oncancel = cleanup;
}

export function showToast(message) {
  const toast = document.querySelector('[data-testid="toast"]');
  toast.textContent = message;
  if (toastHideTimer) clearTimeout(toastHideTimer);
  toast.getAnimations().forEach((animation) => animation.cancel());

  if (prefersReducedMotion()) {
    toast.style.opacity = '1';
    toastHideTimer = setTimeout(() => {
      toast.style.opacity = '0';
    }, 1800);
    return;
  }

  toast.animate(
    [
      { opacity: 0, transform: 'translateY(8px)' },
      { opacity: 1, transform: 'translateY(0)' },
    ],
    { duration: 200, easing: 'ease-out', fill: 'forwards' }
  );
  toastHideTimer = setTimeout(() => {
    toast.animate(
      [
        { opacity: 1, transform: 'translateY(0)' },
        { opacity: 0, transform: 'translateY(-4px)' },
      ],
      { duration: 250, easing: 'ease-in', fill: 'forwards' }
    );
  }, 1800);
}

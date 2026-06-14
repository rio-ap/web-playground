export function addItem(cart, product) {
  const existing = cart.find((item) => item.product.id === product.id);
  if (existing) {
    return cart.map((item) =>
      item.product.id === product.id
        ? { ...item, quantity: item.quantity + 1 }
        : item,
    );
  }
  return [...cart, { product, quantity: 1 }];
}

export function removeItem(cart, productId) {
  return cart.filter((item) => item.product.id !== productId);
}

export function updateQuantity(cart, productId, quantity) {
  if (quantity <= 0) return removeItem(cart, productId);
  return cart.map((item) =>
    item.product.id === productId ? { ...item, quantity } : item,
  );
}

export function getSubtotal(cart) {
  return cart.reduce((total, item) => total + item.product.price * item.quantity, 0);
}

export function getItemCount(cart) {
  return cart.reduce((total, item) => total + item.quantity, 0);
}
